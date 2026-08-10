import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { category_name: 'asc' },
    });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_name, description } = req.body;
    const existing = await prisma.category.findUnique({ where: { category_name } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Category already exists' });
      return;
    }
    const category = await prisma.category.create({ data: { category_name, description } });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    const category = await prisma.category.update({
      where: { category_id: parseInt(id) },
      data: { category_name, description },
    });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { category_id: parseInt(id) } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};
