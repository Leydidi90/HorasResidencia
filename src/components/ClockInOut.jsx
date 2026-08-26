import React, { useState, useEffect } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { getDailyWorkedTimeMs } from '../services/db';

const ClockInOut = ({ onAction, status, user }) => {
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
      fetchTime(); // Actualiza el tiempo trabajado
    }, 10000);
    
    return () => clearInterval(timer);
  }, [user]);

  const formatWorkedTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isWorking = status === 'in';

  return (
    <div className="glass-panel" style={{ width: '100%', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Clock size={16} />
          <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Cronómetro en vivo
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Alternativa: marca entrada al llegar y salida al retirarte.
        </div>
      </div>

      <div style={{ padding: '16px 24px', border: '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '8px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          TURNO ACTUAL 
          <span style={{ 
            fontSize: '0.7rem', 
            padding: '4px 8px', 
            borderRadius: '4px',
            backgroundColor: isWorking ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass-bg)',
            color: isWorking ? 'var(--success)' : 'var(--text-secondary)'
          }}>
            {isWorking ? 'EN PROGRESO' : 'SIN INICIAR'}
          </span>
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Inicia un turno al llegar y ciérralo al retirarte.
          {isWorking && <span style={{ marginLeft: '12px', fontWeight: 600, color: 'var(--accent-color)' }}>Llevas hoy: {formatWorkedTime(workedMs)}</span>}
        </p>

        <button 
          onClick={() => onAction(isWorking ? 'out' : 'in')}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '1rem', 
            fontWeight: 700, 
            letterSpacing: '2px', 
            textTransform: 'uppercase',
            backgroundColor: isWorking ? 'var(--danger)' : 'var(--text-color)',
            color: isWorking ? '#fff' : 'var(--bg-color)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {isWorking ? (
            <><Square size={18} fill="currentColor" /> CERRAR TURNO</>
          ) : (
            <><Play size={18} fill="currentColor" /> INICIAR TURNO</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClockInOut;
