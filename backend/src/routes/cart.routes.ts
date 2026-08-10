import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('BUYER'));

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:item_id', updateCartItem);
router.delete('/item/:item_id', removeCartItem);
router.delete('/clear', clearCart);

export default router;
