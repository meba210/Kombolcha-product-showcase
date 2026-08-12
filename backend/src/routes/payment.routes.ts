import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  getAllPayments,
  chapaCallback,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/initialize', authenticate, authorize('BUYER'), initializePayment);
router.get('/callback', chapaCallback);
router.post('/callback', chapaCallback);
router.get('/verify/:tx_ref', authenticate, verifyPayment);
router.get('/', authenticate, authorize('ADMIN'), getAllPayments);

export default router;
