import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllStatuses, getLogs, getDailyWorkedTimeMs, addManualShift, deleteUser, deleteLog } from '../services/db';
import { Users, Activity, CheckSquare, Clock, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [allLogs, setAllLogs] = useState([]);
  const [dailyHours, setDailyHours] = useState({});

  const [manualUser, setManualUser] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const refreshData = async () => {
    const usersData = await getAllUsers();
    const statusData = await getAllStatuses();
    const logsData = await getLogs();
    
    const today = new Date().toLocaleDateString('es-ES');
    const hoursData = {};
    for (const u of usersData) {
      hoursData[u.id] = await getDailyWorkedTimeMs(u.id, today);
    }
    
    setResidents(usersData);
    setStatuses(statusData);
    setAllLogs(logsData);
    setDailyHours(hoursData);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualUser || !manualDate || !manualStart || !manualEnd) return;
    
    setIsSubmitting(true);
    await addManualShift(manualUser, manualDate, manualStart, manualEnd);
    
    setManualUser('');
    setManualDate('');
    setManualStart('');
    setManualEnd('');
    setSuccessMessage('¡Horas agregadas correctamente!');
    setTimeout(() => setSuccessMessage(''), 3000);
    
    await refreshData();
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Estás 100% seguro de que deseas eliminar permanentemente a ${userName}?`)) {
      await deleteUser(userId);
      await refreshData();
    }
  };

  const handleDeleteLog = async (logId, userName, logType) => {
    if (window.confirm(`¿Seguro que quieres borrar este registro de ${logType} de ${userName}? Se recalcularán sus horas.`)) {
      await deleteLog(logId);
      await refreshData();
    }
  };

  useEffect(() => {
    refreshData();
    // En un entorno real con Supabase esto sería un listener en tiempo real o polling.
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 className="title" style={{ fontSize: '2rem' }}>Panel de Encargado (Admin)</h2>
        <p className="subtitle">Vista global de los practicantes de Ingeniería</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Panel de Residentes */}
        <div className="glass-panel">
          <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} className="text-accent" /> Estado Actual de Practicantes
          </h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {residents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay practicantes registrados.</p>
            ) : (
              residents.map(resident => (
                <div key={resident.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{resident.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {resident.email} • {Math.floor((dailyHours[resident.id] || 0) / 3600000)}h {Math.floor(((dailyHours[resident.id] || 0) % 3600000) / 60000)}m hoy
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      backgroundColor: statuses[resident.id] === 'in' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: statuses[resident.id] === 'in' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {statuses[resident.id] === 'in' ? 'En Turno' : 'Fuera'}
                    </div>
                    <button 
                      onClick={() => handleDeleteUser(resident.id, resident.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar practicante"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Registro Global de Actividades */}
        <div className="glass-panel">
          <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} className="text-accent" /> Feed Global
          </h3>
          <div style={{ marginTop: '20px', maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay actividad reciente.</p>
            ) : (
              allLogs.map(log => {
                const user = residents.find(r => r.id === log.userId) || { name: 'Usuario Desconocido' };
                return (
                  <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)' }}>{user.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.date} {log.time}</span>
                        <button 
                          onClick={() => handleDeleteLog(log.id, user.name, log.type)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          title="Borrar registro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {log.type === 'in' && <span style={{ color: 'var(--success)' }}>Hizo Check-in</span>}
                      {log.type === 'out' && <span style={{ color: 'var(--danger)' }}>Hizo Check-out</span>}
                      {log.type === 'activity' && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '4px' }}>
                          <CheckSquare size={16} style={{ color: 'var(--accent-color)', marginTop: '2px' }} />
                          <span>{log.content}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ajuste Manual de Horas */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} className="text-accent" /> Ajuste Manual de Horas
          </h3>
          <form onSubmit={handleManualSubmit} style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Practicante</label>
              <select 
                className="input-field" 
                value={manualUser} 
                onChange={(e) => setManualUser(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)' }}
              >
                <option value="">Selecciona a alguien...</option>
                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Fecha</label>
              <input type="date" className="input-field" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required style={{ width: '100%' }} />
            </div>

            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Entrada</label>
              <input type="time" className="input-field" value={manualStart} onChange={(e) => setManualStart(e.target.value)} required style={{ width: '100%' }} />
            </div>

            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Salida</label>
              <input type="time" className="input-field" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} required style={{ width: '100%' }} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ height: '42px', padding: '0 24px', cursor: 'pointer' }}>
              {isSubmitting ? 'Guardando...' : 'Agregar Horas'}
            </button>
          </form>
          {successMessage && <p style={{ color: 'var(--success)', marginTop: '16px', fontWeight: 'bold' }}>{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
