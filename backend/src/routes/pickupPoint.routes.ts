import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const where: any = {};
    if (req.query.eventId) where.eventId = req.query.eventId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.pickupPoint.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.pickupPoint.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const point = await prisma.pickupPoint.findUnique({ where: { id: req.params.id }, include: { _count: { select: { reservations: true } } } });
    if (!point) throw new AppError('Pickup point not found', 404);
    res.json(point);
  } catch (error) { next(error); }
});

router.post('/', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const point = await prisma.pickupPoint.create({ data: req.body });
    res.status(201).json(point);
  } catch (error) { next(error); }
});

router.put('/:id', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const point = await prisma.pickupPoint.update({ where: { id: req.params.id }, data: req.body });
    res.json(point);
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await prisma.pickupPoint.delete({ where: { id: req.params.id } });
    res.json({ message: 'Pickup point deleted' });
  } catch (error) { next(error); }
});

export default router;
