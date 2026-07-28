import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

router.get('/stats', authController.getStats);
router.get('/', authController.listUsers);
router.delete('/:id', authController.deleteUser);

export default router;
