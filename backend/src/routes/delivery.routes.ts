import { Router } from 'express';
import {
  assignDeliveryDriver,
  deleteDeliveryDriver,
  deleteDeliveryZone,
  getDeliverySettings,
  getDeliveryTowns,
  getOrderDeliveries,
  quoteDelivery,
  saveDeliveryDriver,
  saveDeliveryZone,
  updateDeliveryStatus,
  updateFactoryDeliverySettings,
} from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/towns', authenticate, authorize('BUYER'), getDeliveryTowns);
router.post('/quote', authenticate, authorize('BUYER'), quoteDelivery);

router.get(
  '/settings',
  authenticate,
  authorize('ADMIN', 'FACTORY'),
  getDeliverySettings
);
router.put(
  '/settings',
  authenticate,
  authorize('FACTORY'),
  updateFactoryDeliverySettings
);

router.post(
  '/zones',
  authenticate,
  authorize('ADMIN', 'FACTORY'),
  saveDeliveryZone
);
router.delete(
  '/zones/:id',
  authenticate,
  authorize('ADMIN', 'FACTORY'),
  deleteDeliveryZone
);

router.post('/drivers', authenticate, authorize('ADMIN'), saveDeliveryDriver);
router.put(
  '/drivers/:id',
  authenticate,
  authorize('ADMIN'),
  saveDeliveryDriver
);
router.delete(
  '/drivers/:id',
  authenticate,
  authorize('ADMIN'),
  deleteDeliveryDriver
);

router.get(
  '/orders',
  authenticate,
  authorize('ADMIN', 'FACTORY'),
  getOrderDeliveries
);
router.put(
  '/orders/:id/driver',
  authenticate,
  authorize('ADMIN'),
  assignDeliveryDriver
);
router.put(
  '/orders/:id/status',
  authenticate,
  authorize('ADMIN', 'FACTORY'),
  updateDeliveryStatus
);

export default router;
