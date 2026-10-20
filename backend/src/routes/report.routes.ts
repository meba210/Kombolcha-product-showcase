import { Router } from 'express';
import { getAdminReport, getFactoryReport, getPublicHighlights } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), getAdminReport);
router.get('/factory', authenticate, authorize('FACTORY'), getFactoryReport);
// Public — used by the homepage hero card (no auth required)
router.get('/highlights', getPublicHighlights);

export default router;
