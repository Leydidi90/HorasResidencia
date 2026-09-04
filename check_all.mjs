import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwcdrnjwehrhncenbhkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_0TlKYH61pH-bUbu55t_Mnw_woO7-RXz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAll() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: logs } = await supabase.from('logs').select('*').eq('date', '26/8/2026').order('timestamp', { ascending: true });
  
  for (const user of users) {
    const userLogs = logs.filter(l => l.user_id === user.id);
    if (userLogs.length > 0) {
      console.log(`\nUser: ${user.name} (${userLogs.length} logs)`);
      userLogs.forEach(l => {
        console.log(`  - ${l.type} | Time: ${l.time} | ID: ${l.id} | TS: ${l.timestamp}`);
      });
    }
  }
}

checkAll();
