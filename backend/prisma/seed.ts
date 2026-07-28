import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@smartshuttle.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@smartshuttle.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@smartshuttle.com' },
    update: { password: hashedPassword },
    create: {
      email: 'driver@smartshuttle.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Driver',
      phone: '+1234567892',
      role: 'DRIVER',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  const participantUser = await prisma.user.upsert({
    where: { email: 'participant@smartshuttle.com' },
    update: { password: hashedPassword },
    create: {
      email: 'participant@smartshuttle.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Participant',
      phone: '+1234567893',
      role: 'PARTICIPANT',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'DL-2024-001',
      phone: '+1234567892',
      address: '123 Main Street, City',
      availability: true,
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { busNumber: 'SH-001' },
    update: {},
    create: {
      busNumber: 'SH-001',
      plateNumber: 'ABC-1234',
      capacity: 40,
      model: 'Mercedes-Benz Sprinter',
      year: 2024,
      color: 'White',
      status: 'AVAILABLE',
      driverId: driver.id,
    },
  });

  const event = await prisma.event.upsert({
    where: { id: 'seed-event-001' },
    update: {},
    create: {
      id: 'seed-event-001',
      name: 'Tech Conference 2024',
      description: 'Annual technology conference with industry leaders and innovators.',
      date: new Date('2024-12-15'),
      startTime: new Date('2024-12-15T09:00:00'),
      endTime: new Date('2024-12-15T18:00:00'),
      address: 'Convention Center, 123 Business Ave, Tech City',
      latitude: 40.7128,
      longitude: -74.006,
      capacity: 2000,
      status: 'PUBLISHED',
      createdById: superAdmin.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'seed-event-002' },
    update: {},
    create: {
      id: 'seed-event-002',
      name: 'Music Festival Summer',
      description: 'Three-day outdoor music festival featuring top artists.',
      date: new Date('2024-07-20'),
      startTime: new Date('2024-07-20T12:00:00'),
      endTime: new Date('2024-07-22T23:00:00'),
      address: 'Central Park, New York',
      latitude: 40.7829,
      longitude: -73.9654,
      capacity: 5000,
      status: 'PUBLISHED',
      createdById: superAdmin.id,
    },
  });

  const route = await prisma.route.upsert({
    where: { id: 'seed-route-001' },
    update: {},
    create: {
      id: 'seed-route-001',
      name: 'Downtown to Convention Center',
      origin: 'Downtown Terminal',
      originLat: 40.7580,
      originLng: -73.9855,
      destination: 'Convention Center',
      destinationLat: 40.7128,
      destinationLng: -74.006,
      distance: 5.2,
      estimatedDuration: 25,
      eventId: event.id,
      stops: {
        create: [
          { name: 'Grand Central', latitude: 40.7527, longitude: -73.9772, order: 1 },
          { name: 'Times Square', latitude: 40.7580, longitude: -73.9855, order: 2 },
          { name: 'Madison Square', latitude: 40.7420, longitude: -73.9876, order: 3 },
        ],
      },
    },
  });

  const pickupPoint = await prisma.pickupPoint.upsert({
    where: { id: 'seed-pickup-001' },
    update: {},
    create: {
      id: 'seed-pickup-001',
      name: 'Downtown Terminal - Gate 1',
      latitude: 40.7580,
      longitude: -73.9855,
      address: '123 Downtown Ave, New York',
      maxCapacity: 100,
      eventId: event.id,
    },
  });

  const pickupPoint2 = await prisma.pickupPoint.upsert({
    where: { id: 'seed-pickup-002' },
    update: {},
    create: {
      id: 'seed-pickup-002',
      name: 'Grand Central Station',
      latitude: 40.7527,
      longitude: -73.9772,
      address: '89 E 42nd St, New York',
      maxCapacity: 80,
      eventId: event.id,
    },
  });

  const route2 = await prisma.route.upsert({
    where: { id: 'seed-route-002' },
    update: {},
    create: {
      id: 'seed-route-002',
      name: 'Central Park Loop',
      origin: 'Midtown Terminal',
      originLat: 40.7549,
      originLng: -73.9840,
      destination: 'Central Park Main Entrance',
      destinationLat: 40.7829,
      destinationLng: -73.9654,
      distance: 3.8,
      estimatedDuration: 20,
      eventId: event2.id,
      stops: {
        create: [
          { name: '5th Ave & 59th St', latitude: 40.7641, longitude: -73.9733, order: 1 },
          { name: 'Columbus Circle', latitude: 40.7682, longitude: -73.9818, order: 2 },
        ],
      },
    },
  });

  await prisma.pickupPoint.upsert({
    where: { id: 'seed-pickup-003' },
    update: {},
    create: {
      id: 'seed-pickup-003',
      name: 'Midtown Terminal - Gate 3',
      latitude: 40.7549,
      longitude: -73.9840,
      address: '456 Midtown Ave, New York',
      maxCapacity: 150,
      eventId: event2.id,
    },
  });

  await prisma.pickupPoint.upsert({
    where: { id: 'seed-pickup-004' },
    update: {},
    create: {
      id: 'seed-pickup-004',
      name: 'Columbus Circle',
      latitude: 40.7682,
      longitude: -73.9818,
      address: 'Columbus Circle, New York',
      maxCapacity: 120,
      eventId: event2.id,
    },
  });

  const trip = await prisma.trip.upsert({
    where: { id: 'seed-trip-001' },
    update: {},
    create: {
      id: 'seed-trip-001',
      name: 'Morning Shuttle - Tech Conference',
      date: new Date('2024-12-15'),
      departureTime: new Date('2024-12-15T08:00:00'),
      status: 'SCHEDULED',
      driverId: driver.id,
      vehicleId: vehicle.id,
      routeId: route.id,
    },
  });

  console.log('Seed data created successfully!');
  console.log('\nTest Accounts:');
  console.log('  Super Admin:  admin@smartshuttle.com / Admin@123');

  console.log('  Driver:       driver@smartshuttle.com / Admin@123');
  console.log('  Participant:  participant@smartshuttle.com / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
