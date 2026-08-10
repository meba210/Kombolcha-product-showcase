import { Router } from 'express';
import { getAllUsers, updateProfile, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/profile', authenticate, updateProfile);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
