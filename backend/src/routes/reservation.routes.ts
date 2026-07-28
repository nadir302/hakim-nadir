import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my-reservations', reservationController.getMyReservations);
router.get('/stats', authorize('SUPER_ADMIN'), reservationController.getStats);
router.get('/', authorize('SUPER_ADMIN', 'DRIVER'), reservationController.findAll);
router.get('/:id', reservationController.findById);
router.post('/validate-qr', authorize('DRIVER', 'SUPER_ADMIN'), reservationController.validateQR);
router.post('/find-matches', reservationController.findMatches);
router.post('/join-trip', authorize('EMPLOYEE'), reservationController.joinTrip);
router.post('/', authorize('EMPLOYEE', 'SUPER_ADMIN', 'ORGANIZER'), reservationController.create);
router.put('/:id', authorize('SUPER_ADMIN'), reservationController.update);
router.put('/:id/cancel', reservationController.cancel);
router.post('/:id/approve', authorize('SUPER_ADMIN'), reservationController.approve);
router.post('/:id/reject', authorize('SUPER_ADMIN'), reservationController.reject);
router.get('/waiting-list/list', authorize('SUPER_ADMIN'), reservationController.getWaitingList);
router.get('/shared-pickups/list', authorize('SUPER_ADMIN'), reservationController.getSharedPickups);

export default router;
