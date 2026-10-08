import './dns-init.js';
import app from './app.js';
import dotenv from 'dotenv';
import { speciesCache } from './services/speciesCache.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);

  // Warm up in-memory species cache asynchronously on server boot
  try {
    await speciesCache.init();
  } catch (err) {
    console.warn('[Server] Initial cache warm-up deferred to first request:', err);
  }
});
