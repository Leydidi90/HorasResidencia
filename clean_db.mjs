import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwcdrnjwehrhncenbhkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_0TlKYH61pH-bUbu55t_Mnw_woO7-RXz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
  // 1. Get user 'leydi'
  const { data: users } = await supabase.from('users').select('*');
  const leydi = users.find(u => u.name.toLowerCase().includes('leydi'));
  if (!leydi) { console.log('Leydi not found'); return; }
  console.log('Leydi user ID:', leydi.id);

  // 2. Get all logs for leydi on 26/8/2026
  const { data: logs } = await supabase.from('logs').select('*').eq('user_id', leydi.id).eq('date', '26/8/2026');
  
  if (logs && logs.length > 0) {
    // Delete them all
    for (const log of logs) {
      await supabase.from('logs').delete().eq('id', log.id);
      console.log('Deleted log:', log.id);
    }
  }

  // 3. Insert one clean IN and OUT
  const inLog = {
    id: Date.now().toString() + '-in',
    user_id: leydi.id,
    type: 'in',
    time: '09:00',
    date: '26/8/2026',
    content: 'Ajuste Manual - Entrada',
    attachment: null,
    timestamp: new Date('2026-08-26T09:00:00-06:00').getTime()
  };

  const outLog = {
    id: Date.now().toString() + '-out',
    user_id: leydi.id,
    type: 'out',
    time: '17:00',
    date: '26/8/2026',
    content: 'Ajuste Manual - Salida',
    attachment: null,
    timestamp: new Date('2026-08-26T17:00:00-06:00').getTime()
  };

  await supabase.from('logs').insert([inLog, outLog]);
  console.log('Inserted clean logs for 26/8/2026');
}

clean();
