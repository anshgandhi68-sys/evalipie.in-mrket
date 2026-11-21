import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { apiRouter } from './routes/apiRoutes.js';
import { outboxService } from './services/outboxService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.raw({ type: 'audio/*', limit: '25mb' }));

// API Routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    product: 'EVALIPIE',
    tagline: 'Every Shop. One Intelligent Marketplace.',
    domain: 'evalipie.in',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if exists
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Evalipie API Server is running. Client build in progress.');
    }
  });
});

// Create HTTP server
const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 EVALIPIE SERVER STARTED`);
  console.log(`🌐 HTTP API:       http://localhost:${config.port}/api/v1`);
  console.log(`📦 Outbox Relay:   ACTIVE (Topic distribution enabled)`);
  console.log(`======================================================\n`);
});
