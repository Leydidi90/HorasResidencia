import React, { useState } from 'react';
import { addManualShift } from '../services/db';
import { Save } from 'lucide-react';

const ManualShiftForm = ({ user, onShiftAdded }) => {
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const calculateHours = () => {
    if (!start || !end) return '-';
    
    // Simplistic visual calculation (does not include lunch deduction, backend does that)
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins < 0) diffMins += 24 * 60; // crossed midnight
    
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}min`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !start || !end) return;
    
    setIsSubmitting(true);
    await addManualShift(user.id, date, start, end, note);
    
    setDate('');
    setStart('');
    setEnd('');
    setNote('');
    setSuccess('¡Turno registrado!');
    setTimeout(() => setSuccess(''), 3000);
    
    if (onShiftAdded) onShiftAdded();
    setIsSubmitting(false);
  };

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '8px', letterSpacing: '1px' }}>REGISTRAR TURNO</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
        Anota la fecha con las horas de entrada y salida. Las horas se calculan automáticamente.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>FECHA</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="date" 
              className="input-field" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
              style={{ width: '100%', paddingLeft: '12px' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>ENTRADA</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="time" 
                className="input-field" 
                value={start} 
                onChange={(e) => setStart(e.target.value)} 
                required 
                style={{ width: '100%', paddingLeft: '12px' }} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>SALIDA</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="time" 
                className="input-field" 
                value={end} 
                onChange={(e) => setEnd(e.target.value)} 
                required 
                style={{ width: '100%', paddingLeft: '12px' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ 
          padding: '16px', 
          border: '1px dashed var(--glass-border)', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>TOTAL DEL DÍA</span>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{calculateHours()}</span>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>ACTIVIDADES (OPCIONAL)</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Actividades, área, comentarios..."
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            style={{ width: '100%' }} 
          />
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting} 
            style={{ width: '100%', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: 'var(--text-color)', color: 'var(--bg-color)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
          >
            <Save size={18} /> {isSubmitting ? 'GUARDANDO...' : 'GUARDAR TURNO'}
          </button>
          {success && <p style={{ color: 'var(--success)', marginTop: '12px', textAlign: 'center', fontWeight: 'bold' }}>{success}</p>}
        </div>
      </form>
    </div>
  );
};

export default ManualShiftForm;
