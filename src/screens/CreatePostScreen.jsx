import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/mock';
import { ArrowLeft, ShieldOff } from 'lucide-react';

const CreatePostScreen = () => {
  const { createPost, subjects } = useFeed();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    comision: '',
    notificationWeight: 'informational', // 'urgent', 'relevant', 'informational'
    sourceUrl: '',
    sourceFile: null,
    eventDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sourceUrl && !formData.sourceFile) {
      alert("Debes proveer una fuente: ingresá un link o subí un archivo/imagen.");
      return;
    }
    setLoading(true);
    try {
      const postPayload = { ...formData };
      if (postPayload.sourceFile) {
        postPayload.sourceFileName = postPayload.sourceFile.name;
        
        // Read file as base64
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(postPayload.sourceFile);
        });
        postPayload.sourceFileContent = fileContent;
        
        const apiKey = dataService.getGeminiApiKey();
        if (apiKey) {
          try {
            const match = fileContent.match(/^data:(.*?);base64,(.*)$/);
            if (match) {
              const mimeType = match[1];
              const base64Data = match[2];
              const prompt = `Extrae las comisiones o secciones de la materia mencionadas en este documento. Devuelve SOLO un arreglo JSON válido con el nombre completo y horario de cada comisión, en el formato "Comisión X (Día Inicio-Fin)". Ejemplo: ["Comisión 1 (Lunes 8-12)", "Comisión 2 (Martes 14-18)"]. Si no encuentras ninguna comisión, devuelve []. NO agregues markdown ni texto adicional.`;
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }],
                  generationConfig: { responseMimeType: "application/json" }
                })
              });
              const data = await response.json();
              if (data.candidates && data.candidates[0].content.parts[0].text) {
                const text = data.candidates[0].content.parts[0].text;
                try {
                  const extracted = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
                  if (Array.isArray(extracted) && extracted.length > 0) {
                    postPayload.extractedComisiones = extracted;
                  }
                } catch (e) {
                  console.error("Failed to parse Gemini output:", text);
                }
              }
            }
          } catch (e) {
            console.error("Gemini API error:", e);
          }
        }
        
        delete postPayload.sourceFile; 
      }
      await createPost(postPayload);
      navigate('/feed');
    } catch (error) {
      // Show suspension error inline
      setLoading(false);
      alert(error.message);
    }
  };

  // Suspension wall
  const isSuspended = user?.suspendedUntil && new Date(user.suspendedUntil) > new Date();
  if (isSuspended) {
    const date = new Date(user.suspendedUntil).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="app-container safe-bottom">
        <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Crear Posteo</h1>
        </header>
        <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
          <ShieldOff size={56} style={{ color: 'var(--urgent)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--urgent)', marginBottom: '0.75rem' }}>Cuenta suspendida</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Tu cuenta está suspendida hasta el <strong>{date}</strong>. No podés publicar ni votar durante este período.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container safe-bottom">
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Crear Posteo</h1>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Título</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="Ej. Se canceló la clase de hoy" 
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Descripción</label>
            <textarea 
              required 
              className="input-field" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Escribí los detalles..." 
              rows={4}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Materia</label>
            <select 
              className="input-field" 
              value={formData.subjectId} 
              onChange={e => setFormData({...formData, subjectId: e.target.value, comision: ''})}
              required
            >
              <option value="" disabled>Elegí una materia</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {(() => {
            const selectedSubject = subjects.find(s => s.id === formData.subjectId);
            if (selectedSubject && selectedSubject.comisiones && selectedSubject.comisiones.length > 0) {
              return (
                <div className="input-group">
                  <label className="input-label">¿Para qué comisión? (Opcional)</label>
                  <select 
                    className="input-field" 
                    value={formData.comision} 
                    onChange={e => setFormData({...formData, comision: e.target.value})}
                  >
                    <option value="">Todas las comisiones (General)</option>
                    {selectedSubject.comisiones.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })()}

          <div className="input-group">
            <label className="input-label">Nivel de Notificación</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', backgroundColor: formData.notificationWeight === 'urgent' ? 'var(--urgent-bg)' : 'transparent', borderRadius: 'var(--radius-md)' }}>
                <input type="radio" name="weight" value="urgent" checked={formData.notificationWeight === 'urgent'} onChange={e => setFormData({...formData, notificationWeight: e.target.value})} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--urgent)' }}>Urgente</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notifica a todos los usuarios de la app inmediatamente.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', backgroundColor: formData.notificationWeight === 'relevant' ? 'var(--pending-bg)' : 'transparent', borderRadius: 'var(--radius-md)' }}>
                <input type="radio" name="weight" value="relevant" checked={formData.notificationWeight === 'relevant'} onChange={e => setFormData({...formData, notificationWeight: e.target.value})} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--pending)' }}>Relevante</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notifica solo a los usuarios inscriptos en esta materia.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', backgroundColor: formData.notificationWeight === 'informational' ? 'var(--bg-color)' : 'transparent', borderRadius: 'var(--radius-md)' }}>
                <input type="radio" name="weight" value="informational" checked={formData.notificationWeight === 'informational'} onChange={e => setFormData({...formData, notificationWeight: e.target.value})} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Informativo</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aparece en el feed sin enviar notificación activa.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Fecha del evento (Opcional)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Si el posteo es sobre una fecha específica (parcial, clase), agregala para que aparezca en el calendario.</p>
            <input 
              type="date" 
              className="input-field" 
              value={formData.eventDate} 
              onChange={e => setFormData({...formData, eventDate: e.target.value})} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Fuente (Obligatorio: Link o Archivo)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Ingresá el link oficial o subí una captura/documento que valide la información.</p>
            <input 
              type="url" 
              className="input-field" 
              value={formData.sourceUrl} 
              onChange={e => setFormData({...formData, sourceUrl: e.target.value})} 
              placeholder="https://fmed.uba.ar/... (Link)" 
              style={{ marginBottom: '0.5rem' }}
            />
            <input 
              type="file" 
              className="input-field" 
              onChange={e => setFormData({...formData, sourceFile: e.target.files[0]})} 
              accept="image/*,.pdf"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar Información'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreatePostScreen;
