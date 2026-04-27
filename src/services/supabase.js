import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars. VITE_SUPABASE_URL:', supabaseUrl, 'VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[SET]' : '[MISSING]');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
  // Create a dummy client that won't crash the app
  supabase = null;
}

export { supabase };
