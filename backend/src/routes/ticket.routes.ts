import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { ticketController } from '../controllers/ticket.controller';

const router = Router();

router.use(authenticate);
router.get('/:id', ticketController.getTicket);

export default router;