import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xwcdrnjwehrhncenbhkh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0TlKYH61pH-bUbu55t_Mnw_woO7-RXz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
