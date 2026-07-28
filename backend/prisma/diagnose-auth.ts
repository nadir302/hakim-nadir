import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://oizhkigzdwhqzqgtwnuh.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function test() {
  console.log('=== Auth Users ===');
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) { console.error('List users error:', error); return; }
  console.log(`Total: ${data.users.length}`);
  for (const u of data.users) {
    console.log(`  ${u.email} | created: ${u.created_at} | confirmed: ${u.email_confirmed_at || 'NO'}`);
  }

  // Try login with anon key
  const anon = createClient(url, anonKey);
  console.log('\n=== Trying login ===');
  const { data: login, error: loginErr } = await anon.auth.signInWithPassword({
    email: 'admin@smartshuttle.com',
    password: 'Admin@123',
  });
  if (loginErr) {
    console.error('LOGIN ERROR:', loginErr.message, `(status ${loginErr.status})`);
  } else {
    console.log('LOGIN OK!', login.user?.email);
  }
}

test().catch(console.error).finally(() => process.exit(0));
