import prisma from '../config/database';

export class ReportService {
  async getDailyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [trips, reservations, newUsers] = await Promise.all([
      prisma.trip.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } }, include: { route: true, driver: true, _count: { select: { reservations: true } } } }),
      prisma.reservation.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
    ]);

    return { date: startOfDay, trips: trips.length, reservations, newUsers, tripDetails: trips };
  }

  async getWeeklyReport() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [trips, reservations, newUsers, mostUsedRoutes] = await Promise.all([
      prisma.trip.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.reservation.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.trip.groupBy({ by: ['routeId'], _count: true, orderBy: { _count: { routeId: 'desc' } }, take: 5 }),
    ]);

    const routeDetails = await Promise.all(
      mostUsedRoutes.map(async (r) => {
        const route = await prisma.route.findUnique({ where: { id: r.routeId } });
        return { route: route?.name || 'Unknown', trips: r._count };
      })
    );

    return { period: 'weekly', trips, reservations, newUsers, mostUsedRoutes: routeDetails };
  }

  async getMonthlyReport() {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [trips, reservations, newUsers, occupancyRate] = await Promise.all([
      prisma.trip.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.reservation.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.calculateOccupancyRate(monthAgo),
    ]);

    return { period: 'monthly', trips, reservations, newUsers, occupancyRate };
  }

  private async calculateOccupancyRate(since: Date) {
    const trips = await prisma.trip.findMany({
      where: { createdAt: { gte: since } },
      include: { vehicle: true, _count: { select: { reservations: true } } },
    });

    if (!trips.length) return 0;
    const totalCapacity = trips.reduce((sum, t) => sum + (t.vehicle?.capacity || 0), 0);
    const totalPassengers = trips.reduce((sum, t) => sum + t._count.reservations, 0);
    return totalCapacity ? Math.round((totalPassengers / totalCapacity) * 100) : 0;
  }

  async getRouteAnalytics() {
    const routes = await prisma.route.findMany({
      include: {
        _count: { select: { trips: true } },
        trips: { include: { _count: { select: { reservations: true } } } },
      },
    });

    return routes.map((r) => ({
      id: r.id,
      name: r.name,
      totalTrips: r._count.trips,
      totalPassengers: r.trips.reduce((sum, t) => sum + t._count.reservations, 0),
      avgPassengersPerTrip: r._count.trips
        ? Math.round(r.trips.reduce((sum, t) => sum + t._count.reservations, 0) / r._count.trips)
        : 0,
    }));
  }

  async getTripsPerDay(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const raw = await prisma.$queryRaw`
      SELECT DATE("date") as day, COUNT(*)::int as trips,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END)::int as completed,
        SUM(CASE WHEN status = 'DELAYED' THEN 1 ELSE 0 END)::int as delayed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::int as cancelled
      FROM trips
      WHERE "date" >= ${since}
      GROUP BY DATE("date")
      ORDER BY day ASC
    `;
    return raw;
  }

  async getDriverPerformance() {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { trips: true } },
        trips: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
      },
      orderBy: { totalTrips: 'desc' },
      take: 20,
    });

    return drivers.map((d) => ({
      id: d.id,
      name: `${d.user.firstName} ${d.user.lastName}`,
      totalTrips: d._count.trips,
      completedTrips: d.trips.length,
      rating: d.rating,
      availability: d.availability,
    }));
  }

  async getVehicleUsage() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: { select: { trips: true } },
        driver: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { trips: { _count: 'desc' } },
    });

    return vehicles.map((v) => ({
      id: v.id,
      busNumber: v.busNumber,
      plateNumber: v.plateNumber,
      capacity: v.capacity,
      status: v.status,
      totalTrips: v._count.trips,
      driverName: v.driver ? `${v.driver.user.firstName} ${v.driver.user.lastName}` : 'Unassigned',
    }));
  }

  async getOccupancyStats() {
    const trips = await prisma.trip.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      include: { vehicle: true, _count: { select: { reservations: true } } },
    });

    const totalCapacity = trips.reduce((sum, t) => sum + (t.vehicle?.capacity || 0), 0);
    const totalPassengers = trips.reduce((sum, t) => sum + t._count.reservations, 0);
    const occupancyRate = totalCapacity ? Math.round((totalPassengers / totalCapacity) * 100) : 0;

    const byTrip = trips.map((t) => ({
      tripId: t.id,
      capacity: t.vehicle?.capacity || 0,
      passengers: t._count.reservations,
      occupancy: t.vehicle?.capacity ? Math.round((t._count.reservations / t.vehicle.capacity) * 100) : 0,
    }));

    return { occupancyRate, totalCapacity, totalPassengers, byTrip };
  }
}

export const reportService = new ReportService();
