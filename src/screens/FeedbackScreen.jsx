import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/mock';
import { CheckCircle } from 'lucide-react';

const FeedbackScreen = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: 'Bug',
    description: '',
    screenshot: null
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const feedbackPayload = { ...formData, userId: user?.id };
      if (feedbackPayload.screenshot) {
        feedbackPayload.screenshotName = feedbackPayload.screenshot.name;
        delete feedbackPayload.screenshot; // Simulate upload
      }
      await dataService.submitFeedback(feedbackPayload);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="app-container safe-bottom">
        <Header />
        <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--confirmed)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>¡Gracias!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Lo revisaremos pronto para seguir mejorando Verum.</p>
          <button onClick={() => { setSubmitted(false); setFormData({ category: 'Bug', description: '', screenshot: null }); }} className="btn" style={{ marginTop: '2rem', backgroundColor: 'var(--bg-color)' }}>
            Enviar otro feedback
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container safe-bottom">
      <Header />
      
      <main style={{ padding: '1.5rem', paddingBottom: '80px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Envianos tu feedback</h2>
        
        <form onSubmit={handleSubmit} className="card">
          <div className="input-group">
            <label className="input-label">Categoría</label>
            <select 
              className="input-field" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
              style={{ paddingRight: '2.5rem', appearance: 'auto' }}
            >
              <option value="Bug">Problema técnico (Bug)</option>
              <option value="Información incorrecta">Información incorrecta</option>
              <option value="Sugerencia">Sugerencia de mejora</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Descripción</label>
            <textarea 
              required 
              className="input-field" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Describí el problema o sugerencia..." 
              style={{ resize: 'none', height: '160px', overflowY: 'auto' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Captura de pantalla (Opcional)</label>
            <input 
              type="file" 
              className="input-field" 
              onChange={e => setFormData({...formData, screenshot: e.target.files[0]})} 
              accept="image/*"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default FeedbackScreen;
