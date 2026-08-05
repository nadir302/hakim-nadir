import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { generateQrToken } from '../utils/jwt';

export class TicketService {
  async getTicket(reservationId: string, userId: string, role: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        participant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        event: { select: { id: true, name: true, date: true, startTime: true, endTime: true, address: true, latitude: true, longitude: true } },
        pickupPoint: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
        trip: {
          include: {
            driver: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
            vehicle: { select: { id: true, busNumber: true, plateNumber: true, capacity: true, model: true } },
            route: { select: { id: true, name: true, origin: true, destination: true, originLat: true, originLng: true, destinationLat: true, destinationLng: true } },
          },
        },
      },
    });

    if (!reservation) throw new AppError('Reservation not found', 404);

    if (role !== 'SUPER_ADMIN' && reservation.participantId !== userId) {
      throw new AppError('Access denied', 403);
    }

    let qrCode = reservation.qrCode;
    if (!qrCode && reservation.status !== 'CANCELLED' && reservation.status !== 'REJECTED') {
      qrCode = generateQrToken({
        sub: reservation.id,
        code: reservation.reservationCode,
        eventId: reservation.eventId,
        participantId: reservation.participantId,
        date: reservation.date,
      });
      await prisma.reservation.update({ where: { id: reservation.id }, data: { qrCode } });
    }

    return {
      id: reservation.id,
      reservationCode: reservation.reservationCode,
      qrCode,
      status: reservation.status,
      date: reservation.date,
      time: reservation.time,
      passengerCount: reservation.passengerCount,
      contactPhone: reservation.contactPhone,
      notes: reservation.notes,
      createdAt: reservation.createdAt,
      participant: reservation.participant,
      event: reservation.event,
      pickupPoint: reservation.pickupPoint,
      trip: reservation.trip ? {
        id: reservation.trip.id,
        name: reservation.trip.name,
        departureTime: reservation.trip.departureTime,
        arrivalTime: reservation.trip.arrivalTime,
        status: reservation.trip.status,
        driver: reservation.trip.driver,
        vehicle: reservation.trip.vehicle,
        route: reservation.trip.route,
      } : null,
    };
  }
}

export const ticketService = new TicketService();