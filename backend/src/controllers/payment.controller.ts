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
const CHAPA_CALLBACK_URL =
  process.env.CHAPA_CALLBACK_URL || `${SERVER_URL}/api/payments/callback`;

const chapaHeaders = () => ({
  Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

const validateChapaKeys = (res: Response): boolean => {
  if (!CHAPA_SECRET_KEY || !CHAPA_PUBLIC_KEY) {
    res.status(500).json({
      success: false,
      message:
        'Chapa API keys are not configured. Please set CHAPA_SECRET_KEY and CHAPA_PUBLIC_KEY in .env',
    });
    return false;
  }
  return true;
};

/**
 * Initialize a Chapa payment for an order.
 */
export const initializePayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { order_id } = req.body;

    const buyer = await prisma.buyer.findUnique({
      where: { user_id: req.user!.user_id },
      include: { user: true },
    });
    if (!buyer) {
      res.status(404).json({ success: false, message: 'Buyer not found' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(order_id) },
    });
    if (!order || order.buyer_id !== buyer.buyer_id) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    if (order.order_status !== 'PENDING') {
      res
        .status(400)
        .json({ success: false, message: 'Order is not in pending state' });
      return;
    }

    const txRef = `TX-${uuidv4()}`;

    // Initialize Chapa payment
    if (!validateChapaKeys(res)) return;

    const chapaResponse = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      {
        amount: Number(order.total_amount).toFixed(2),
        currency: 'ETB',
        email: buyer.user.email,
        first_name: buyer.user.full_name.split(' ')[0],
        last_name: buyer.user.full_name.split(' ').slice(1).join(' ') || 'N/A',
        tx_ref: txRef,
        callback_url: CHAPA_CALLBACK_URL,
        return_url: `${CLIENT_URL}/orders/${order_id}`,
        customization: {
          title: 'AI Showcase Platform',
          description: `Payment for Order #${order_id}`,
        },
      },
      {
        headers: chapaHeaders(),
      }
    );

    // Create pending payment record
    await prisma.payment.create({
      data: {
        order_id: parseInt(order_id),
        amount: order.total_amount,
        payment_status: 'PENDING',
        transaction_reference: txRef,
        settlement_status: 'UNSETTLED',
        payment_method: 'CHAPA',
      },
    });

    res.json({
      success: true,
      checkout_url: chapaResponse.data.data.checkout_url,
      tx_ref: txRef,
    });
  } catch (error) {
    console.error('InitializePayment error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to initialize payment' });
  }
};

/**
 * Verify a Chapa payment by transaction reference.
 */
export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { tx_ref } = req.params;

    if (!validateChapaKeys(res)) return;

    const chapaResponse = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
      {
        headers: chapaHeaders(),
      }
    );

    const chapaData = chapaResponse.data;

    const payment = await prisma.payment.findUnique({
      where: { transaction_reference: tx_ref },
    });
    if (!payment) {
      res
        .status(404)
        .json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (chapaData.data?.status === 'success') {
      await prisma.payment.update({
        where: { transaction_reference: tx_ref },
        data: { payment_status: 'COMPLETED', settlement_status: 'SETTLED' },
      });
      await prisma.order.update({
        where: { order_id: payment.order_id },
        data: { order_status: 'CONFIRMED' },
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        status: 'COMPLETED',
      });
    } else {
      await prisma.payment.update({
        where: { transaction_reference: tx_ref },
        data: { payment_status: 'FAILED' },
      });
      res.json({
        success: false,
        message: 'Payment not completed',
        status: chapaData.data?.status,
      });
    }
  } catch (error) {
    console.error('VerifyPayment error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to verify payment' });
  }
};

/**
 * Chapa callback endpoint used by the payment gateway.
 */
export const chapaCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tx_ref = req.query.tx_ref as string;
    if (!tx_ref) {
      res.status(400).json({ success: false, message: 'tx_ref is required' });
      return;
    }

    if (!validateChapaKeys(res)) return;

    const chapaResponse = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
      {
        headers: chapaHeaders(),
      }
    );

    const chapaData = chapaResponse.data;
    const payment = await prisma.payment.findUnique({
      where: { transaction_reference: tx_ref },
    });
    if (!payment) {
      res
        .status(404)
        .json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (chapaData.data?.status === 'success') {
      await prisma.payment.update({
        where: { transaction_reference: tx_ref },
        data: { payment_status: 'COMPLETED', settlement_status: 'SETTLED' },
      });
      await prisma.order.update({
        where: { order_id: payment.order_id },
        data: { order_status: 'CONFIRMED' },
      });
    } else {
      await prisma.payment.update({
        where: { transaction_reference: tx_ref },
        data: { payment_status: 'FAILED' },
      });
    }

    const order = await prisma.order.findUnique({
      where: { order_id: payment.order_id },
    });
    const redirectUrl = order
      ? `${CLIENT_URL}/orders/${order.order_id}`
      : CLIENT_URL;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('ChapaCallback error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to process Chapa callback' });
  }
};

/**
 * Get all payments (Admin).
 */
export const getAllPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (status) where.payment_status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          order: {
            include: {
              buyer: {
                include: { user: { select: { full_name: true, email: true } } },
              },
            },
          },
        },
        orderBy: { payment_date: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('GetAllPayments error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch payments' });
  }
};
