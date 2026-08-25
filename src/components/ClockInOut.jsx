import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { getDailyWorkedTimeMs } from '../services/db';

const ClockInOut = ({ onAction, status, user }) => {
  const [time, setTime] = useState(new Date());
  const [workedMs, setWorkedMs] = useState(0);

  useEffect(() => {
    const fetchTime = async () => {
      if (user) {
        const today = new Date().toLocaleDateString('es-ES');
        const ms = await getDailyWorkedTimeMs(user.id, today);
        setWorkedMs(ms);
      }
    };
    
    fetchTime();
    const timer = setInterval(() => {
      setTime(new Date());
      fetchTime(); // Actualiza el tiempo trabajado cada segundo si está 'in'
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user]);

  const formatWorkedTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <h2 className="title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Clock size={24} className="text-accent" /> Control de Tiempo
      </h2>
      <p className="subtitle" style={{ textTransform: 'capitalize' }}>{formatDate(time)}</p>
      
      <div style={{ margin: '30px 0' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: '700', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {formatTime(time)}
        </div>
        <div style={{ marginTop: '10px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Estado actual: <strong style={{ color: status === 'in' ? 'var(--success)' : 'var(--danger)' }}>
            {status === 'in' ? 'En Turno' : 'Fuera de turno'}
          </strong>
        </div>
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(96, 165, 250, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiempo Hoy:</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-color)' }}>
            {formatWorkedTime(workedMs)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button 
          className="btn btn-success" 
          disabled={status === 'in'}
          onClick={() => onAction('in')}
          style={{ padding: '14px 28px', fontSize: '1.1rem' }}
        >
          <LogIn size={20} />
          Check-in
        </button>
        <button 
          className="btn btn-danger" 
          disabled={status === 'out'}
          onClick={() => onAction('out')}
          style={{ padding: '14px 28px', fontSize: '1.1rem' }}
        >
          <LogOut size={20} />
          Check-out
        </button>
      </div>
    </div>
  );
};

export default ClockInOut;
