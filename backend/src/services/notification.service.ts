import prisma from '../config/database';

export class NotificationService {
  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { data, total, unreadCount, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async create(data: { type: string; title: string; message: string; userId: string }) {
    return prisma.notification.create({ data: data as any });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  }
}

export const notificationService = new NotificationService();
