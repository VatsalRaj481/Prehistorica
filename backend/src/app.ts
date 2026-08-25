import './dns-init.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // For development simplicity, allow all. In production, we'd limit this.
}));

// Body parser
app.use(express.json());

// Register API routes
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || String(err)
  });
});

export default app;
