import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwcdrnjwehrhncenbhkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_0TlKYH61pH-bUbu55t_Mnw_woO7-RXz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
  console.log('Fetching logs for 26/8/2026...');
  const { data, error } = await supabase.from('logs').select('*').eq('date', '26/8/2026');
  
  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }
  
  console.log('Found logs:', data.length);
  for (const log of data) {
    console.log(`Log ${log.type} - Time: ${log.time}`);
    if (log.type === 'in' && log.time === '10:10') {
      const targetDateObj = new Date(`2026-08-26T09:00:00-06:00`);
      const res = await supabase.from('logs').update({
        time: '09:00',
        timestamp: targetDateObj.getTime()
      }).eq('id', log.id);
      
      console.log('Updated IN log:', log.id, res.error ? res.error : 'Success');
    }
  }
}

fix();
