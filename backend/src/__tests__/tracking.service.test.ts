import { trackingService } from '../services/tracking.service';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    trip: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    trackingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    vehicle: {
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    pickupPoint: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../services/socket.service', () => ({
  emitToTrip: jest.fn(),
  emitToUser: jest.fn(),
}));

import prisma from '../config/database';

describe('TrackingService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('haversine distance', () => {
    it('should calculate distance correctly', () => {
      const dist = (trackingService as any).haversineDistance(40.7128, -74.006, 40.7580, -73.9855);
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(10);
    });

    it('should return 0 for same coordinates', () => {
      const dist = (trackingService as any).haversineDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(dist).toBe(0);
    });
  });

  describe('calculateProgress', () => {
    const trip = {
      route: {
        originLat: 40.7128, originLng: -74.006,
        destinationLat: 40.7580, destinationLng: -73.9855,
      },
      tripProgress: 0,
    };

    it('should return 0 when at origin', () => {
      const progress = (trackingService as any).calculateProgress(trip, 40.7128, -74.006);
      expect(progress).toBe(0);
    });
  });

  describe('getActiveShuttles', () => {
    it('should return active trips', async () => {
      const mockTrips = [{ id: '1', status: 'IN_PROGRESS', vehicle: {}, driver: {}, route: {}, _count: { reservations: 5 } }];
      (prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips);

      const result = await trackingService.getActiveShuttles();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no active trips', async () => {
      (prisma.trip.findMany as jest.Mock).mockResolvedValue([]);
      const result = await trackingService.getActiveShuttles();
      expect(result).toHaveLength(0);
    });
  });
});
