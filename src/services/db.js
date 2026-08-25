import { supabase } from '../supabaseClient';

export const updateStatus = async (userId, status) => {
  const { error } = await supabase
    .from('resident_status')
    .upsert({ user_id: userId, status });
    
  if (error) console.error('Error updating status:', error);
};

export const getStatus = async (userId) => {
  const { data, error } = await supabase
    .from('resident_status')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error || !data) return 'out';
  return data.status;
};

export const getAllStatuses = async () => {
  const { data, error } = await supabase
    .from('resident_status')
    .select('*');
    
  if (error) return {};
  
  const statusMap = {};
  data.forEach(item => {
    statusMap[item.user_id] = item.status;
  });
  return statusMap;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'resident');
    
  if (error) return [];
  // Evitar enviar passwords al frontend por seguridad
  return data.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) return null;
  return data;
};

export const getLogs = async (userId = null) => {
  let query = supabase.from('logs').select('*').order('timestamp', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) return [];
  
  return data.map(log => ({
    id: log.id,
    userId: log.user_id,
    type: log.type,
    time: log.time,
    date: log.date,
    content: log.content,
    attachment: log.attachment,
    timestamp: log.timestamp
  }));
};

export const addLog = async (userId, type, content = '', attachment = null) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('es-ES');
  const timestamp = now.getTime();
  
  const newLog = {
    id: Date.now().toString(),
    user_id: userId,
    type,
    time: timeString,
    date: dateString,
    content,
    attachment,
    timestamp
  };

  const { error } = await supabase
    .from('logs')
    .insert([newLog]);
    
  if (error) {
    console.error('Error adding log:', error);
  }

  return {
    id: newLog.id,
    userId: newLog.user_id,
    type: newLog.type,
    time: newLog.time,
    date: newLog.date,
    content: newLog.content,
    attachment: newLog.attachment,
    timestamp: newLog.timestamp
  };
};

export const getDailyWorkedTimeMs = async (userId, dateString) => {
  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .in('type', ['in', 'out'])
    .eq('date', dateString)
    .order('timestamp', { ascending: true });
    
  if (error || !logs) return 0;

  let totalMs = 0;
  let currentIn = null;

  for (const log of logs) {
    if (log.type === 'in') {
      currentIn = log.timestamp;
    } else if (log.type === 'out' && currentIn) {
      totalMs += (log.timestamp - currentIn);
      currentIn = null;
    }
  }

  if (currentIn) {
    totalMs += (Date.now() - currentIn);
  }

  return totalMs;
};

export const getTotalWorkedTimeMs = async (userId) => {
  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .in('type', ['in', 'out'])
    .order('timestamp', { ascending: true });
    
  if (error || !logs) return 0;

  let totalMs = 0;
  let currentIn = null;

  for (const log of logs) {
    if (log.type === 'in') {
      currentIn = log.timestamp;
    } else if (log.type === 'out' && currentIn) {
      totalMs += (log.timestamp - currentIn);
      currentIn = null;
    }
  }

  if (currentIn) {
    totalMs += (Date.now() - currentIn);
  }

  return totalMs;
};
