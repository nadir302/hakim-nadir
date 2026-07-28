import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

async function getOrCreateUser(email: string, password: string, firstName: string, lastName: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { firstName, lastName, role },
  });
  if (error) throw new Error(`Supabase user ${email}: ${error.message}`);

  return prisma.user.create({
    data: { authId: data.user!.id, email, firstName, lastName, role: role as any },
  });
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Users ──
  const admin = await getOrCreateUser('admin@smartshuttle.com', 'Admin@123', 'Admin', 'User', 'SUPER_ADMIN');
  const org = await getOrCreateUser('organizer@smartshuttle.com', 'Admin@123', 'Sarah', 'Johnson', 'ORGANIZER');
  const driver1 = await getOrCreateUser('driver1@smartshuttle.com', 'Driver@123', 'Mike', 'Smith', 'DRIVER');
  const driver2 = await getOrCreateUser('driver2@smartshuttle.com', 'Driver@123', 'Lisa', 'Brown', 'DRIVER');
  const emp1 = await getOrCreateUser('employee1@smartshuttle.com', 'Employee@123', 'John', 'Doe', 'EMPLOYEE');
  const emp2 = await getOrCreateUser('employee2@smartshuttle.com', 'Employee@123', 'Jane', 'Wilson', 'EMPLOYEE');
  const emp3 = await getOrCreateUser('employee3@smartshuttle.com', 'Employee@123', 'Bob', 'Martin', 'EMPLOYEE');
  console.log('  ✓ 7 users created');

  // ── Drivers ──
  const d1 = await prisma.driver.upsert({
    where: { userId: driver1.id },
    update: {},
    create: { userId: driver1.id, licenseNumber: 'LIC-2024-001', phone: '+212612345678', address: '123 Main St' },
  });
  const d2 = await prisma.driver.upsert({
    where: { userId: driver2.id },
    update: {},
    create: { userId: driver2.id, licenseNumber: 'LIC-2024-002', phone: '+212687654321', address: '456 Oak Ave' },
  });
  console.log('  ✓ 2 drivers created');

  // ── Vehicles ──
  const v1 = await prisma.vehicle.upsert({
    where: { busNumber: 'BUS-001' },
    update: {},
    create: { busNumber: 'BUS-001', plateNumber: '1234-A-5', capacity: 40, model: 'Mercedes Sprinter', year: 2023, color: 'White', status: 'AVAILABLE' },
  });
  const v2 = await prisma.vehicle.upsert({
    where: { busNumber: 'BUS-002' },
    update: {},
    create: { busNumber: 'BUS-002', plateNumber: '5678-B-9', capacity: 25, model: 'Ford Transit', year: 2022, color: 'Blue', status: 'AVAILABLE' },
  });
  const v3 = await prisma.vehicle.upsert({
    where: { busNumber: 'BUS-003' },
    update: {},
    create: { busNumber: 'BUS-003', plateNumber: '9012-C-3', capacity: 55, model: 'Volvo 9700', year: 2024, color: 'Red', status: 'MAINTENANCE' },
  });
  console.log('  ✓ 3 vehicles created');

  // ── Events ──
  const today = new Date();
  const event1 = await prisma.event.create({
    data: {
      name: 'Tech Summit 2026',
      description: 'Annual technology conference with workshops and networking',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 8, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 18, 0),
      address: 'Casablanca Technopark, Route de Nouaceur',
      latitude: 33.5898, longitude: -7.6112,
      capacity: 500, status: 'PUBLISHED',
      createdById: admin.id,
    },
  });
  const event2 = await prisma.event.create({
    data: {
      name: 'Music Festival',
      description: 'Open-air music festival with local and international artists',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 14, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 31, 2, 0),
      address: 'Parc de la Ligue Arabe, Casablanca',
      latitude: 33.5948, longitude: -7.6662,
      capacity: 2000, status: 'PUBLISHED',
      createdById: org.id,
    },
  });
  const event3 = await prisma.event.create({
    data: {
      name: 'Corporate Training Day',
      description: 'Team building and professional development workshop',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 9, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 17, 0),
      address: 'Marrakech Convention Center, Avenue Mohammed VI',
      latitude: 31.6295, longitude: -7.9811,
      capacity: 150, status: 'PUBLISHED',
      createdById: admin.id,
    },
  });
  const event4 = await prisma.event.create({
    data: {
      name: 'Sports Gala',
      description: 'Annual sports award ceremony',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45),
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45, 10, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45, 22, 0),
      address: 'Stade Mohammed V, Casablanca',
      latitude: 33.5731, longitude: -7.6481,
      capacity: 3000, status: 'DRAFT',
      createdById: org.id,
    },
  });
  console.log('  ✓ 4 events created');

  // ── Routes ──
  const r1 = await prisma.route.create({
    data: {
      name: 'Downtown → Technopark', origin: 'Place Mohammed V', originLat: 33.5901, originLng: -7.6169,
      destination: 'Technopark Casablanca', destinationLat: 33.5898, destinationLng: -7.6112,
      distance: 8.5, estimatedDuration: 25, isActive: true, eventId: event1.id,
    },
  });
  const r2 = await prisma.route.create({
    data: {
      name: 'Ain Diab → Technopark', origin: 'Ain Diab Beach', originLat: 33.5967, originLng: -7.6885,
      destination: 'Technopark Casablanca', destinationLat: 33.5898, destinationLng: -7.6112,
      distance: 12.3, estimatedDuration: 35, isActive: true, eventId: event1.id,
    },
  });
  const r3 = await prisma.route.create({
    data: {
      name: 'City Center → Park', origin: 'Place des Nations Unies', originLat: 33.5952, originLng: -7.6201,
      destination: 'Parc de la Ligue Arabe', destinationLat: 33.5948, destinationLng: -7.6662,
      distance: 5.2, estimatedDuration: 15, isActive: true, eventId: event2.id,
    },
  });
  const r4 = await prisma.route.create({
    data: {
      name: 'Gare Casa Voyageurs → Convention Center', origin: 'Gare Casa Voyageurs', originLat: 33.5841, originLng: -7.5818,
      destination: 'Convention Center Marrakech', destinationLat: 31.6295, destinationLng: -7.9811,
      distance: 240, estimatedDuration: 180, isActive: true, eventId: event3.id,
    },
  });
  console.log('  ✓ 4 routes created');

  // ── Route Stops ──
  const stops = [
    { routeId: r1.id, name: 'Place Mohammed V', latitude: 33.5901, longitude: -7.6169, order: 1 },
    { routeId: r1.id, name: 'Boulevard Moulay Youssef', latitude: 33.5876, longitude: -7.6135, order: 2 },
    { routeId: r1.id, name: 'Technopark Entrance', latitude: 33.5898, longitude: -7.6112, order: 3 },
    { routeId: r2.id, name: 'Ain Diab Beach', latitude: 33.5967, longitude: -7.6885, order: 1 },
    { routeId: r2.id, name: 'Morocco Mall', latitude: 33.5892, longitude: -7.6708, order: 2 },
    { routeId: r2.id, name: 'Technopark Entrance', latitude: 33.5898, longitude: -7.6112, order: 3 },
    { routeId: r3.id, name: 'Place des Nations Unies', latitude: 33.5952, longitude: -7.6201, order: 1 },
    { routeId: r3.id, name: 'Boulevard Zerktouni', latitude: 33.5921, longitude: -7.6378, order: 2 },
    { routeId: r3.id, name: 'Parc de la Ligue Arabe', latitude: 33.5948, longitude: -7.6662, order: 3 },
    { routeId: r4.id, name: 'Gare Casa Voyageurs', latitude: 33.5841, longitude: -7.5818, order: 1 },
    { routeId: r4.id, name: 'Aeroport Mohammed V', latitude: 33.3615, longitude: -7.5827, order: 2 },
    { routeId: r4.id, name: 'Convention Center Marrakech', latitude: 31.6295, longitude: -7.9811, order: 3 },
  ];
  for (const s of stops) {
    await prisma.routeStop.create({ data: s });
  }
  console.log('  ✓ 12 route stops created');

  // ── Pickup Points ──
  await prisma.pickupPoint.createMany({
    data: [
      { name: 'Technopark Bus Stop', latitude: 33.5900, longitude: -7.6115, address: 'Technopark, Casablanca', maxCapacity: 80, eventId: event1.id },
      { name: 'Ain Diab Beach Stop', latitude: 33.5965, longitude: -7.6883, address: 'Ain Diab, Casablanca', maxCapacity: 60, eventId: event1.id },
      { name: 'Morocco Mall Stop', latitude: 33.5890, longitude: -7.6705, address: 'Morocco Mall, Casablanca', maxCapacity: 50, eventId: event1.id },
      { name: 'Parc Ligue Arabe Entrance', latitude: 33.5950, longitude: -7.6660, address: 'Parc de la Ligue Arabe', maxCapacity: 100, eventId: event2.id },
      { name: 'Corniche Stop', latitude: 33.5971, longitude: -7.6782, address: 'Corniche, Casablanca', maxCapacity: 75, eventId: event2.id },
      { name: 'Gare Casa Voyageurs', latitude: 33.5840, longitude: -7.5816, address: 'Casa Voyageurs Train Station', maxCapacity: 120, eventId: event3.id },
      { name: 'Aeroport Stop', latitude: 33.3613, longitude: -7.5825, address: 'Mohammed V Airport', maxCapacity: 90, eventId: event3.id },
    ],
  });
  console.log('  ✓ 7 pickup points created');

  // ── Trips ──
  const tripDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  const trip1 = await prisma.trip.create({
    data: {
      name: 'Morning Shuttle - Tech Summit',
      date: tripDate,
      departureTime: new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate(), 7, 30),
      status: 'SCHEDULED', driverId: d1.id, vehicleId: v1.id, routeId: r1.id,
    },
  });
  const trip2 = await prisma.trip.create({
    data: {
      name: 'Afternoon Shuttle - Tech Summit',
      date: tripDate,
      departureTime: new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate(), 12, 0),
      status: 'SCHEDULED', driverId: d2.id, vehicleId: v2.id, routeId: r2.id,
    },
  });
  const trip3 = await prisma.trip.create({
    data: {
      name: 'Evening Return - Tech Summit',
      date: tripDate,
      departureTime: new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate(), 17, 0),
      status: 'SCHEDULED', driverId: d1.id, vehicleId: v1.id, routeId: r1.id,
    },
  });

  // An active trip (today) for real-time demo
  const activeTrip = await prisma.trip.create({
    data: {
      name: 'Active Demo Trip',
      date: today,
      departureTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
      status: 'IN_PROGRESS', driverId: d2.id, vehicleId: v2.id, routeId: r3.id,
      currentLat: 33.5930, currentLng: -7.6400, currentSpeed: 35, tripProgress: 45,
      estimatedArrival: new Date(today.getTime() + 30 * 60000),
    },
  });
  console.log('  ✓ 4 trips created (1 active)');

  // ── Tracking Logs for active trip ──
  const logs = [];
  for (let i = 0; i < 10; i++) {
    logs.push({
      tripId: activeTrip.id,
      latitude: 33.5930 + i * 0.0005,
      longitude: -7.6400 + i * 0.0008,
      speed: 30 + Math.floor(Math.random() * 20),
      heading: 45 + i * 5,
      timestamp: new Date(today.getTime() + i * 60000),
    });
  }
  await prisma.trackingLog.createMany({ data: logs });
  console.log('  ✓ 10 tracking logs created');

  // ── Reservations ──
  const reservationData = [
    { participantId: emp1.id, eventId: event1.id, date: tripDate, time: new Date(tripDate.getTime() + 7.5 * 3600000), status: 'CONFIRMED', tripId: trip1.id },
    { participantId: emp2.id, eventId: event1.id, date: tripDate, time: new Date(tripDate.getTime() + 7.5 * 3600000), status: 'CONFIRMED', tripId: trip1.id },
    { participantId: emp3.id, eventId: event1.id, date: tripDate, time: new Date(tripDate.getTime() + 12 * 3600000), status: 'PENDING', tripId: trip2.id },
    { participantId: emp1.id, eventId: event2.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 13, 0), status: 'CONFIRMED' },
    { participantId: emp2.id, eventId: event2.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 13, 0), status: 'CONFIRMED' },
    { participantId: emp3.id, eventId: event2.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30), time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 13, 0), status: 'PENDING' },
    { participantId: emp1.id, eventId: event3.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 8, 30), status: 'CHECKED_IN' },
    { participantId: emp2.id, eventId: event3.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 8, 30), status: 'CONFIRMED' },
  ];

  for (const rd of reservationData) {
    const code = `SHR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await prisma.reservation.create({
      data: { ...rd, reservationCode: code, qrCode: '' },
    });
  }
  console.log('  ✓ 8 reservations created');

  // ── Notifications ──
  await prisma.notification.createMany({
    data: [
      { type: 'TRIP_STARTED', title: 'Shuttle Started', message: 'Your shuttle to Tech Summit has departed', userId: emp1.id },
      { type: 'RESERVATION_CONFIRMATION', title: 'Reservation Confirmed', message: 'Your reservation for Tech Summit is confirmed', userId: emp1.id },
      { type: 'TRIP_ARRIVED', title: 'Shuttle Approaching', message: 'Your shuttle is 5 minutes away', userId: emp2.id },
      { type: 'REMINDER', title: 'Event Tomorrow', message: 'Tech Summit starts tomorrow at 9:00 AM', userId: emp3.id },
      { type: 'GENERAL', title: 'Welcome!', message: 'Welcome to Smart Shuttle Management System', userId: admin.id },
    ],
  });
  console.log('  ✓ 5 notifications created');

  // ── Activity Logs ──
  await prisma.activityLog.createMany({
    data: [
      { action: 'CREATE', entity: 'Event', details: { name: event1.name }, userId: admin.id },
      { action: 'CREATE', entity: 'Driver', details: { name: 'Mike Smith' }, userId: admin.id },
      { action: 'CREATE', entity: 'Reservation', details: { code: 'SHR-001' }, userId: emp1.id },
      { action: 'UPDATE', entity: 'Trip', details: { status: 'IN_PROGRESS' }, userId: d2.userId },
    ],
  });
  console.log('  ✓ 4 activity logs created');

  // ── Shared Pickup (for matching) ──
  await prisma.sharedPickup.create({
    data: { name: 'Technopark Shared Stop', latitude: 33.5900, longitude: -7.6115, address: 'Technopark, Casablanca', eventId: event1.id, tripId: activeTrip.id },
  });
  console.log('  ✓ 1 shared pickup');

  console.log(`\n✅ Seeding complete!`);
  console.log(`\n📋 Login credentials:`);
  console.log(`  admin@smartshuttle.com / Admin@123  (SUPER_ADMIN)`);
  console.log(`  organizer@smartshuttle.com / Admin@123  (ORGANIZER)`);
  console.log(`  driver1@smartshuttle.com / Driver@123  (DRIVER)`);
  console.log(`  driver2@smartshuttle.com / Driver@123  (DRIVER)`);
  console.log(`  employee1@smartshuttle.com / Employee@123  (EMPLOYEE)`);
  console.log(`  employee2@smartshuttle.com / Employee@123  (EMPLOYEE)`);
  console.log(`  employee3@smartshuttle.com / Employee@123  (EMPLOYEE)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { prisma.$disconnect(); process.exit(0); });
