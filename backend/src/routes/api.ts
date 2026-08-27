import { Router, Request, Response } from 'express';
import { getSpecies, getSpeciesById, getCreatureOfTheDay, searchAutocomplete, compareSpecies } from '../controllers/species.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/species', getSpecies);
router.get('/species/creature-of-the-day', getCreatureOfTheDay);
router.get('/species/feature/creature-of-the-day', getCreatureOfTheDay);
router.get('/species/search/autocomplete', searchAutocomplete);
router.get('/species/compare', compareSpecies);
router.get('/species/:id', getSpeciesById);

export default router;


