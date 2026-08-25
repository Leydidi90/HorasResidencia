import React, { useState, useEffect } from 'react';
import { getLogs, addLog, getStatus, updateStatus } from '../services/db';
import ClockInOut from '../components/ClockInOut';
import ActivityLog from '../components/ActivityLog';
import HistoryPanel from '../components/HistoryPanel';
import ProgressTracker from '../components/ProgressTracker';
import { Clock, ClipboardList } from 'lucide-react';

const ResidentDashboard = ({ user }) => {
  const [status, setStatus] = useState('out');
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('time');

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      const userLogs = await getLogs(user.id);
      const userStatus = await getStatus(user.id);
      setLogs(userLogs);
      setStatus(userStatus);
    };

    loadData();
  }, [user]);

  const handleAction = async (actionType) => {
    if (!user) return;
    const newLog = await addLog(user.id, actionType);
    setStatus(actionType);
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddActivity = async (activityText, attachmentName) => {
    if (!user) return;
    const newLog = await addLog(user.id, 'activity', activityText, attachmentName);
    setLogs(prev => [newLog, ...prev]);
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 className="title" style={{ fontSize: '2rem' }}>Hola, {user.name}</h2>
        <p className="subtitle">Portal de Prácticas de Ingeniería</p>
      </header>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('time')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', borderRadius: '8px',
            fontWeight: 600, fontSize: '1rem',
            color: activeTab === 'time' ? 'white' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'time' ? 'var(--accent-color)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={18} /> Control de Tiempo
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', borderRadius: '8px',
            fontWeight: 600, fontSize: '1rem',
            color: activeTab === 'tasks' ? 'white' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'tasks' ? 'var(--accent-color)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <ClipboardList size={18} /> Mis Tareas y Reportes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'time' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <ClockInOut onAction={handleAction} status={status} user={user} />
          <ProgressTracker user={user} status={status} />
          
          {/* Un resumen rápido del historial en la vista de tiempo también es útil */}
          <div style={{ gridColumn: '1 / -1', height: '400px' }}>
            <HistoryPanel logs={logs.filter(l => l.type !== 'activity')} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <ActivityLog onAddActivity={handleAddActivity} status={status} />
          <div style={{ height: '100%', minHeight: '400px', maxHeight: '600px' }}>
            <HistoryPanel logs={logs.filter(l => l.type === 'activity')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
