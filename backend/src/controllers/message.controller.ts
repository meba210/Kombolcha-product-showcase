import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Send a message to another user.
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiver_id, message_content } = req.body;

    const receiver = await prisma.user.findUnique({ where: { user_id: parseInt(receiver_id) } });
    if (!receiver) {
      res.status(404).json({ success: false, message: 'Receiver not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        sender_id: req.user!.user_id,
        receiver_id: parseInt(receiver_id),
        message_content,
        message_status: 'UNREAD',
      },
      include: {
        sender: { select: { full_name: true, email: true, role: true } },
        receiver: { select: { full_name: true, email: true, role: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/**
 * Get conversation between current user and another user.
 */
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user!.user_id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: parseInt(user_id) },
          { sender_id: parseInt(user_id), receiver_id: currentUserId },
        ],
      },
      include: {
        sender: { select: { full_name: true, role: true } },
        receiver: { select: { full_name: true, role: true } },
      },
      orderBy: { send_date: 'asc' },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        sender_id: parseInt(user_id),
        receiver_id: currentUserId,
        message_status: 'UNREAD',
      },
      data: { message_status: 'READ' },
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('GetConversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

/**
 * Get all conversations (inbox) for the current user.
 */
export const getInbox = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.user_id;

    // Get unique conversation partners
    const sent = await prisma.message.findMany({
      where: { sender_id: userId },
      select: { receiver_id: true },
      distinct: ['receiver_id'],
    });
    const received = await prisma.message.findMany({
      where: { receiver_id: userId },
      select: { sender_id: true },
      distinct: ['sender_id'],
    });

    const partnerIds = new Set([
      ...sent.map((m) => m.receiver_id),
      ...received.map((m) => m.sender_id),
    ]);

    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const partner = await prisma.user.findUnique({
          where: { user_id: partnerId },
          select: { user_id: true, full_name: true, email: true, role: true },
        });

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { sender_id: userId, receiver_id: partnerId },
              { sender_id: partnerId, receiver_id: userId },
            ],
          },
          orderBy: { send_date: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: { sender_id: partnerId, receiver_id: userId, message_status: 'UNREAD' },
        });

        return { partner, lastMessage, unreadCount };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.send_date ?? new Date(0);
      const dateB = b.lastMessage?.send_date ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('GetInbox error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inbox' });
  }
};

/**
 * Get unread message count.
 */
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.message.count({
      where: { receiver_id: req.user!.user_id, message_status: 'UNREAD' },
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};
