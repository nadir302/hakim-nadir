import prisma from '../config/database';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

export class DriverService {
  async findAll(params: { page?: number; limit?: number; search?: string; availability?: boolean }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { user: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.search, mode: 'insensitive' } } },
        { licenseNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.availability !== undefined) where.availability = params.availability;

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
          vehicle: true,
          _count: { select: { trips: true } },
        },
      }),
      prisma.driver.count({ where }),
    ]);

    return { data: drivers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
        vehicle: true,
        trips: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { route: true, vehicle: true, _count: { select: { reservations: true } } },
        },
      },
    });
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  async create(data: { firstName: string; lastName: string; email: string; phone: string; licenseNumber: string; address?: string; password?: string }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create user in Supabase Auth
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password || 'Driver@123',
        email_confirm: true,
        user_metadata: { firstName: data.firstName, lastName: data.lastName, role: 'DRIVER' },
      });
      if (error) throw new AppError(error.message, 400);

      // Create user in local DB
      const user = await prisma.user.create({
        data: {
          authId: authData.user!.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'DRIVER',
        },
      });
      userId = user.id;
    }

    // Create driver record
    return prisma.driver.create({
      data: {
        userId,
        licenseNumber: data.licenseNumber,
        phone: data.phone,
        address: data.address,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
        vehicle: true,
      },
    });
  }

  async update(id: string, data: any) {
    const driver = await prisma.driver.findUnique({ where: { id }, include: { user: true } });
    if (!driver) throw new AppError('Driver not found', 404);

    // Update user profile if name/email changed
    if (data.firstName || data.lastName || data.email) {
      await prisma.user.update({
        where: { id: driver.userId },
        data: { firstName: data.firstName, lastName: data.lastName, email: data.email },
      });
    }

    // Update driver record
    return prisma.driver.update({
      where: { id },
      data: {
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        address: data.address,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
        vehicle: true,
      },
    });
  }

  async delete(id: string) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new AppError('Driver not found', 404);

    // Delete from Supabase Auth
    if (driver.userId) {
      const user = await prisma.user.findUnique({ where: { id: driver.userId } });
      if (user?.authId) {
        await supabase.auth.admin.deleteUser(user.authId).catch(() => {});
      }
    }

    // Delete driver and user records
    await prisma.driver.delete({ where: { id } });
    await prisma.user.delete({ where: { id: driver.userId } }).catch(() => {});
  }

  async getTodayTrips(driverId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trips = await prisma.trip.findMany({
      where: {
        driverId,
        date: { gte: today },
      },
      orderBy: { departureTime: 'asc' },
      include: {
        route: { include: { stops: { orderBy: { order: 'asc' } } } },
        vehicle: true,
        _count: { select: { reservations: true } },
        reservations: {
          include: { participant: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    return trips;
  }
}

export const driverService = new DriverService();
