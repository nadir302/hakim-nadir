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

const users = [
  { email: 'admin@smartshuttle.com', password: 'Admin@123', firstName: 'Admin', lastName: 'User', role: 'SUPER_ADMIN' },
  { email: 'organizer@smartshuttle.com', password: 'Admin@123', firstName: 'Organizer', lastName: 'User', role: 'ORGANIZER' },
  { email: 'driver@smartshuttle.com', password: 'Admin@123', firstName: 'Driver', lastName: 'User', role: 'DRIVER' },
  { email: 'employee@smartshuttle.com', password: 'Admin@123', firstName: 'Employee', lastName: 'User', role: 'EMPLOYEE' },
];

async function main() {
  console.log('Creating users in Supabase Auth...\n');

  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set(existing?.users?.map(u => u.email) || []);

  for (const u of users) {
    if (existingEmails.has(u.email)) {
      console.log(`  ~ ${u.email} already exists in Auth`);
      // Get their authId
      const user = existing?.users?.find(x => x.email === u.email);
      if (user) {
        await prisma.user.upsert({
          where: { authId: user.id },
          update: { email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role as any },
          create: { authId: user.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role as any },
        });
        console.log(`  ✓ ${u.email} profile synced`);
      }
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { firstName: u.firstName, lastName: u.lastName, role: u.role },
    });

    if (error) {
      console.error(`  ✗ ${u.email}: ${error.message}`);
      continue;
    }

    await prisma.user.upsert({
      where: { authId: data.user!.id },
      update: {},
      create: {
        authId: data.user!.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as any,
      },
    });

    console.log(`  ✓ ${u.email} (${u.role}) — Auth + profile synced`);
  }

  console.log('\n✅ Done! Try logging in now.');
}

main()
  .catch(console.error)
  .finally(() => { prisma.$disconnect(); process.exit(0); });
