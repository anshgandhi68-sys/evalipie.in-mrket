import { Request, Response } from 'express';
import { aivenPg, memoryPg } from '../db/aivenPg.js';
import crypto from 'crypto';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, phoneNumber } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required.' });
      }

      const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      if (aivenPg.isConnected) {
        const existing = await aivenPg.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
          return res.status(409).json({ error: 'User with this email already exists.' });
        }

        await aivenPg.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone_number, role)
           VALUES ($1, $2, $3, $4, $5, 'CUSTOMER')`,
          [userId, email.toLowerCase(), passwordHash, fullName, phoneNumber || null]
        );
      }

      const userObj = {
        id: userId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'CUSTOMER',
        created_at: new Date()
      };
      memoryPg.users.set(userId, userObj);

      const token = `jwt-${userId}-${Date.now()}`;
      return res.status(201).json({
        status: 'success',
        data: {
          user: { id: userId, email: userObj.email, fullName: userObj.full_name, role: userObj.role },
          token
        }
      });
    } catch (err: any) {
      console.error('[Auth Error]', err);
      return res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      let user: any = null;
      if (aivenPg.isConnected) {
        const result = await aivenPg.query(
          'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
          [email.toLowerCase()]
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      }

      if (!user) {
        for (const u of memoryPg.users.values()) {
          if (u.email === email.toLowerCase()) {
            user = u;
            break;
          }
        }
      }

      if (!user || user.password_hash !== passwordHash) {
        // Return demo credentials if test login
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = `jwt-${user.id}-${Date.now()}`;
      return res.json({
        status: 'success',
        data: {
          user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
          token
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Login failed: ' + err.message });
    }
  }
}

export const authController = new AuthController();
