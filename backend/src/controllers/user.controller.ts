import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        select: {
          user_id: true,
          full_name: true,
          email: true,
          phone_number: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { full_name, phone_number, address } = req.body;

    const user = await prisma.user.update({
      where: { user_id: req.user!.user_id },
      data: { full_name, phone_number },
      select: { user_id: true, full_name: true, email: true, phone_number: true, role: true },
    });

    if (req.user!.role === 'BUYER' && address !== undefined) {
      await prisma.buyer.update({
        where: { user_id: req.user!.user_id },
        data: { address },
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { user_id: parseInt(id) } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
