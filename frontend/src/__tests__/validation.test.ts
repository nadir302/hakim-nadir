import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, eventSchema, routeSchema, pickupPointSchema } from '@/lib/validation';

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      firstName: 'John', lastName: 'Doe', email: 'john@example.com',
      password: 'StrongPass1', confirmPassword: 'StrongPass1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      firstName: 'John', lastName: 'Doe', email: 'john@example.com',
      password: 'StrongPass1', confirmPassword: 'DifferentPass1',
    });
    expect(result.success).toBe(false);
  });
});

describe('eventSchema', () => {
  it('accepts valid event data', () => {
    const result = eventSchema.safeParse({
      name: 'Test Event', date: '2026-08-15', startTime: '2026-08-15T09:00',
      endTime: '2026-08-15T17:00', address: '123 Main St', capacity: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = eventSchema.safeParse({
      name: 'AB', date: '2026-08-15', startTime: '2026-08-15T09:00',
      endTime: '2026-08-15T17:00', address: '123 Main St', capacity: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe('routeSchema', () => {
  it('accepts valid route with stops', () => {
    const result = routeSchema.safeParse({
      name: 'Test Route', origin: 'City A', destination: 'City B',
      eventId: 'e1', stops: [{ name: 'Stop 1', latitude: 33.5, longitude: -7.5, order: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it('defaults stops to empty array', () => {
    const result = routeSchema.safeParse({
      name: 'Test Route', origin: 'City A', destination: 'City B', eventId: 'e1',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.stops).toEqual([]);
  });
});

describe('pickupPointSchema', () => {
  it('accepts valid pickup point', () => {
    const result = pickupPointSchema.safeParse({
      name: 'Main Gate', latitude: 33.5, longitude: -7.5,
      maxCapacity: 50, eventId: 'e1',
    });
    expect(result.success).toBe(true);
  });
});
