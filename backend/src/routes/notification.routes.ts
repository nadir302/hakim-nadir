import { Router } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.findByUser(req.user!.userId, page, limit);
    res.json(result);
  } catch (error) { next(error); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (error) { next(error); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await notificationService.delete(req.params.id, req.user!.userId);
    res.json({ message: 'Notification deleted' });
  } catch (error) { next(error); }
});

export default router;
