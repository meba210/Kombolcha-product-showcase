import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const CHAPA_CALLBACK_URL = process.env.CHAPA_CALLBACK_URL || `${SERVER_URL}/api/payments/callback`;

type CartSnapshotItem = { product_id: number; quantity: number; price: number; subtotal: number };

const chapaHeaders = () => ({ Authorization: `Bearer ${CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' });
const validateChapaKeys = (res: Response) => {
  if (CHAPA_SECRET_KEY && CHAPA_PUBLIC_KEY) return true;
  res.status(500).json({ success: false, message: 'Chapa API keys are not configured. Please set CHAPA_SECRET_KEY and CHAPA_PUBLIC_KEY in .env' });
  return false;
};

/** Commits the order only after Chapa has confirmed the transaction. */
const completePayment = async (txRef: string) => prisma.$transaction(async (tx) => {
  const attempt = await tx.paymentattempt.findUnique({ where: { transaction_reference: txRef } });
  if (!attempt) throw new Error('PAYMENT_ATTEMPT_NOT_FOUND');

  // Verification can be called by both Chapa and the return page. Keep it idempotent.
  if (attempt.payment_status === 'COMPLETED') {
    const payment = await tx.payment.findFirst({ where: { transaction_reference: txRef } });
    return { orderId: payment?.order_id, alreadyCompleted: true };
  }

  const items = attempt.cart_snapshot as unknown as CartSnapshotItem[];
  if (!Array.isArray(items) || items.length === 0) throw new Error('INVALID_PAYMENT_SNAPSHOT');

  // Atomically reserve stock at the point we actually accept payment.
  for (const item of items) {
    const result = await tx.product.updateMany({
      where: { product_id: item.product_id, stock_quantity: { gte: item.quantity } },
      data: { stock_quantity: { decrement: item.quantity } },
    });
    if (result.count !== 1) throw new Error('INSUFFICIENT_STOCK');
  }

  const order = await tx.order.create({
    data: {
      buyer_id: attempt.buyer_id,
      total_amount: attempt.amount,
      order_status: 'CONFIRMED',
      orderitem: { create: items.map((item) => ({ ...item })) },
      payment: { create: {
        amount: attempt.amount,
        payment_status: 'COMPLETED',
        transaction_reference: txRef,
        settlement_status: 'SETTLED',
        payment_method: 'CHAPA',
      } },
    },
  });

  await tx.paymentattempt.update({ where: { transaction_reference: txRef }, data: { payment_status: 'COMPLETED' } });

  // The cart may have changed while the buyer was at Chapa. Remove only the
  // quantities paid for and retain any newer items/quantities.
  const cart = await tx.cart.findFirst({ where: { buyer_id: attempt.buyer_id } });
  if (cart) {
    for (const item of items) {
      const cartItem = await tx.cartitem.findFirst({ where: { cart_id: cart.cart_id, product_id: item.product_id } });
      if (!cartItem) continue;
      if (cartItem.quantity <= item.quantity) {
        await tx.cartitem.delete({ where: { cart_item_id: cartItem.cart_item_id } });
      } else {
        const remainingQuantity = cartItem.quantity - item.quantity;
        await tx.cartitem.update({ where: { cart_item_id: cartItem.cart_item_id }, data: { quantity: remainingQuantity, subtotal: remainingQuantity * item.price } });
      }
    }
    const remaining = await tx.cartitem.findMany({ where: { cart_id: cart.cart_id } });
    await tx.cart.update({ where: { cart_id: cart.cart_id }, data: { total_price: remaining.reduce((sum, item) => sum + item.subtotal, 0) } });
  }
  return { orderId: order.order_id, alreadyCompleted: false };
});

const verifyWithChapa = async (txRef: string) => {
  const response = await axios.get(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, { headers: chapaHeaders() });
  return response.data?.data?.status === 'success';
};

/** Starts payment from a cart snapshot. No order, stock, or cart state is changed here. */
export const initializePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!validateChapaKeys(res)) return;
    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id }, include: { user: true } });
    if (!buyer) { res.status(404).json({ success: false, message: 'Buyer not found' }); return; }
    const cart = await prisma.cart.findFirst({ where: { buyer_id: buyer.buyer_id }, include: { cartitem: { include: { product: true } } } });
    if (!cart || cart.cartitem.length === 0) { res.status(400).json({ success: false, message: 'Cart is empty' }); return; }
    for (const item of cart.cartitem) {
      if (item.quantity < 1 || item.product.stock_quantity < item.quantity) {
        res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.product_name}` }); return;
      }
    }
    const snapshot: CartSnapshotItem[] = cart.cartitem.map((item) => ({ product_id: item.product_id, quantity: item.quantity, price: item.product.price, subtotal: item.product.price * item.quantity }));
    const amount = snapshot.reduce((sum, item) => sum + item.subtotal, 0);
    const txRef = `TX-${uuidv4()}`;
    await prisma.paymentattempt.create({ data: { buyer_id: buyer.buyer_id, amount, transaction_reference: txRef, cart_snapshot: snapshot } });
    const chapaResponse = await axios.post(`${CHAPA_BASE_URL}/transaction/initialize`, {
      amount: amount.toFixed(2), currency: 'ETB', email: buyer.user.email,
      first_name: buyer.user.full_name.split(' ')[0], last_name: buyer.user.full_name.split(' ').slice(1).join(' ') || 'N/A',
      tx_ref: txRef, callback_url: CHAPA_CALLBACK_URL,
      return_url: `${CLIENT_URL}/payment/result?tx_ref=${encodeURIComponent(txRef)}`,
      customization: { title: 'Product showcase', description: 'Payment for your cart' },
    }, { headers: chapaHeaders() });
    const checkoutUrl = chapaResponse.data?.data?.checkout_url;
    if (!checkoutUrl) throw new Error('Chapa did not return a checkout URL');
    res.json({ success: true, checkout_url: checkoutUrl, tx_ref: txRef });
  } catch (error: any) {
    console.error('InitializePayment error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Failed to initialize payment' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tx_ref: txRef } = req.params;
    if (!validateChapaKeys(res)) return;
    const attempt = await prisma.paymentattempt.findUnique({ where: { transaction_reference: txRef } });
    const buyer = await prisma.buyer.findUnique({ where: { user_id: req.user!.user_id } });
    if (!attempt || !buyer || attempt.buyer_id !== buyer.buyer_id) { res.status(404).json({ success: false, message: 'Payment not found' }); return; }
    if (attempt.payment_status === 'COMPLETED') { const done = await completePayment(txRef); res.json({ success: true, status: 'COMPLETED', order_id: done.orderId }); return; }
    if (!(await verifyWithChapa(txRef))) { res.json({ success: false, status: 'PENDING', message: 'Payment has not been completed yet' }); return; }
    const completed = await completePayment(txRef);
    res.json({ success: true, status: 'COMPLETED', order_id: completed.orderId });
  } catch (error: any) {
    console.error('VerifyPayment error:', error.message);
    res.status(400).json({ success: false, message: error.message === 'INSUFFICIENT_STOCK' ? 'An item sold out before payment completed. Your payment will be reviewed.' : 'Failed to verify payment' });
  }
};

/** Chapa's server callback has no user token, so it always verifies with Chapa first. */
export const chapaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const txRef = (req.query.tx_ref || req.body?.tx_ref) as string | undefined;
    if (!txRef) { res.status(400).json({ success: false, message: 'tx_ref is required' }); return; }
    if (!validateChapaKeys(res)) return;
    if (await verifyWithChapa(txRef)) await completePayment(txRef);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('ChapaCallback error:', error);
    res.status(500).json({ success: false, message: 'Failed to process Chapa callback' });
  }
};

export const getAllPayments = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = _req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: Record<string, unknown> = status ? { payment_status: status } : {};
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ where, skip, take: parseInt(limit as string), include: { order: { include: { buyer: { include: { user: { select: { full_name: true, email: true } } } } } } }, orderBy: { payment_date: 'desc' } }),
      prisma.payment.count({ where }),
    ]);
    res.json({ success: true, payments, pagination: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) { console.error('GetAllPayments error:', error); res.status(500).json({ success: false, message: 'Failed to fetch payments' }); }
};
