import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://oizhkigzdwhqzqgtwnuh.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fix() {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) { console.error(error.message); return; }

  for (const u of data.users) {
    if (!u.email_confirmed_at) {
      console.log(`Confirming ${u.email} (${u.id})...`);
      await admin.auth.admin.updateUserById(u.id, { email_confirm: true });
      console.log(`  ✓ ${u.email} confirmed`);
    }
  }
  console.log('Done');
}

fix().catch(console.error).finally(() => process.exit(0));
