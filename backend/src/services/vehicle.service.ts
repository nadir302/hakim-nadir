import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class VehicleService {
  async findAll(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { busNumber: { contains: params.search, mode: 'insensitive' } },
        { plateNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { driver: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
      }),
      prisma.vehicle.count({ where }),
    ]);
    return { data: vehicles, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { driver: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } } },
    });
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  }

  async create(data: any) { return prisma.vehicle.create({ data }); }
  async update(id: string, data: any) {
    return prisma.vehicle.update({ where: { id }, data }).catch(() => { throw new AppError('Vehicle not found', 404); });
  }
  async delete(id: string) {
    await prisma.vehicle.delete({ where: { id } }).catch(() => { throw new AppError('Vehicle not found', 404); });
  }

  async getAvailable() {
    return prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, include: { driver: true } });
  }
}

export const vehicleService = new VehicleService();
