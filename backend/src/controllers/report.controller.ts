import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Admin dashboard summary report.
 */
export const getAdminReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalFactories,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingFactories,
      recentOrders,
      ordersByStatus,
      settlementSummary,
      totalPlatformCommission,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.buyer.count(),
      prisma.factory.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { payment_status: 'COMPLETED' },
      }),
      prisma.factory.count({ where: { approval_status: 'PENDING' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { order_date: 'desc' },
        include: {
          buyer: { include: { user: { select: { full_name: true } } } },
          payment: true,
          settlement: {
            include: { factory: { select: { factory_name: true } } },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['order_status'],
        _count: { order_id: true },
      }),
      // Total gross/commission/net across all factory settlements
      prisma.settlement.aggregate({
        _sum: { gross_amount: true, commission_amount: true, net_amount: true },
        where: { factory_id: { not: null } },
      }),
      // Platform commission = sum of all commission_amount
      prisma.settlement.aggregate({
        _sum: { commission_amount: true },
      }),
    ]);

    res.json({
      success: true,
      report: {
        totalUsers,
        totalBuyers,
        totalFactories,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        pendingFactories,
        recentOrders,
        ordersByStatus,
        settlementSummary: {
          totalFactoryGross: Number(settlementSummary._sum.gross_amount) || 0,
          totalFactoryCommission: Number(settlementSummary._sum.commission_amount) || 0,
          totalFactoryNet: Number(settlementSummary._sum.net_amount) || 0,
          totalPlatformCommission: Number(totalPlatformCommission._sum.commission_amount) || 0,
        },
      },
    });
  } catch (error) {
    console.error('GetAdminReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

/**
 * Factory-specific report.
 */
export const getFactoryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const factory = await prisma.factory.findUnique({ where: { user_id: req.user!.user_id } });
    if (!factory) {
      res.status(404).json({ success: false, message: 'Factory not found' });
      return;
    }

    const [totalProducts, topProducts, recentOrders, totalSales] = await Promise.all([
      prisma.product.count({ where: { factory_id: factory.factory_id } }),
      prisma.orderitem.groupBy({
        by: ['product_id'],
        where: { product: { factory_id: factory.factory_id } },
        _sum: { quantity: true, subtotal: true },
        _count: { order_item_id: true },
        orderBy: { _count: { order_item_id: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { orderitem: { some: { product: { factory_id: factory.factory_id } } } },
        take: 5,
        orderBy: { order_date: 'desc' },
        include: {
          buyer: { include: { user: { select: { full_name: true } } } },
          orderitem: { where: { product: { factory_id: factory.factory_id } }, include: { product: true } },
        },
      }),
      prisma.orderitem.aggregate({
        where: { product: { factory_id: factory.factory_id } },
        _sum: { subtotal: true },
      }),
    ]);

    // Enrich top products with names
    const enrichedTopProducts = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { product_id: tp.product_id },
          select: { product_name: true, image: true },
        });
        return { ...tp, product };
      })
    );

    res.json({
      success: true,
      report: {
        totalProducts,
        topProducts: enrichedTopProducts,
        recentOrders,
        totalSales: Number(totalSales._sum.subtotal) || 0,
      },
    });
  } catch (error) {
    console.error('GetFactoryReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate factory report' });
  }
};
