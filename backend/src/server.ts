import app from './app';
import { config } from './config';
import prisma from './config/database';
import { supabase } from './config/supabase';

const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║     Smart Shuttle Management System         ║
  ║     API Server Running                      ║
  ║     Environment: ${config.env.padEnd(29)}║
  ║     Port: ${String(config.port).padEnd(35)}║
  ║     URL: http://${config.host}:${config.port}${' '.repeat(14)}║
  ╚══════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
