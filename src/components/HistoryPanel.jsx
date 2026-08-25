import React from 'react';
import { History, LogIn, LogOut, CheckSquare, Paperclip } from 'lucide-react';

const HistoryPanel = ({ logs }) => {
  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
        <History size={20} className="text-accent" /> Historial de Hoy
      </h3>
      <p className="subtitle">Resumen de tus registros y actividades.</p>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
            No hay registros para mostrar hoy.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                backgroundColor: log.type === 'in' ? 'rgba(16, 185, 129, 0.2)' : 
                                 log.type === 'out' ? 'rgba(239, 68, 68, 0.2)' : 
                                 'rgba(59, 130, 246, 0.2)',
                color: log.type === 'in' ? 'var(--success)' : 
                       log.type === 'out' ? 'var(--danger)' : 
                       'var(--accent-color)'
              }}>
                {log.type === 'in' && <LogIn size={18} />}
                {log.type === 'out' && <LogOut size={18} />}
                {log.type === 'activity' && <CheckSquare size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {log.type === 'in' ? 'Entrada Registrada' : 
                     log.type === 'out' ? 'Salida Registrada' : 
                     'Actividad Realizada'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.time}
                  </span>
                </div>
                {log.type === 'activity' && (
                  <>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {log.content}
                    </p>
                    {log.attachment && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--accent-color)', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '12px' }}>
                        <Paperclip size={12} /> {log.attachment}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
