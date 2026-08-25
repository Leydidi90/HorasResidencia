import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { getCurrentUser, logout } from './services/auth';
import Login from './pages/Login';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { LogOut, Sun, Moon } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'light');

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Verificar si hay sesión al cargar
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  if (loading) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Cargando...</div>;

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navbar */}
        {currentUser && (
          <nav style={{ 
            padding: '16px 24px', 
            background: 'rgba(30, 41, 59, 0.8)', 
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-color)' }}>
              SisPrácticas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {currentUser.role === 'admin' ? 'Encargado' : 'Practicante'}: {currentUser.name}
              </span>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Cambiar tema"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          <Routes>
            <Route 
              path="/login" 
              element={
                !currentUser ? 
                <Login onLoginSuccess={setCurrentUser} /> : 
                <Navigate to={currentUser.role === 'admin' ? "/admin" : "/resident"} />
              } 
            />
            
            <Route 
              path="/resident" 
              element={
                currentUser && currentUser.role === 'resident' ? 
                <ResidentDashboard user={currentUser} /> : 
                <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                currentUser && currentUser.role === 'admin' ? 
                <AdminDashboard /> : 
                <Navigate to="/login" />
              } 
            />

            {/* Redirección por defecto */}
            <Route 
              path="*" 
              element={<Navigate to={currentUser ? (currentUser.role === 'admin' ? "/admin" : "/resident") : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
