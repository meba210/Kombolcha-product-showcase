import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  getAllPayments,
  getSettlements,
  getOrderSettlements,
  chapaCallback,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/initialize', authenticate, authorize('BUYER'), initializePayment);
router.get('/callback', chapaCallback);
router.post('/callback', chapaCallback);
router.get('/verify/:tx_ref', authenticate, verifyPayment);
// Admin: all payments list
router.get('/', authenticate, authorize('ADMIN'), getAllPayments);
// Admin: all settlement records (with optional filters)
router.get('/settlements', authenticate, authorize('ADMIN'), getSettlements);
// Admin/Factory: settlement breakdown for one order
router.get('/orders/:orderId/settlements', authenticate, authorize('ADMIN', 'FACTORY'), getOrderSettlements);

export default router;
