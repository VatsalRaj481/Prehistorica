import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  getSpecies, 
  getSpeciesById, 
  getCreatureOfTheDay, 
  searchAutocomplete, 
  compareSpecies, 
  getSpeciesRoster 
} from '../controllers/species.js';
import {
  curatorChat,
  fossilLens,
  simulateRunwayMatchup,
  semanticSearch,
  getFormationFoodWeb,
  getAiStatus
} from '../controllers/ai.js';

const router = Router();

// Free-tier safeguard: 12 requests per minute per IP for AI LLM endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'The Chief Curator docent queue is temporarily busy to stay within museum pavilion quotas. Please wait a few moments.'
  }
});

// Semantic search rate limiter (higher allowance since embedding has 1,500 RPM)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many search requests. Please slow down.'
  }
});

// Standard museum endpoints
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/species', getSpecies);
router.get('/species/roster', getSpeciesRoster);
router.get('/species/creature-of-the-day', getCreatureOfTheDay);
router.get('/species/feature/creature-of-the-day', getCreatureOfTheDay);
router.get('/species/search/autocomplete', searchAutocomplete);
router.get('/species/compare', compareSpecies);
router.get('/species/:id', getSpeciesById);

// 🏛️ AI Research Pavilion Endpoints
router.get('/ai/status', getAiStatus);
router.post('/ai/curator/chat', aiLimiter, curatorChat);
router.post('/ai/fossil-lens', aiLimiter, fossilLens);
router.post('/ai/runway/matchup', aiLimiter, simulateRunwayMatchup);
router.get('/ai/search/semantic', searchLimiter, semanticSearch);
router.get('/ai/formation/food-web', aiLimiter, getFormationFoodWeb);

export default router;
