import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import { User, Lock, Mail } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegistering) {
        result = await register(name, email, password);
      } else {
        result = await login(email, password);
      }
      
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }
      
      onLoginSuccess(result.user);
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/resident');
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '8px' }}>
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="subtitle">Portal de Prácticas de Ingeniería</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label className="input-label">Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="Juan Pérez" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                placeholder="correo@ejemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </span>{' '}
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </div>
        
        {!isRegistering && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <p>Acceso Administrador (Prueba):</p>
            <p>admin@residencia.com / admin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
