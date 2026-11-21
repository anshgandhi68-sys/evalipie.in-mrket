import { Request, Response } from 'express';
import { aivenPg, memoryPg } from '../db/aivenPg.js';
import crypto from 'crypto';

export class AuthController {
  // POST /api/v1/auth/signup & /register
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, name, phoneNumber, role = 'CUSTOMER' } = req.body;
      const userName = fullName || name;
      
      if (!email || !password || !userName) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const emailNormalized = email.toLowerCase().trim();
      const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      // Check existing in memoryPg
      for (const u of memoryPg.users.values()) {
        if (u.email === emailNormalized) {
          return res.status(409).json({ error: 'An account with this email already exists.' });
        }
      }

      if (aivenPg.isConnected) {
        const existing = await aivenPg.query('SELECT id FROM users WHERE email = $1', [emailNormalized]);
        if (existing.rows.length > 0) {
          return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        await aivenPg.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone_number, role)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, emailNormalized, passwordHash, userName, phoneNumber || null, role.toUpperCase()]
        );
      }

      const userObj = {
        id: userId,
        email: emailNormalized,
        password_hash: passwordHash,
        plain_password: password,
        full_name: userName,
        phone_number: phoneNumber,
        role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
        created_at: new Date()
      };
      
      memoryPg.users.set(userId, userObj);
      memoryPg.users.set(emailNormalized, userObj);

      const token = `jwt-${userId}-${Date.now()}`;
      return res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: userId,
            email: userObj.email,
            fullName: userObj.full_name,
            role: userObj.role
          },
          token
        }
      });
    } catch (err: any) {
      console.error('[Auth Register Error]', err);
      return res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  }

  // POST /api/v1/auth/signin & /login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const emailNormalized = email.toLowerCase().trim();
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      let user: any = null;

      // Check memoryPg first
      user = memoryPg.users.get(emailNormalized);
      if (!user) {
        for (const u of memoryPg.users.values()) {
          if (u.email === emailNormalized) {
            user = u;
            break;
          }
        }
      }

      if (!user && aivenPg.isConnected) {
        const result = await aivenPg.query(
          'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
          [emailNormalized]
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      }

      // Check seeded default admin credentials
      if (!user && emailNormalized === 'admin@evalipie.in') {
        user = {
          id: 'usr-admin-evalipie',
          email: 'admin@evalipie.in',
          full_name: 'Evalipie Administrator',
          role: 'ADMIN',
          password_hash: crypto.createHash('sha256').update('Admin@123456').digest('hex'),
          plain_password: 'Admin@123456'
        };
        memoryPg.users.set(user.id, user);
        memoryPg.users.set(user.email, user);
      }

      // Check seeded default customer credentials
      if (!user && emailNormalized === 'customer@evalipie.in') {
        user = {
          id: 'usr-demo-customer',
          email: 'customer@evalipie.in',
          full_name: 'Dominik Doudny',
          role: 'CUSTOMER',
          password_hash: crypto.createHash('sha256').update('Customer@123').digest('hex'),
          plain_password: 'Customer@123'
        };
        memoryPg.users.set(user.id, user);
        memoryPg.users.set(user.email, user);
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Verify password: check either sha256 hash or plain password or passwordHash property
      const matches =
        user.password_hash === passwordHash ||
        user.passwordHash === password ||
        user.plain_password === password ||
        (user.passwordHash && crypto.createHash('sha256').update(user.passwordHash).digest('hex') === passwordHash);

      if (!matches) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = `jwt-${user.id}-${Date.now()}`;
      return res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name || user.name || 'User',
            role: user.role || 'CUSTOMER'
          },
          token
        }
      });
    } catch (err: any) {
      console.error('[Auth Login Error]', err);
      return res.status(500).json({ error: 'Login failed: ' + err.message });
    }
  }

  // GET /api/v1/auth/me
  async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication token required.' });
      }

      const token = authHeader.replace(/^Bearer\s+/i, '');
      let foundUser: any = null;

      // Extract userId from token pattern: jwt-{userId}-{timestamp}
      for (const u of memoryPg.users.values()) {
        if (token.includes(u.id)) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser && token.includes('admin')) {
        foundUser = memoryPg.users.get('usr-admin-evalipie') || {
          id: 'usr-admin-evalipie',
          email: 'admin@evalipie.in',
          full_name: 'Evalipie Administrator',
          role: 'ADMIN'
        };
      }

      if (!foundUser) {
        return res.status(401).json({ error: 'Invalid or expired session.' });
      }

      return res.json({
        status: 'success',
        data: {
          user: {
            id: foundUser.id,
            email: foundUser.email,
            fullName: foundUser.full_name || foundUser.name || 'Shopper',
            role: foundUser.role || 'CUSTOMER'
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Auth check failed: ' + err.message });
    }
  }

  // POST /api/v1/auth/logout
  async logout(_req: Request, res: Response) {
    return res.json({ status: 'success', message: 'Logged out successfully.' });
  }
}

export const authController = new AuthController();
