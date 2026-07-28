import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    event: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    driver: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    vehicle: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    trip: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    reservation: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), groupBy: jest.fn() },
    trackingLog: { create: jest.fn(), findMany: jest.fn() },
    notification: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
    route: { findMany: jest.fn(), findUnique: jest.fn() },
    pickupPoint: { findMany: jest.fn() },
    activityLog: { create: jest.fn(), findMany: jest.fn() },
    systemLog: { create: jest.fn() },
    chatMessage: { findMany: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $disconnect: jest.fn(),
  },
}));

describe('API Health', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('API Routes', () => {
  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
