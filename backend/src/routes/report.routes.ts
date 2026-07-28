import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

router.get('/daily', reportController.getDaily);
router.get('/weekly', reportController.getWeekly);
router.get('/monthly', reportController.getMonthly);
router.get('/routes', reportController.getRouteAnalytics);
router.get('/trips-per-day', reportController.getTripsPerDay);
router.get('/driver-performance', reportController.getDriverPerformance);
router.get('/vehicle-usage', reportController.getVehicleUsage);
router.get('/occupancy', reportController.getOccupancyStats);

export default router;
