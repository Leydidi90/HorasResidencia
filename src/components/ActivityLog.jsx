import React, { useState, useRef } from 'react';
import { PlusCircle, ListTodo, Paperclip, X } from 'lucide-react';

const ActivityLog = ({ onAddActivity, status }) => {
  const [activity, setActivity] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activity.trim() !== '') {
      onAddActivity(activity, file ? file.name : null);
      setActivity('');
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '24px' }}>
      <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
        <ListTodo size={20} className="text-accent" /> Registro de Actividades
      </h3>
      <p className="subtitle" style={{ marginBottom: '16px' }}>
        Añade las tareas realizadas durante tu turno.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ej. Diseño de base de datos..." 
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            disabled={status !== 'in'}
          />
        </div>
        
        {/* Sección de archivo adjunto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            disabled={status !== 'in'}
          />
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => fileInputRef.current.click()}
            disabled={status !== 'in'}
            style={{ padding: '8px 12px' }}
          >
            <Paperclip size={18} /> {file ? 'Cambiar archivo' : 'Adjuntar Documento'}
          </button>
          
          {file && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '20px' }}>
              <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
              <X size={14} style={{ cursor: 'pointer' }} onClick={() => setFile(null)} />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={status !== 'in' || !activity.trim()}
          style={{ padding: '12px 20px', alignSelf: 'flex-start' }}
        >
          <PlusCircle size={20} />
          Registrar Tarea
        </button>
      </form>
      
      {status !== 'in' && (
        <p style={{ color: 'var(--warning)', fontSize: '0.85rem', marginTop: '12px' }}>
          * Debes hacer check-in para poder registrar actividades.
        </p>
      )}
    </div>
  );
};

export default ActivityLog;
