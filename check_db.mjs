import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwcdrnjwehrhncenbhkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_0TlKYH61pH-bUbu55t_Mnw_woO7-RXz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('logs').select('*').eq('date', '26/8/2026').order('timestamp', { ascending: true });
  console.log(data);
}

check();
