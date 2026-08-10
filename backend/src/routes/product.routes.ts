import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFactoryProducts,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('FACTORY', 'ADMIN'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('FACTORY', 'ADMIN'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize('FACTORY', 'ADMIN'), deleteProduct);
router.get('/factory/my', authenticate, authorize('FACTORY'), getFactoryProducts);
router.get('/factory/:factory_id', getFactoryProducts);

export default router;
