import { Router } from 'express';
import { getBuyerOrders, getAllOrders, updateOrderStatus, getOrderById } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticate, authorize('BUYER'), getBuyerOrders);
router.get('/', authenticate, authorize('ADMIN', 'FACTORY'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('ADMIN', 'FACTORY'), updateOrderStatus);

export default router;
