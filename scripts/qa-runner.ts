// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY sebelum menjalankan QA.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runQaDiagnostic() {
  console.log('=== [QA DIAGNOSTIC TEST SUITE] ===\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err: any) {
      console.log(`❌ FAIL -> ${err.message}`);
      failed++;
    }
  }

  // 1. Supabase Connection & Health Check
  await test('Supabase Connection & Server Health', async () => {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw new Error(`Query profiles failed: ${error.message}`);
  });

  // 2. Vehicles Table Schema & Query
  await test('Vehicles table accessible & valid columns', async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, name, plate, year, price_per_day, transmission, seats, status, mitra_id')
      .limit(5);
    if (error) throw new Error(`Query vehicles failed: ${error.message}`);
    if (!data) throw new Error('Data vehicles null');
  });

  // 3. Orders Table Schema & Query
  await test('Orders table accessible & valid columns', async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, code, renter_id, mitra_id, vehicle_id, start_date, end_date, days, status, total')
      .limit(5);
    if (error) throw new Error(`Query orders failed: ${error.message}`);
    if (!data) throw new Error('Data orders null');
  });

  // 4. Notifications Table Schema & Read_at column
  await test('Notifications table with read_at column', async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, title, body, type, read_at, created_at')
      .limit(5);
    if (error) throw new Error(`Query notifications failed: ${error.message}`);
    if (!data) throw new Error('Data notifications null');
  });

  // 5. Chat Threads & Messages Tables
  await test('Chats & Messages tables accessibility', async () => {
    const { error: chatError } = await supabase.from('chats').select('id, renter_id, mitra_id, order_id').limit(1);
    if (chatError) throw new Error(`Query chats failed: ${chatError.message}`);

    const { error: msgError } = await supabase.from('messages').select('id, chat_id, sender_id, body, kind').limit(1);
    if (msgError) throw new Error(`Query messages failed: ${msgError.message}`);
  });

  // 6. Payments Table
  await test('Payments table accessibility', async () => {
    const { error } = await supabase.from('payments').select('id, order_id, amount, status, method').limit(1);
    if (error) throw new Error(`Query payments failed: ${error.message}`);
  });

  // 7. Inspections Table
  await test('Inspections table accessibility', async () => {
    const { error } = await supabase.from('inspections').select('id, order_id, photos, findings').limit(1);
    if (error) throw new Error(`Query inspections failed: ${error.message}`);
  });

  // 8. Vehicle Availability Table
  await test('Vehicle Availability table accessibility', async () => {
    const { error } = await supabase.from('vehicle_availability').select('id, vehicle_id, date, is_blocked').limit(1);
    if (error) throw new Error(`Query vehicle_availability failed: ${error.message}`);
  });

  // 9. Reviews Table
  await test('Reviews table accessibility', async () => {
    const { error } = await supabase.from('reviews').select('id, order_id, author_id, target_type, rating').limit(1);
    if (error) throw new Error(`Query reviews failed: ${error.message}`);
  });

  console.log(`\n=== RESULT: ${passed} Passed, ${failed} Failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runQaDiagnostic().catch((e) => {
  console.error('Fatal Runner Error:', e);
  process.exit(1);
});
