import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
          V
        </div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Verum</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tu centro verificado de Medicina UBA</p>
      </div>

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Bienvenido</h2>
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="estudiante@fmed.uba.ar" />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input type="password" required className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Iniciar Sesión
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ¿No tenés una cuenta? <Link to="/register" style={{ fontWeight: 600 }}>Registrate</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
