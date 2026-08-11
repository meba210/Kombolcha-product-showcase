import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllFactories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const factories = await prisma.factory.findMany({
      where: { approval_status: 'APPROVED' },
      include: {
        user: { select: { full_name: true, email: true, phone_number: true } },
        _count: { select: { product: true } },
      },
      orderBy: { factory_name: 'asc' },
    });
    res.json({ success: true, factories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch factories' });
  }
};

export const getFactoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const factory = await prisma.factory.findUnique({
      where: { factory_id: parseInt(id) },
      include: {
        user: { select: { full_name: true, email: true, phone_number: true } },
        products: {
          where: { availability_status: 'AVAILABLE' },
          include: { category: true },
          take: 12,
        },
      },
    });
    if (!factory) {
      res.status(404).json({ success: false, message: 'Factory not found' });
      return;
    }
    res.json({ success: true, factory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch factory' });
  }
};

export const approveFactory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    const factory = await prisma.factory.update({
      where: { factory_id: parseInt(id) },
      data: { approval_status },
    });
    res.json({ success: true, message: `Factory ${approval_status.toLowerCase()}`, factory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update factory status' });
  }
};

export const getPendingFactories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const factories = await prisma.factory.findMany({
      where: { approval_status: 'PENDING' },
      include: { user: { select: { full_name: true, email: true, phone_number: true } } },
    });
    res.json({ success: true, factories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending factories' });
  }
};

export const updateFactoryProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { factory_name, location } = req.body;
    const factory = await prisma.factory.findUnique({ where: { user_id: req.user!.user_id } });
    if (!factory) {
      res.status(404).json({ success: false, message: 'Factory not found' });
      return;
    }
    const updated = await prisma.factory.update({
      where: { factory_id: factory.factory_id },
      data: { factory_name, location },
    });
    res.json({ success: true, factory: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update factory profile' });
  }
};
