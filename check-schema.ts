import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log("Checking tables...");
  
  // Try to query withdrawals
  const { data: withdrawals, error: wError } = await supabase.from('withdrawals').select('*').limit(1);
  if (wError) {
      console.log("Withdrawals error:", wError.message);
  } else {
      console.log("Withdrawals table exists.");
  }
  
  // Try to query products
  const { data: products, error: pError } = await supabase.from('products').select('*').limit(1);
  if (pError) {
      console.log("Products error:", pError.message);
  } else {
      console.log("Products table exists.");
  }
}

checkSchema();
