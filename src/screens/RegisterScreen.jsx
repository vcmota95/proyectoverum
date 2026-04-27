import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sumate a Verum</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Creá tu cuenta para estar al día</p>
      </div>

      <div className="card glass">
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nombre Completo</label>
            <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Juan Pérez" />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="estudiante@fmed.uba.ar" />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input type="password" required className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Crear Cuenta
          </button>
          
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            ¿Sos docente o miembro del centro de estudiantes? <br/>
            Contactá al administrador para validar tu cuenta.
          </div>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ¿Ya tenés una cuenta? <Link to="/login" style={{ fontWeight: 600 }}>Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
