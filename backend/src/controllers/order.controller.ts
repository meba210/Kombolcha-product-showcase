import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Place an order from the buyer's cart.
 */
export const placeOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { user_id: req.user!.user_id },
    });
    if (!buyer) {
      res
        .status(404)
        .json({ success: false, message: 'Buyer profile not found' });
      return;
    }

    const cart = (await prisma.cart.findFirst({
      where: { buyer_id: buyer.buyer_id },
      include: { cartitem: { include: { product: true } } },
    })) as any;

    if (!cart || cart.cartitem.length === 0) {
      res.status(400).json({ success: false, message: 'Cart is empty' });
      return;
    }

    // Validate stock for all items
    for (const item of cart.cartitem) {
      if (item.product.stock_quantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.product_name}`,
        });
        return;
      }
    }

    const totalAmount = Number(cart.total_price);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyer_id: buyer.buyer_id,
          total_amount: totalAmount,
          order_status: 'PENDING',
          orderitem: {
            create: cart.cartitem.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product.price,
              subtotal: item.subtotal,
            })),
          },
        },
        include: { orderitem: { include: { product: true } } },
      });

      // Deduct stock
      for (const item of cart.cartitem) {
        await tx.product.update({
          where: { product_id: item.product_id },
          data: { stock_quantity: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartitem.deleteMany({ where: { cart_id: cart.cart_id } });
      await tx.cart.update({
        where: { cart_id: cart.cart_id },
        data: { total_price: 0 },
      });

      return newOrder;
    });

    res
      .status(201)
      .json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('PlaceOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

/**
 * Get orders for the authenticated buyer.
 */
export const getBuyerOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { user_id: req.user!.user_id },
    });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyer_id: buyer.buyer_id },
      include: {
        orderitem: {
          include: {
            product: {
              include: { factory: { select: { factory_name: true } } },
            },
          },
        },
        payment: true,
      },
      orderBy: { order_date: 'desc' },
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('GetBuyerOrders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * Get all orders (Admin) or factory-specific orders (Factory).
 */
export const getAllOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (status) where.order_status = status;

    if (req.user!.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!factory) {
        res.status(404).json({ success: false, message: 'Factory not found' });
        return;
      }
      where.orderitem = {
        some: { product: { factory_id: factory.factory_id } },
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          buyer: {
            include: { user: { select: { full_name: true, email: true } } },
          },
          orderitem: { include: { product: true } },
          payment: true,
        },
        orderBy: { order_date: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('GetAllOrders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * Update order status (Factory or Admin).
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(id) },
    });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { order_id: parseInt(id) },
      data: { order_status },
      include: { orderitem: { include: { product: true } }, payment: true },
    });

    res.json({
      success: true,
      message: 'Order status updated',
      order: updated,
    });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update order status' });
  }
};

/**
 * Get single order by ID.
 */
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(id) },
      include: {
        buyer: {
          include: {
            user: {
              select: { full_name: true, email: true, phone_number: true },
            },
          },
        },
        orderitem: {
          include: {
            product: {
              include: {
                factory: { select: { factory_name: true } },
                category: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};
