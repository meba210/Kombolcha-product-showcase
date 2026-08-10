import { Router } from 'express';
import { getRecommendations, logSearch } from '../controllers/recommendation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('BUYER'), getRecommendations);
router.post('/log', authenticate, authorize('BUYER'), logSearch);

export default router;
