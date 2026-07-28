import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async findAll(params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true, status: true,
          createdAt: true, updatedAt: true,
          driverProfile: { include: { vehicle: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, status: true,
        createdAt: true, updatedAt: true,
        driverProfile: { include: { vehicle: true } },
        _count: { select: { reservations: true, notifications: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async update(id: string, data: any) {
    const { password, role, ...safe } = data;
    const user = await prisma.user.update({ where: { id }, data: safe }).catch(() => {
      throw new AppError('User not found', 404);
    });
    return user;
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } }).catch(() => {
      throw new AppError('User not found', 404);
    });
  }

  async getStats() {
    const [total, admins, drivers, organizers, employees, active] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      prisma.user.count({ where: { role: 'DRIVER' } }),
      prisma.user.count({ where: { role: 'ORGANIZER' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { total, admins, drivers, organizers, employees, active };
  }
}

export const userService = new UserService();
