import React, { useState, useEffect } from 'react';
import { getLogs, addLog, getStatus, updateStatus } from '../services/db';
import ClockInOut from '../components/ClockInOut';
import HistoryPanel from '../components/HistoryPanel';
import ProgressTracker from '../components/ProgressTracker';
import ManualShiftForm from '../components/ManualShiftForm';

const ResidentDashboard = ({ user }) => {
  const [status, setStatus] = useState('out');
  const [logs, setLogs] = useState([]);
  
  const loadData = async () => {
    if (!user) return;
    const userLogs = await getLogs(user.id);
    const userStatus = await getStatus(user.id);
    setLogs(userLogs);
    setStatus(userStatus);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAction = async (actionType, customTime = null) => {
    if (!user) return;
    await addLog(user.id, actionType, '', null, customTime);
    await updateStatus(user.id, actionType);
    await loadData();
  };

  const handleManualShiftAdded = async () => {
    await loadData();
  };

  const handleLogsChanged = async () => {
    await loadData();
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '40px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 className="title" style={{ fontSize: '2rem' }}>Hola, {user.name}</h2>
        <p className="subtitle">Portal de Prácticas de Ingeniería</p>
      </header>

      {/* Top Row: Form & Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <ManualShiftForm user={user} onShiftAdded={handleManualShiftAdded} />
        <ProgressTracker user={user} status={status} logs={logs} />
      </div>

      {/* Removed Clock In Out as requested */}

      {/* Bottom Row: History Table */}
      <div>
        <HistoryPanel logs={logs.filter(l => l.type !== 'activity')} onLogsChanged={handleLogsChanged} />
      </div>
    </div>
  );
};

export default ResidentDashboard;
