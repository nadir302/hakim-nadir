import { reservationService } from '../services/reservation.service';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    reservation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(),
}));

import prisma from '../config/database';
import jwt from 'jsonwebtoken';

describe('ReservationService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('generateQrToken', () => {
    it('should generate a valid JWT token', () => {
      const reservation = { id: '1', reservationCode: 'SHR-ABC123', eventId: 'e1', participantId: 'p1', date: new Date() };
      const token = reservationService.generateQrToken(reservation);
      expect(token).toBe('mock-jwt-token');
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('validateQrToken', () => {
    it('should return valid for a correct token', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: '1', code: 'SHR-ABC' });
      const result = reservationService.validateQrToken('valid-token');
      expect(result.valid).toBe(true);
    });

    it('should return EXPIRED for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { const e = new Error('expired'); (e as any).name = 'TokenExpiredError'; throw e; });
      const result = reservationService.validateQrToken('expired-token');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('EXPIRED');
    });

    it('should return INVALID for malformed token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
      const result = reservationService.validateQrToken('bad-token');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('INVALID');
    });
  });

  describe('validateScan', () => {
    it('should return VALID for a valid scan', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'r1', code: 'SHR-ABC', eventId: 'e1', participantId: 'p1' });
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        id: 'r1', reservationCode: 'SHR-ABC', status: 'CONFIRMED',
        event: { name: 'Test Event' }, trip: { id: 't1' },
      });
      (prisma.reservation.update as jest.Mock).mockResolvedValue({});
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const result = await reservationService.validateScan('valid-token', { lat: 40.71, lng: -74.00, device: 'scanner-1' });
      expect(result.status).toBe('VALID');
    });

    it('should return ALREADY_USED for checked-in reservation', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'r1', code: 'SHR-ABC' });
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        id: 'r1', status: 'CHECKED_IN', event: {}, trip: {},
      });

      const result = await reservationService.validateScan('used-token');
      expect(result.status).toBe('ALREADY_USED');
    });
  });
});
