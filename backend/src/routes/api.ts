import { Router } from 'express';
import { getSpecies, getSpeciesById, getCreatureOfTheDay } from '../controllers/species.js';

const router = Router();

router.get('/species', getSpecies);
router.get('/species/creature-of-the-day', getCreatureOfTheDay); // Placed before /:id to prevent routing clash
router.get('/species/:id', getSpeciesById);

export default router;
