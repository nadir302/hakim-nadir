import { Router } from 'express';
import { tripController } from '../controllers/trip.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/active', tripController.getActiveTrips);
router.get('/', tripController.findAll);
router.get('/:id', tripController.findById);
router.post('/', authorize('SUPER_ADMIN'), tripController.create);
router.put('/:id', authorize('SUPER_ADMIN'), tripController.update);
router.delete('/:id', authorize('SUPER_ADMIN'), tripController.delete);
router.patch('/:id/start', authorize('SUPER_ADMIN', 'DRIVER'), tripController.startTrip);
router.patch('/:id/complete', authorize('SUPER_ADMIN', 'DRIVER'), tripController.completeTrip);
router.patch('/:id/delay', authorize('SUPER_ADMIN', 'DRIVER'), tripController.delayTrip);

export default router;
