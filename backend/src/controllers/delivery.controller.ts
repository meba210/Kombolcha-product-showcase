import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getAvailableDeliveryTowns,
  getBuyerCartItems,
  getDeliveryQuote,
} from '../lib/delivery.service';

const validTown = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= 100;

const validFee = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1000000;

const getFactory = (userId: number) =>
  prisma.factory.findUnique({ where: { user_id: userId } });

export const getDeliveryTowns = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await getBuyerCartItems(req.user!.user_id);
    const towns = await getAvailableDeliveryTowns(items);
    res.json({ success: true, towns });
  } catch (error: any) {
    const status = error.message === 'CART_EMPTY' ? 400 : 404;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const quoteDelivery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { town, address } = req.body;
  if (
    !validTown(town) ||
    typeof address !== 'string' ||
    !address.trim() ||
    address.trim().length > 500
  ) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Enter a valid delivery town and address',
      });
    return;
  }

  try {
    const items = await getBuyerCartItems(req.user!.user_id);
    const quote = await getDeliveryQuote(items, town.trim(), address.trim());
    res.json({ success: true, quote });
  } catch (error: any) {
    const status = error.message === 'CART_EMPTY' ? 400 : 404;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getDeliverySettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user!.role === 'ADMIN') {
      const [zones, drivers] = await Promise.all([
        prisma.deliveryzone.findMany({
          include: { factory: { select: { factory_name: true } } },
          orderBy: [{ provider_type: 'asc' }, { town: 'asc' }],
        }),
        prisma.deliverydriver.findMany({ orderBy: { full_name: 'asc' } }),
      ]);
      res.json({ success: true, zones, drivers });
      return;
    }

    const factory = await getFactory(req.user!.user_id);
    if (!factory) {
      res.status(404).json({ success: false, message: 'Factory not found' });
      return;
    }
    const zones = await prisma.deliveryzone.findMany({
      where: { factory_id: factory.factory_id },
      orderBy: { town: 'asc' },
    });
    res.json({
      success: true,
      settings: { uses_own_delivery: factory.uses_own_delivery },
      zones,
    });
  } catch (error) {
    console.error('GetDeliverySettings error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch delivery settings' });
  }
};

export const updateFactoryDeliverySettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { uses_own_delivery } = req.body;
  if (typeof uses_own_delivery !== 'boolean') {
    res
      .status(400)
      .json({ success: false, message: 'uses_own_delivery must be a boolean' });
    return;
  }

  try {
    const factory = await prisma.factory.findUnique({
      where: { user_id: req.user!.user_id },
    });
    if (!factory) {
      res.status(404).json({ success: false, message: 'Factory not found' });
      return;
    }
    const updated = await prisma.factory.update({
      where: { factory_id: factory.factory_id },
      data: { uses_own_delivery },
      select: { uses_own_delivery: true },
    });
    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error('UpdateFactoryDeliverySettings error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update delivery settings' });
  }
};

export const saveDeliveryZone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const town = typeof req.body.town === 'string' ? req.body.town.trim() : '';
  const fee = req.body.fee;
  const isActive = req.body.is_active !== false;
  if (!validTown(town) || !validFee(fee)) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Enter a valid town and a non-negative delivery fee',
      });
    return;
  }

  try {
    let factoryId: number | null = null;
    let providerKey = 'platform';
    let providerType = 'PLATFORM';

    if (req.user!.role === 'FACTORY') {
      const factory = await getFactory(req.user!.user_id);
      if (!factory) {
        res.status(404).json({ success: false, message: 'Factory not found' });
        return;
      }
      if (!factory.uses_own_delivery) {
        res
          .status(400)
          .json({
            success: false,
            message:
              'Enable your own delivery service before managing its rates',
          });
        return;
      }
      factoryId = factory.factory_id;
      providerKey = `factory:${factory.factory_id}`;
      providerType = 'FACTORY';
    }

    const zone = await prisma.deliveryzone.upsert({
      where: { provider_key_town: { provider_key: providerKey, town } },
      create: {
        provider_key: providerKey,
        provider_type: providerType,
        factory_id: factoryId,
        town,
        fee,
        is_active: isActive,
      },
      update: { fee, is_active: isActive },
    });
    res.json({ success: true, zone });
  } catch (error) {
    console.error('SaveDeliveryZone error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save delivery zone' });
  }
};

export const deleteDeliveryZone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const zoneId = Number(req.params.id);
    if (!Number.isInteger(zoneId) || zoneId < 1) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid delivery zone' });
      return;
    }

    const where =
      req.user!.role === 'ADMIN'
        ? { delivery_zone_id: zoneId, provider_key: 'platform' }
        : { delivery_zone_id: zoneId, factory: { user_id: req.user!.user_id } };
    const result = await prisma.deliveryzone.deleteMany({ where });
    if (!result.count) {
      res
        .status(404)
        .json({ success: false, message: 'Delivery zone not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('DeleteDeliveryZone error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete delivery zone' });
  }
};

export const saveDeliveryDriver = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { full_name, phone_number } = req.body;
  if (
    typeof full_name !== 'string' ||
    !full_name.trim() ||
    full_name.trim().length > 120 ||
    (phone_number != null &&
      (typeof phone_number !== 'string' || phone_number.length > 40))
  ) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Enter a valid driver name and phone number',
      });
    return;
  }

  try {
    const driverId = req.params.id ? Number(req.params.id) : null;
    const data = {
      full_name: full_name.trim(),
      phone_number: phone_number?.trim() || null,
    };
    const driver = driverId
      ? await prisma.deliverydriver.update({
          where: { delivery_driver_id: driverId },
          data,
        })
      : await prisma.deliverydriver.create({ data });
    res.json({ success: true, driver });
  } catch (error) {
    console.error('SaveDeliveryDriver error:', error);
    res.status(500).json({ success: false, message: 'Failed to save driver' });
  }
};

export const deleteDeliveryDriver = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const driverId = Number(req.params.id);
    if (!Number.isInteger(driverId) || driverId < 1) {
      res.status(400).json({ success: false, message: 'Invalid driver' });
      return;
    }
    await prisma.deliverydriver.update({
      where: { delivery_driver_id: driverId },
      data: { is_active: false },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('DeleteDeliveryDriver error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to deactivate driver' });
  }
};

export const getOrderDeliveries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const where =
      req.user!.role === 'ADMIN'
        ? {}
        : { factory: { user_id: req.user!.user_id } };
    const deliveries = await prisma.orderdelivery.findMany({
      where,
      include: {
        order: {
          select: {
            order_id: true,
            order_date: true,
            buyer: {
              include: {
                user: { select: { full_name: true, phone_number: true } },
              },
            },
          },
        },
        factory: { select: { factory_name: true } },
        driver: true,
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    const drivers =
      req.user!.role === 'ADMIN'
        ? await prisma.deliverydriver.findMany({
            where: { is_active: true },
            orderBy: { full_name: 'asc' },
          })
        : [];
    res.json({ success: true, deliveries, drivers });
  } catch (error) {
    console.error('GetOrderDeliveries error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch deliveries' });
  }
};

export const assignDeliveryDriver = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const driverId =
    req.body.driver_id === null ? null : Number(req.body.driver_id);
  if (driverId !== null && (!Number.isInteger(driverId) || driverId < 1)) {
    res.status(400).json({ success: false, message: 'Invalid driver' });
    return;
  }
  try {
    if (driverId !== null) {
      const driver = await prisma.deliverydriver.findFirst({
        where: { delivery_driver_id: driverId, is_active: true },
      });
      if (!driver) {
        res
          .status(404)
          .json({ success: false, message: 'Active driver not found' });
        return;
      }
    }
    const deliveryId = Number(req.params.id);
    const deliveryExists = await prisma.orderdelivery.findFirst({
      where: { order_delivery_id: deliveryId, provider_type: 'PLATFORM' },
    });
    if (!deliveryExists) {
      res
        .status(404)
        .json({ success: false, message: 'Platform delivery not found' });
      return;
    }
    const delivery = await prisma.orderdelivery.update({
      where: { order_delivery_id: deliveryId },
      data: {
        driver_id: driverId,
        status: driverId === null ? 'PENDING' : 'ASSIGNED',
      },
    });
    res.json({ success: true, delivery });
  } catch (error) {
    console.error('AssignDeliveryDriver error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to assign driver' });
  }
};

export const updateDeliveryStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const allowedStatuses = [
    'PENDING',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
  ];
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    res
      .status(400)
      .json({ success: false, message: 'Invalid delivery status' });
    return;
  }
  try {
    const deliveryId = Number(req.params.id);
    const where =
      req.user!.role === 'ADMIN'
        ? { order_delivery_id: deliveryId }
        : {
            order_delivery_id: deliveryId,
            factory: { user_id: req.user!.user_id },
          };
    const result = await prisma.orderdelivery.updateMany({
      where,
      data: { status },
    });
    if (!result.count) {
      res.status(404).json({ success: false, message: 'Delivery not found' });
      return;
    }
    const delivery = await prisma.orderdelivery.findUnique({
      where: { order_delivery_id: deliveryId },
    });
    res.json({ success: true, delivery });
  } catch (error) {
    console.error('UpdateDeliveryStatus error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update delivery status' });
  }
};
