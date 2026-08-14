import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

/**
 * Register a new user (Buyer, Factory, or Admin).
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, phone_number, role, address, factory_name, location } = req.body;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        phone_number,
        role: role || 'BUYER',
      },
    });

    // Create role-specific profile
    if (role === 'BUYER' || !role) {
      await prisma.buyer.create({
        data: { user_id: user.user_id, address: address || null },
      });
    } else if (role === 'FACTORY') {
      await prisma.factory.create({
        data: {
          user_id: user.user_id,
          factory_name: factory_name || full_name,
          location: location || 'Kombolcha',
          approval_status: 'PENDING',
        },
      });
    } else if (role === 'ADMIN') {
      await prisma.admin.create({
        data: { user_id: user.user_id, permission_level: 'FULL' },
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        ...(role === 'FACTORY' ? { approval_status: 'PENDING' } : {}),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

/**
 * Login with email and password.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Get role-specific profile id
    let profileId: number | null = null;
    let extraData: Record<string, unknown> = {};

    if (user.role === 'BUYER') {
      const buyer = await prisma.buyer.findUnique({ where: { user_id: user.user_id } });
      profileId = buyer?.buyer_id ?? null;
    } else if (user.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({ where: { user_id: user.user_id } });
      profileId = factory?.factory_id ?? null;
      extraData = {
        factory_name: factory?.factory_name,
        approval_status: factory?.approval_status,
      };
    } else if (user.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({ where: { user_id: user.user_id } });
      profileId = admin?.admin_id ?? null;
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profile_id: profileId,
        ...extraData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Get current authenticated user profile.
 */
export const getMe = async (req: Request & { user?: { user_id: number } }, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user!.user_id },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone_number: true,
        role: true,
        created_at: true,
        buyer: true,
        factory: true,
        admin: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};
