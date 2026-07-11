import { Router } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

healthRouter.get('/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const status = dbReady ? 200 : 503;
  res.status(status).json({
    success: dbReady,
    data: {
      status: dbReady ? 'ready' : 'not_ready',
      db: dbReady ? 'connected' : 'disconnected',
      requestId: req.requestId,
    },
  });
});
