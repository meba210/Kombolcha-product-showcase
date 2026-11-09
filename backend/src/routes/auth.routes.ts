import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequiredEmail } from '../middleware/email-validation.middleware';

const router = Router();

router.post('/register', validateRequiredEmail, register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
