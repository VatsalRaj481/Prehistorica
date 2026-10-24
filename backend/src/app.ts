import './dns-init.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();

const allowedOrigins = [
  'https://prehistorica.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * 🛡️ Defense-in-Depth Guard Middleware (CVE-2026-111497 / Node2Shell)
 * Rejects incoming requests with Brotli ('br' / 'brotli') content encoding with HTTP 415.
 * Prevents exploitation of bundled Node.js Brotli decoder vulnerabilities prior to container runtime redeployments.
 */
export const rejectBrotliContentEncoding = (req: Request, res: Response, next: NextFunction) => {
  const contentEncoding = req.headers['content-encoding'];
  if (contentEncoding) {
    const encodingHeader = Array.isArray(contentEncoding)
      ? contentEncoding.join(', ')
      : contentEncoding;

    if (/\b(br|brotli)\b/i.test(encodingHeader)) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        code: 'BROTLI_ENCODING_REJECTED',
        message: 'Brotli-encoded request payloads are temporarily disallowed due to security mitigation (CVE-2026-111497). Please send uncompressed or gzip-encoded request bodies.'
      });
    }
  }
  next();
};

app.use(rejectBrotliContentEncoding);

// Body parser
app.use(express.json());

// Register API routes
app.use('/api', apiRouter);
app.use('/', apiRouter);

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
