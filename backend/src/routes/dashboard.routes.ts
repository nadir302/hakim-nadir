import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('SUPER_ADMIN'), dashboardController.getAdminStats);

router.get('/driver', authorize('DRIVER'), dashboardController.getDriverStats);
router.get('/participant', authorize('EMPLOYEE'), dashboardController.getParticipantStats);

export default router;
