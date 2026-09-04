import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllStatuses, getLogs, getDailyWorkedTimeMs, getTotalWorkedTimeMs, addManualShift, deleteUser, deleteLog } from '../services/db';
import { Users, Activity, CheckSquare, Clock, Trash2, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [allLogs, setAllLogs] = useState([]);
  const [dailyHours, setDailyHours] = useState({});
  const [totalHoursMap, setTotalHoursMap] = useState({});

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
    const totalData = {};
    for (const u of usersData) {
      hoursData[u.id] = await getDailyWorkedTimeMs(u.id, today);
      totalData[u.id] = await getTotalWorkedTimeMs(u.id);
    }
    
    setResidents(usersData);
    setStatuses(statusData);
    setAllLogs(logsData);
    setDailyHours(hoursData);
    setTotalHoursMap(totalData);
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
  const exportAllToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horas Globales');

    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Horas Totales (Decimal)', key: 'hoursText', width: 20 },
      { header: 'Horas Totales (Excel)', key: 'hoursExcel', width: 20 },
    ];

    worksheet.getColumn('hoursExcel').numFmt = '[h]:mm';

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    let totalGlobalMs = 0;

    residents.forEach(u => {
      const totalMs = totalHoursMap[u.id] || 0;
      totalGlobalMs += totalMs;
      const excelTime = totalMs > 0 ? (totalMs / (24 * 60 * 60 * 1000)) : 0;
      worksheet.addRow({
        name: u.name,
        email: u.email,
        hoursText: (totalMs / 3600000).toFixed(2),
        hoursExcel: excelTime
      });
    });

    const totalGlobalExcelTime = totalGlobalMs / (24 * 60 * 60 * 1000);
    const totalRow = worksheet.addRow({
      name: 'TOTAL GLOBAL',
      email: '',
      hoursText: (totalGlobalMs / 3600000).toFixed(2),
      hoursExcel: totalGlobalExcelTime
    });
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        if (rowNumber % 2 === 0 && rowNumber !== worksheet.rowCount) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      }
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_global_practicantes.xlsx');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem' }}>Panel de Encargado (Admin)</h2>
          <p className="subtitle">Vista global de los practicantes de Ingeniería</p>
        </div>
        <button onClick={exportAllToExcel} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={18} /> Exportar Excel Global
        </button>
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
                      {resident.email} • Hoy: {Math.floor((dailyHours[resident.id] || 0) / 3600000)}h {Math.floor(((dailyHours[resident.id] || 0) % 3600000) / 60000)}m • Total: {((totalHoursMap[resident.id] || 0) / 3600000).toFixed(2)}h
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
