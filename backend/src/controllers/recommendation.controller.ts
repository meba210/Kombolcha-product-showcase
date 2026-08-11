import { Response } from 'express';
import axios from 'axios';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Get AI-powered product recommendations for the authenticated buyer.
 * Falls back to popular products if AI service is unavailable.
 */
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    // Get buyer's search history
    const searchHistory = await prisma.searchhistory.findMany({
      where: { buyer_id: buyer.buyer_id },
      orderBy: { search_date: 'desc' },
      take: 20,
    });

    let recommendedProducts;

    try {
      // Call Python AI service
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/recommend`,
        {
          buyer_id: buyer.buyer_id,
          search_history: searchHistory.map((h) => ({
            keyword: h.search_keyword,
            category: h.viewed_category,
          })),
        },
        { timeout: 5000 }
      );

      const productIds: number[] = aiResponse.data.product_ids || [];

      if (productIds.length > 0) {
        recommendedProducts = await prisma.product.findMany({
          where: {
            product_id: { in: productIds },
            availability_status: 'AVAILABLE',
          },
          include: {
            factory: { select: { factory_name: true } },
            category: { select: { category_name: true } },
          },
        });

        // Save recommendations to DB
        await prisma.airecommendation.createMany({
          data: productIds.map((pid) => ({
            buyer_id: buyer.buyer_id,
            product_id: pid,
            recommended_category: aiResponse.data.category || null,
          })),
          skipDuplicates: true,
        });
      }
    } catch (aiError) {
      console.warn('AI service unavailable, falling back to popular products');
    }

    // Fallback: popular products based on order frequency
    if (!recommendedProducts || recommendedProducts.length === 0) {
      const popular = await prisma.orderitem.groupBy({
        by: ['product_id'],
        _count: { product_id: true },
        orderBy: { _count: { product_id: 'desc' } },
        take: 8,
      });

      const popularIds = popular.map((p) => p.product_id);

      recommendedProducts = await prisma.product.findMany({
        where: {
          product_id: popularIds.length > 0 ? { in: popularIds } : undefined,
          availability_status: 'AVAILABLE',
        },
        include: {
          factory: { select: { factory_name: true } },
          category: { select: { category_name: true } },
        },
        take: 8,
        orderBy: { created_at: 'desc' },
      });
    }

    res.json({ success: true, recommendations: recommendedProducts });
  } catch (error) {
    console.error('GetRecommendations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};

/**
 * Log a search/view event for the buyer.
 */
export const logSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search_keyword, viewed_category } = req.body;

    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    await prisma.searchhistory.create({
      data: {
        buyer_id: buyer.buyer_id,
        search_keyword,
        viewed_category: viewed_category || null,
      },
    });

    res.json({ success: true, message: 'Search logged' });
  } catch (error) {
    console.error('LogSearch error:', error);
    res.status(500).json({ success: false, message: 'Failed to log search' });
  }
};
