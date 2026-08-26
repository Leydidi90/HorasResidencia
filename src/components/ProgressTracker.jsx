import React, { useState, useEffect } from 'react';
import { getTotalWorkedTimeMs } from '../services/db';

const ProgressTracker = ({ user, status, logs = [] }) => {
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
    
    const timer = setInterval(() => {
      if (status === 'in') {
        fetchTotalTime();
      }
    }, 10000);
    
    return () => clearInterval(timer);
  }, [user, status]);

  const totalHours = totalMs / 3600000;
  const missingHours = Math.max(0, GOAL_HOURS - totalHours);
  const percentage = Math.min(100, (totalMs / GOAL_MS) * 100);

  // Calcular turnos cerrados (días únicos trabajados)
  const uniqueDays = new Set(logs.filter(l => l.type === 'in').map(l => l.date));
  const turnosCerrados = uniqueDays.size;

  // Promedio por turno
  const averageHours = turnosCerrados > 0 ? (totalHours / turnosCerrados) : 0;
  
  // Estimación
  const estimatedShiftsLeft = averageHours > 0 ? Math.ceil(missingHours / averageHours) : 0;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '8px', letterSpacing: '1px' }}>PROGRESO HACIA 500H</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
        Total de horas acumuladas en tu residencia.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalHours.toFixed(2)}</span>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / 500h</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>Faltan</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{Math.ceil(missingHours)}h</span>
        </div>
      </div>

      <div style={{ marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>
        {percentage.toFixed(1)}% COMPLETADO
      </div>
      
      {/* Progress Bar Background */}
      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--glass-border)', marginBottom: '24px' }}>
        {/* Progress Bar Fill */}
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          backgroundColor: 'var(--text-color)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>TURNOS CERRADOS</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{turnosCerrados}</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>PROMEDIO POR TURNO</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{averageHours > 0 ? `${averageHours.toFixed(1)}h` : '-'}</span>
        </div>
      </div>

      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>ESTIMACIÓN</span>
        <span style={{ fontSize: '0.95rem' }}>
          {averageHours > 0 
            ? `A este ritmo, ~${estimatedShiftsLeft} turnos más para llegar a las 500h.`
            : 'Registra un turno para ver tu estimación.'}
        </span>
      </div>
    </div>
  );
};

export default ProgressTracker;
