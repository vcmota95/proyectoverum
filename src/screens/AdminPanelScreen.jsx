import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { dataService, authService } from '../services/mock';
import { AlertTriangle, MessageSquare, Users, Calendar as CalendarIcon, Trash2, CheckCircle, ShieldAlert, RefreshCw, Search, X, Send, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanelScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [officialDates, setOfficialDates] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  
  // States for new date form
  const [newDate, setNewDate] = useState({ title: '', date: '', description: '' });

  // Admin user messaging & search
  const [userSearch, setUserSearch] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUserToMessage, setSelectedUserToMessage] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = async () => {
    const r = await dataService.getReports();
    const f = await dataService.getFeedbacks();
    const d = await dataService.getOfficialDates();
    const u = await dataService.getAllUsers();
    const p = await dataService.getAllPosts();
    const s = await dataService.getSubjects();
    setReports(r || []);
    setFeedbacks(f || []);
    setOfficialDates(d || []);
    setUsers(u || []);
    setPosts(p || []);
    setSubjects(s || []);
    const key = await dataService.loadGeminiApiKey();
    setGeminiKey(key || '');
  };

  useEffect(() => {
    if (user?.role === 'admin') loadData();
  }, [user]);

  const handleResolveReport = async (reportId, action, postId) => {
    if (action === 'remove_post') {
      if (window.confirm("¿Seguro que querés eliminar el posteo? Esto le restará 40 XP al autor.")) {
        await dataService.deletePost(postId);
        await dataService.resolveReport(reportId, action);
      }
    } else {
      await dataService.resolveReport(reportId, action);
    }
    loadData();
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!newDate.title || !newDate.date) return;
    await dataService.manageOfficialDate(newDate, 'add');
    setNewDate({ title: '', date: '', description: '' });
    loadData();
  };

  const handleRemoveDate = async (dateObj) => {
    if (window.confirm("¿Eliminar esta fecha oficial?")) {
      await dataService.manageOfficialDate(dateObj, 'remove');
      loadData();
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await dataService.updateUserRole(userId, newRole);
    alert("Rol actualizado");
    loadData();
  };

  const handleResetSanctions = async (userId) => {
    if (window.confirm('¿Seguro que querés quitarle todas las sanciones a este usuario?')) {
      await authService.resetUserSanctions(userId);
      await loadData();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserToMessage) return;
    
    try {
      await authService.sendAdminMessage(user.id, selectedUserToMessage.id, messageText.trim());
      setShowMessageModal(false);
      setSelectedUserToMessage(null);
      setMessageText('');
      alert('Mensaje enviado exitosamente');
    } catch (err) {
      alert('Error al enviar el mensaje');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (user?.role !== 'admin') return null;

  return (
    <div className="app-container safe-bottom">
      <Header />
      
      <main style={{ padding: '1rem', paddingBottom: '80px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert color="var(--urgent)" /> Panel de Administrador
        </h2>

        {/* Admin Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => setActiveTab('reports')} className={`btn ${activeTab === 'reports' ? 'btn-primary' : ''}`} style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
            <AlertTriangle size={16} /> Reportes ({reports.length})
          </button>
          <button onClick={() => setActiveTab('feedback')} className={`btn ${activeTab === 'feedback' ? 'btn-primary' : ''}`} style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
            <MessageSquare size={16} /> Feedback ({feedbacks.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`} style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
            <Users size={16} /> Usuarios ({users.length})
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`btn ${activeTab === 'calendar' ? 'btn-primary' : ''}`} style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
            <CalendarIcon size={16} /> Calendario
          </button>
          <button onClick={() => setActiveTab('ai_config')} className={`btn ${activeTab === 'ai_config' ? 'btn-primary' : ''}`} style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
            <Cpu size={16} /> IA
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reports' && (
          <div>
            {reports.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No hay reportes pendientes.</p> : (
              reports.map(report => {
                const reportedPost = posts.find(p => p.id === report.postId);
                const reporter = users.find(u => u.id === report.reportedBy);
                return (
                  <div key={report.id} className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--urgent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-urgent">{report.reason}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Reportado por: {reporter?.name || 'Usuario'}</span>
                    </div>
                    {reportedPost ? (
                      <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{reportedPost.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {reportedPost.description.substring(0, 80)}{reportedPost.description.length > 80 ? '...' : ''}
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>El posteo ya no existe.</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleResolveReport(report.id, 'remove_post', report.postId)} className="btn" style={{ flex: 1, backgroundColor: 'var(--urgent-bg)', color: 'var(--urgent)' }} disabled={!reportedPost}>
                        <Trash2 size={16} /> Eliminar Post
                      </button>
                      <button onClick={() => handleResolveReport(report.id, 'dismiss')} className="btn" style={{ flex: 1, backgroundColor: 'var(--border-color)' }}>
                        Descartar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            {feedbacks.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No hay feedback nuevo.</p> : (
              feedbacks.map(fb => (
                <div key={fb.id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{fb.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>{fb.description}</p>
                  {fb.screenshotName && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-color)', padding: '0.25rem', borderRadius: '4px', display: 'inline-flex' }}>
                      Archivo adjunto: {fb.screenshotName}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                className="input-field" 
                style={{ paddingLeft: '2.5rem' }}
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            {filteredUsers.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No se encontraron usuarios.</p> : (
              filteredUsers.map(u => (
                <div key={u.id} className="card" style={{ marginBottom: '1rem', borderLeft: u.flaggedForReview ? '4px solid var(--urgent)' : 'none' }}>
                  {u.flaggedForReview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.4rem 0.75rem', backgroundColor: 'var(--urgent-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--urgent)' }}>
                      🚨 Requiere revisión del administrador
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{u.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={() => { setSelectedUserToMessage(u); setShowMessageModal(true); }}
                          style={{ padding: '0.25rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', borderRadius: '50%' }}
                          title="Enviar mensaje"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-color)' }}>
                          {u.xp || 0} XP
                        </span>
                      </div>
                      {u.sanctionBadge && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: u.sanctionBadge === 'warning' ? 'var(--pending)' : 'var(--urgent)' }}>
                          {u.sanctionBadge === 'warning' ? '⚠️ Advertencia' : '🔴 Baja confiabilidad'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rol:</label>
                    <select 
                      className="input-field" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', flex: 1, minWidth: '140px' }}
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="student">Estudiante</option>
                      <option value="validated_student">Estudiante Validado</option>
                      <option value="professor">Docente</option>
                      <option value="admin">Admin</option>
                    </select>
                    {u.sanctionBadge && (
                      <button 
                        onClick={() => handleResetSanctions(u.id)} 
                        className="btn"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <RefreshCw size={14} /> Resetear sanciones
                      </button>
                    )}
                  </div>
                  {(u.falsePostCount > 0) && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                      Publicaciones falsas confirmadas: {u.falsePostCount}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Agregar Fecha Oficial</h3>
              <form onSubmit={handleAddDate}>
                <div className="input-group">
                  <label className="input-label">Título</label>
                  <input type="text" className="input-field" required value={newDate.title} onChange={e => setNewDate({...newDate, title: e.target.value})} placeholder="Ej. Inicio de cuatrimestre" />
                </div>
                <div className="input-group">
                  <label className="input-label">Fecha</label>
                  <input type="date" className="input-field" required value={newDate.date} onChange={e => setNewDate({...newDate, date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Descripción</label>
                  <input type="text" className="input-field" value={newDate.description} onChange={e => setNewDate({...newDate, description: e.target.value})} placeholder="Detalles opcionales..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar Fecha</button>
              </form>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Fechas Oficiales Activas</h3>
            {officialDates.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No hay fechas configuradas.</p> : (
              officialDates.map(dateObj => (
                <div key={dateObj.id} className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'blue' }}>{dateObj.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dateObj.date} • {dateObj.description}</p>
                  </div>
                  <button onClick={() => handleRemoveDate(dateObj)} style={{ color: 'var(--urgent)', padding: '0.5rem', backgroundColor: 'var(--urgent-bg)', borderRadius: '50%' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '2rem 0 1rem' }}>Gestión de Comisiones por Materia</h3>
            {subjects.filter(s => s.comisiones && s.comisiones.length > 0).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay materias con comisiones registradas.</p>
            ) : (
              subjects.filter(s => s.comisiones && s.comisiones.length > 0).map(sub => (
                <div key={sub.id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--primary)' }}>{sub.name}</h4>
                    <button 
                      onClick={async () => {
                        if (window.confirm('¿Seguro que querés limpiar todas las comisiones de esta materia?')) {
                          await dataService.updateSubjectCommissionsManually(sub.id, []);
                          loadData();
                        }
                      }}
                      style={{ color: 'var(--urgent)', backgroundColor: 'var(--urgent-bg)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                    Última actualización: {new Date(sub.lastUpdated).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {sub.comisiones.map((c, idx) => (
                      <span key={idx} className="badge" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ai_config' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="var(--primary)" /> Configuración de IA (Gemini)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Ingresa tu clave de API de Google Gemini para habilitar la extracción automática de comisiones y secciones a partir de documentos subidos por los alumnos.
              </p>
              <div className="input-group">
                <label className="input-label">Gemini API Key</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={geminiKey} 
                  onChange={e => setGeminiKey(e.target.value)} 
                  placeholder="AIzaSy..." 
                />
              </div>
              <button 
                onClick={() => { dataService.setGeminiApiKey(geminiKey); alert('API Key guardada correctamente.'); }} 
                className="btn btn-primary" 
                style={{ width: '100%' }}
              >
                Guardar API Key
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Message Modal */}
      {showMessageModal && selectedUserToMessage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Mensaje para {selectedUserToMessage.name}</h3>
              <button onClick={() => setShowMessageModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <label className="input-label">Mensaje</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  required 
                  value={messageText} 
                  onChange={e => setMessageText(e.target.value)} 
                  placeholder="Escribe el mensaje que el usuario verá como advertencia..." 
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Send size={18} /> Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelScreen;
