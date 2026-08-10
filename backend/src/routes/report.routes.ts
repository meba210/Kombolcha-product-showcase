import { Router } from 'express';
import { getAdminReport, getFactoryReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), getAdminReport);
router.get('/factory', authenticate, authorize('FACTORY'), getFactoryReport);

export default router;
