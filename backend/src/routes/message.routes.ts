import { Router } from 'express';
import { sendMessage, getConversation, getInbox, getUnreadCount } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);
router.get('/inbox', getInbox);
router.get('/unread', getUnreadCount);
router.get('/conversation/:user_id', getConversation);

export default router;
