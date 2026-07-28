import { Router } from 'express';
import { trackingController } from '../controllers/tracking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/active', authorize('SUPER_ADMIN'), trackingController.getActiveShuttles);
router.get('/driver/current', authorize('DRIVER'), trackingController.getDriverCurrentTrip);
router.get('/:tripId/history', trackingController.getTripHistory);
router.get('/:tripId/replay', authorize('SUPER_ADMIN'), trackingController.replayTrip);
router.post('/:tripId/location', authorize('DRIVER'), trackingController.updateLocation);
router.patch('/:tripId/status', authorize('DRIVER'), trackingController.changeTripStatus);

export default router;
