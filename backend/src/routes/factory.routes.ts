import { Router } from 'express';
import {
  getAllFactories,
  getFactoryById,
  approveFactory,
  getPendingFactories,
  getAdminFactories,
  updateFactoryProfile,
} from '../controllers/factory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllFactories);
router.get('/manage', authenticate, authorize('ADMIN'), getAdminFactories);
router.get('/pending', authenticate, authorize('ADMIN'), getPendingFactories);
router.get('/:id', getFactoryById);
router.put('/profile', authenticate, authorize('FACTORY'), updateFactoryProfile);
router.put('/:id/approve', authenticate, authorize('ADMIN'), approveFactory);

export default router;
