import { Response } from 'express';
import axios from 'axios';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_TOP_N = 8;
const MAX_TOP_N = 100;

const readOptionalId = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

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
    const currentSearch = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (
      req.query.only_search_history === 'true' &&
      searchHistory.length === 0 &&
      !currentSearch
    ) {
      res.json({
        success: true,
        recommendations: [],
        based_on_search_history: false,
      });
      return;
    }

    const categoryId = readOptionalId(req.query.category_id);
    const factoryId = readOptionalId(req.query.factory_id);
    const requestedTopN = readOptionalId(req.query.top_n);
    if (req.query.category_id !== undefined && !categoryId) {
      res.status(400).json({ success: false, message: 'category_id must be a positive integer' });
      return;
    }
    if (req.query.factory_id !== undefined && !factoryId) {
      res.status(400).json({ success: false, message: 'factory_id must be a positive integer' });
      return;
    }
    if (req.query.top_n !== undefined && !requestedTopN) {
      res.status(400).json({ success: false, message: 'top_n must be a positive integer' });
      return;
    }
    const configuredTopN = Number(process.env.RECOMMENDATION_TOP_N || DEFAULT_TOP_N);
    const topN = Math.min(
      Math.max(1, requestedTopN || configuredTopN || DEFAULT_TOP_N),
      MAX_TOP_N
    );
    const productFilters = {
      availability_status: 'AVAILABLE' as const,
      stock_quantity: { gt: 0 },
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(factoryId ? { factory_id: factoryId } : {}),
    };

    let recommendedProducts;

    try {
      // Call Python AI service
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/recommend`,
        {
          buyer_id: buyer.buyer_id,
          // An active product search must be ranked against that search alone.
          // Use saved search history only when requesting general personalized
          // recommendations without a current query.
          search_history: currentSearch
            ? [{ keyword: currentSearch, category: null }]
            : searchHistory.map((h) => ({
                keyword: h.search_keyword,
                category: h.viewed_category,
              })),
          category_filter: categoryId,
          factory_filter: factoryId,
          top_n: topN,
        },
        { timeout: 30000 }
      );

      const productIds: number[] = Array.isArray(aiResponse.data.product_ids)
        ? aiResponse.data.product_ids.filter((id: unknown): id is number => Number.isInteger(id))
        : [];

      if (productIds.length > 0) {
        recommendedProducts = await prisma.product.findMany({
          where: {
            product_id: { in: productIds },
            ...productFilters,
          },
          include: {
            factory: { select: { factory_name: true } },
            category: { select: { category_name: true } },
          },
        });

        // Prisma does not preserve the order of an `in` filter. Restore the
        // hybrid model's ranking before returning products to the client.
        const productsById = new Map(
          recommendedProducts.map((product) => [product.product_id, product])
        );
        recommendedProducts = productIds.flatMap((productId) => {
          const product = productsById.get(productId);
          return product ? [product] : [];
        }).slice(0, topN);

        // Save recommendations to DB
        await prisma.airecommendation.createMany({
          data: recommendedProducts.map((product) => ({
            buyer_id: buyer.buyer_id,
            product_id: product.product_id,
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
        take: topN,
      });

      const popularIds = popular.map((p) => p.product_id);

      recommendedProducts = await prisma.product.findMany({
        where: {
          product_id: popularIds.length > 0 ? { in: popularIds } : undefined,
          ...productFilters,
        },
        include: {
          factory: { select: { factory_name: true } },
          category: { select: { category_name: true } },
        },
        take: topN,
        orderBy: { created_at: 'desc' },
      });

      if (recommendedProducts.length === 0 && popularIds.length > 0) {
        recommendedProducts = await prisma.product.findMany({
          where: productFilters,
          include: {
            factory: { select: { factory_name: true } },
            category: { select: { category_name: true } },
          },
          take: topN,
          orderBy: { created_at: 'desc' },
        });
      }

    }

    res.json({
      success: true,
      recommendations: recommendedProducts,
      based_on_search_history: searchHistory.length > 0 || currentSearch.length > 0,
    });
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
