import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get or create the active cart for the authenticated buyer.
 */
const getBuyerCart = async (buyerId: number) => {
  let cart = await prisma.cart.findFirst({
    where: { buyer_id: buyerId },
    include: {
      cartitem: {
        include: {
          product: {
            include: { factory: { select: { factory_name: true } }, category: true },
          },
        },
      },
    },
    orderBy: { created_date: 'desc' },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { buyer_id: buyerId, total_price: 0 },
      include: {
        cartitem: {
          include: {
            product: {
              include: { factory: { select: { factory_name: true } }, category: true },
            },
          },
        },
      },
    });
  }

  return cart;
};

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer profile not found' });
      return;
    }

    const cart = await getBuyerCart(buyer.buyer_id);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer profile not found' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { product_id: parseInt(product_id) } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    if (product.availability_status !== 'AVAILABLE') {
      res.status(400).json({ success: false, message: 'Product is not available' });
      return;
    }
    if (product.stock_quantity < parseInt(quantity)) {
      res.status(400).json({ success: false, message: 'Insufficient stock' });
      return;
    }

    let cart = await prisma.cart.findFirst({ where: { buyer_id: buyer.buyer_id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { buyer_id: buyer.buyer_id, total_price: 0 } });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartitem.findFirst({
      where: { cart_id: cart.cart_id, product_id: parseInt(product_id) },
    });

    const qty = parseInt(quantity);
    const subtotal = Number(product.price) * qty;

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      const newSubtotal = Number(product.price) * newQty;
      await prisma.cartitem.update({
        where: { cart_item_id: existingItem.cart_item_id },
        data: { quantity: newQty, subtotal: newSubtotal },
      });
    } else {
      await prisma.cartitem.create({
        data: {
          cart_id: cart.cart_id,
          product_id: parseInt(product_id),
          quantity: qty,
          subtotal,
        },
      });
    }

    // Recalculate cart total
    const allItems = await prisma.cartitem.findMany({ where: { cart_id: cart.cart_id } });
    const total = allItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await prisma.cart.update({ where: { cart_id: cart.cart_id }, data: { total_price: total } });

    const updatedCart = await getBuyerCart(buyer.buyer_id);
    res.json({ success: true, message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body;

    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    const cartItem = await prisma.cartitem.findUnique({
      where: { cart_item_id: parseInt(item_id) },
      include: { product: true, cart: true },
    });

    if (!cartItem || cartItem.cart.buyer_id !== buyer.buyer_id) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      await prisma.cartitem.delete({ where: { cart_item_id: parseInt(item_id) } });
    } else {
      const subtotal = Number(cartItem.product.price) * qty;
      await prisma.cartitem.update({
        where: { cart_item_id: parseInt(item_id) },
        data: { quantity: qty, subtotal },
      });
    }

    // Recalculate total
    const allItems = await prisma.cartitem.findMany({ where: { cart_id: cartItem.cart_id } });
    const total = allItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await prisma.cart.update({ where: { cart_id: cartItem.cart_id }, data: { total_price: total } });

    const updatedCart = await getBuyerCart(buyer.buyer_id);
    res.json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { item_id } = req.params;

    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    const cartItem = await prisma.cartitem.findUnique({
      where: { cart_item_id: parseInt(item_id) },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.buyer_id !== buyer.buyer_id) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    await prisma.cartitem.delete({ where: { cart_item_id: parseInt(item_id) } });

    const allItems = await prisma.cartitem.findMany({ where: { cart_id: cartItem.cart_id } });
    const total = allItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await prisma.cart.update({ where: { cart_id: cartItem.cart_id }, data: { total_price: total } });

    const updatedCart = await getBuyerCart(buyer.buyer_id);
    res.json({ success: true, message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    console.error('RemoveCartItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    const cart = await prisma.cart.findFirst({ where: { buyer_id: buyer.buyer_id } });
    if (cart) {
      await prisma.cartitem.deleteMany({ where: { cart_id: cart.cart_id } });
      await prisma.cart.update({ where: { cart_id: cart.cart_id }, data: { total_price: 0 } });
    }

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
