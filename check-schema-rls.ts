import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Fail fast if env vars are missing
if (!SUPABASE_URL) {
    console.error('ERROR: EXPO_PUBLIC_SUPABASE_URL is not set. Please check your .env file.');
    process.exit(1);
}
if (!SUPABASE_ANON_KEY) {
    console.error('ERROR: EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Checking tables...");

    const { data: orders, error: oError } = await supabase.from('orders').select('*').limit(1);
    if (oError) {
        console.log("Orders error:", oError.message);
    } else {
        console.log("Orders table exists.");
    }

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) {
        console.log("Profiles error:", pError.message);
    } else {
        console.log("Profiles table exists.");
    }
}

(async () => {
    try {
        await checkSchema();
    } catch (error) {
        console.error('Schema check failed:', error);
        process.exit(1);
    }
})();
