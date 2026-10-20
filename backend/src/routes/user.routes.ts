import { Router } from 'express';
import { getAllUsers, updateProfile, deleteUser, updateUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/profile', authenticate, updateProfile);
router.put('/:id/status', authenticate, authorize('ADMIN'), updateUserStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
