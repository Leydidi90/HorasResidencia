import React from 'react';
import { History, Trash2, Download } from 'lucide-react';
import { deleteLog } from '../services/db';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const HistoryPanel = ({ logs, onLogsChanged }) => {
  // Group logs into shifts
  const sortedLogs = [...logs].reverse();
  const shifts = [];
  let currentShift = null;

  for (const log of sortedLogs) {
    if (log.type === 'in') {
      currentShift = { 
        id: log.id, 
        date: log.date, 
        start: log.time, 
        startMs: log.timestamp, 
        note: '-', 
        end: null, 
        endMs: null, 
        hours: 0, 
        deleteId: log.id 
      };
    } else if (log.type === 'out' && currentShift) {
      currentShift.end = log.time;
      currentShift.endMs = log.timestamp;
      currentShift.deleteId = log.id; 
      
      if (log.content && log.content.includes('Salida:')) {
        currentShift.note = log.content.split('Salida:')[1].trim();
      }
      
      const duration = log.timestamp - currentShift.startMs;
      const h = Math.floor(duration / 3600000);
      const m = Math.floor((duration % 3600000) / 60000);
      currentShift.hours = `${h}h ${m}m`;
      
      shifts.push(currentShift);
      currentShift = null;
    }
  }

  if (currentShift) {
    const duration = Date.now() - currentShift.startMs;
    const h = Math.floor(duration / 3600000);
    const m = Math.floor((duration % 3600000) / 60000);
    currentShift.end = 'En curso';
    currentShift.hours = `${h}h ${m}m`;
    shifts.push(currentShift);
  }

  shifts.reverse(); // newest first

  const handleDelete = async (logId) => {
    if (window.confirm('¿Seguro que quieres borrar este registro? Se ajustarán tus horas totales.')) {
      await deleteLog(logId);
      if (onLogsChanged) onLogsChanged();
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bitácora');

    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Entrada', key: 'start', width: 12 },
      { header: 'Salida', key: 'end', width: 12 },
      { header: 'Horas', key: 'hours', width: 15 },
      { header: 'Actividades', key: 'note', width: 45 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    shifts.forEach(shift => {
      worksheet.addRow({
        date: shift.date,
        start: shift.start,
        end: shift.end || 'En curso',
        hours: shift.hours,
        note: shift.note === '-' ? '' : shift.note
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        if (rowNumber % 2 === 0) {
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
    saveAs(blob, 'bitacora_practicas.xlsx');
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '4px', letterSpacing: '1px' }}>HISTORIAL / BITÁCORA</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {shifts.length} turno{shifts.length !== 1 ? 's' : ''} registrado{shifts.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button onClick={exportToExcel} className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', fontSize: '0.85rem' }}>
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 8px', fontWeight: 600 }}>FECHA</th>
              <th style={{ padding: '12px 8px', fontWeight: 600 }}>ENTRADA</th>
              <th style={{ padding: '12px 8px', fontWeight: 600 }}>SALIDA</th>
              <th style={{ padding: '12px 8px', fontWeight: 600 }}>HORAS</th>
              <th style={{ padding: '12px 8px', fontWeight: 600 }}>ACTIVIDADES</th>
              <th style={{ padding: '12px 8px', fontWeight: 600, width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No hay turnos registrados.
                </td>
              </tr>
            ) : (
              shifts.map((shift, idx) => (
                <tr key={shift.id + idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 500 }}>{shift.date}</td>
                  <td style={{ padding: '16px 8px' }}>{shift.start}</td>
                  <td style={{ padding: '16px 8px' }}>{shift.end}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>{shift.hours}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{shift.note}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(shift.deleteId)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      title="Borrar turno"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPanel;
