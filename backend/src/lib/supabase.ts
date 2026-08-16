import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function connectSupabase() {
  try {
    const { data } = await supabase.from('brews').select('count');
    console.log('✓ Connected to Supabase');
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to Supabase:', error);
    return false;
  }
}
