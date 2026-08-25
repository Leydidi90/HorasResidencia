import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getTotalWorkedTimeMs } from '../services/db';

const ProgressTracker = ({ user, status }) => {
  const [totalMs, setTotalMs] = useState(0);
  const GOAL_HOURS = 500;
  const GOAL_MS = GOAL_HOURS * 3600000; // 500 hours in milliseconds

  useEffect(() => {
    const fetchTotalTime = async () => {
      if (user) {
        const ms = await getTotalWorkedTimeMs(user.id);
        setTotalMs(ms);
      }
    };
    
    fetchTotalTime();
    
    // Si el estado es 'in', actualizamos cada minuto para ver el progreso moverse,
    // o cada segundo si queremos que se vea más dinámico. Vamos con cada segundo.
    const timer = setInterval(() => {
      if (status === 'in') {
        fetchTotalTime();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user, status]);

  const totalHours = totalMs / 3600000;
  const missingHours = Math.max(0, GOAL_HOURS - totalHours);
  const percentage = Math.min(100, (totalMs / GOAL_MS) * 100);

  const formatHours = (hoursValue) => {
    return hoursValue.toFixed(2);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Target size={24} className="text-accent" /> Progreso Global
      </h3>
      <p className="subtitle">Objetivo: 500 horas (24 Ago - 24 Dic)</p>

      <div style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{percentage.toFixed(1)}% Completado</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatHours(totalHours)} / {GOAL_HOURS}h</span>
        </div>
        
        {/* Progress Bar Background */}
        <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Progress Bar Fill */}
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: 'var(--accent-color)',
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
            backgroundSize: '1rem 1rem',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Llevas</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatHours(totalHours)}h</div>
        </div>
        <div style={{ width: '1px', backgroundColor: 'var(--glass-border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Faltan</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>{formatHours(missingHours)}h</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
