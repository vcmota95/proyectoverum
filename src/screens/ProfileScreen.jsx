import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import { ArrowLeft, Edit2, X, HelpCircle, GraduationCap, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector';
import { AVATARS } from '../utils/avatars';
import { getBadgeForXp } from '../utils/badges';
import { FLAGS, renderFlag } from '../utils/flags';

const ProfileScreen = () => {
  const { user, updateSubjects, updateProfile, makeAdmin, updateAcademicRecord, deleteAcademicRecord, dismissAdminMessage, updateUserCommission, logout } = useAuth();
  const { subjects } = useFeed();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState(user?.enrolledSubjects || []);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [showRealName, setShowRealName] = useState(user?.privacySettings?.showRealName || false);
  const [showEmail, setShowEmail] = useState(user?.privacySettings?.showEmail || false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '😀');
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [selectedFlag, setSelectedFlag] = useState(user?.countryFlag || 'ar');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSearch, setFlagSearch] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name.split(' ')[0]);
      setShowRealName(user.privacySettings?.showRealName || false);
      setShowEmail(user.privacySettings?.showEmail || false);
      setSelectedAvatar(user.avatar || '😀');
      setSelectedFlag(user.countryFlag || 'ar');
      setSelectedSubjects(user.enrolledSubjects || []);
    }
  }, [user]);

  const handleSave = async () => {
    if (displayName.length < 3 || displayName.length > 30) {
      alert("El nombre público debe tener entre 3 y 30 caracteres.");
      return;
    }
    await updateProfile({
      displayName,
      avatar: selectedAvatar,
      countryFlag: selectedFlag,
      privacySettings: { showRealName, showEmail }
    });
    await updateSubjects(selectedSubjects);
    setIsEditing(false);
  };


  const passedSubjectsList = user?.passedSubjects || [];
  const subjectsForGPA = passedSubjectsList.filter(item => {
    const s = subjects.find(sub => sub.id === item.subjectId);
    return s && s.cycle !== 'CBC';
  });
  const averageGPA = subjectsForGPA.length > 0
    ? (subjectsForGPA.reduce((acc, curr) => acc + curr.grade, 0) / subjectsForGPA.length).toFixed(2)
    : 0;

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || id;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge badge-urgent">Administrador</span>;
      case 'professor': return <span className="badge badge-confirmed">Profesor</span>;
      case 'validated_student': return <span className="badge badge-confirmed">Validado</span>;
      default: return <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Estudiante</span>;
    }
  };

  const xpBadge = getBadgeForXp(user?.xp);

  return (
    <div className="app-container safe-bottom">
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Perfil</h1>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <Edit2 size={18} /> Editar Perfil
          </button>
        ) : (
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-full)' }}>
            Guardar
          </button>
        )}
      </header>

      <main style={{ padding: '1.5rem' }}>
        {user?.adminMessages && user.adminMessages.length > 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {user.adminMessages.map(msg => (
              <div key={msg.id} className="card animate-scale-in" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)', position: 'relative', paddingRight: '2.5rem' }}>
                <button
                  onClick={() => dismissAdminMessage(msg.id)}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--primary)' }}
                >
                  <X size={18} />
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.text}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(msg.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div
            onClick={() => setShowAvatarModal(true)}
            style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', margin: '0 auto 1rem', cursor: 'pointer' }}
          >
            {isEditing ? selectedAvatar : (user?.avatar || '😀')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '-0.5rem', marginBottom: '1rem' }}>Tocar para cambiar avatar</p>

          {!isEditing ? (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {user?.displayName || user?.name}
                <span onClick={() => setShowFlagModal(true)} style={{ cursor: 'pointer', display: 'flex' }} title="Tocar para cambiar país">{renderFlag(user?.countryFlag, 24)}</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {user?.name} • {user?.email}
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Nombre público</label>
                <input type="text" className="input-field" value={displayName} onChange={e => setDisplayName(e.target.value)} minLength={3} maxLength={30} />
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Privacidad</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={showRealName} onChange={e => setShowRealName(e.target.checked)} />
                  Mostrar mi nombre real a otros usuarios
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={showEmail} onChange={e => setShowEmail(e.target.checked)} />
                  Mostrar mi email a otros usuarios
                </label>
              </div>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>{getRoleBadge(user?.role)}</div>

          {user?.sanctionBadge && (
            <div style={{ marginBottom: '0.75rem' }}>
              {user.sanctionBadge === 'warning' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--pending-bg)', color: 'var(--pending)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8rem', border: '1px solid var(--pending-border)' }}>
                  ⚠️ Historial de información incorrecta
                </span>
              )}
              {(user.sanctionBadge === 'lowTrust' || user.sanctionBadge === 'suspended') && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8rem', border: '1px solid var(--urgent-border)' }}>
                    🔴 Usuario de baja confiabilidad
                  </span>
                  {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--urgent)' }}>
                      Suspendido hasta el {new Date(user.suspendedUntil).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {!user?.sanctionBadge && (
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', position: 'relative' }}>
              <button
                onClick={() => setShowHelpModal(true)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--text-tertiary)' }}
                title="¿Cómo funciona el rango?"
              >
                <HelpCircle size={16} />
              </button>
              <div className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginTop: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>{xpBadge.icon}</span>
                <span>{xpBadge.title}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {user?.xp || 0} XP Totales
              </div>
              {xpBadge.nextTier && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${Math.min(100, Math.max(0, ((user?.xp || 0) - xpBadge.minTier) / (xpBadge.nextTier - xpBadge.minTier) * 100))}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    Faltan {xpBadge.nextTier - (user?.xp || 0)} XP para ser {xpBadge.nextTitle}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/academic')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Rendimiento Académico</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Promedio: {averageGPA}</p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Materias Inscriptas</h3>
          </div>

          {isEditing ? (
            <SubjectSelector selectedIds={selectedSubjects} onChange={setSelectedSubjects} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {user?.enrolledSubjects.map(id => {
                const subject = subjects.find(s => s.id === id);
                if (!subject) return null;

                const hasComisiones = subject.comisiones && subject.comisiones.length > 0;
                const currentSelection = user.selectedCommissions?.[id];
                const needsReview = hasComisiones && currentSelection && !subject.comisiones.includes(currentSelection);

                return (
                  <div key={id} style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: needsReview ? 'var(--urgent-bg)' : 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{subject.name}</span>
                    </div>
                    {hasComisiones && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {needsReview && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--urgent)', marginBottom: '0.5rem', fontWeight: 600 }}>
                            ⚠️ Tu comisión fue actualizada. Por favor elegí de nuevo.
                          </div>
                        )}
                        <select
                          className="input-field"
                          value={currentSelection && !needsReview ? currentSelection : ""}
                          onChange={(e) => updateUserCommission(id, e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '0.4rem', borderColor: needsReview ? 'var(--urgent)' : 'var(--border-color)' }}
                        >
                          <option value="" disabled>Elegir comisión...</option>
                          {subject.comisiones.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
              {user?.enrolledSubjects.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No estás anotado en ninguna materia.</p>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/feedback')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={20} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontWeight: 600 }}>Enviar Sugerencias o Reportar Error</span>
          </div>
        </div>

        <button
          onClick={async () => {
            if (window.confirm("¿Seguro que querés cerrar sesión?")) {
              await logout();
              navigate('/login');
            }
          }}
          className="btn"
          style={{ width: '100%', marginTop: '2rem', color: 'var(--urgent)', border: '1px solid var(--urgent-border)', backgroundColor: 'var(--urgent-bg)' }}
        >
          Cerrar Sesión
        </button>
      </main>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Elegir Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    setSelectedAvatar(avatar);
                    setShowAvatarModal(false);
                    if (!isEditing) {
                      await updateProfile({ avatar });
                    }
                  }}
                  style={{
                    fontSize: '2rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: selectedAvatar === avatar ? 'var(--primary-light)' : 'transparent',
                    border: selectedAvatar === avatar ? '2px solid var(--primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flag Selection Modal */}
      {showFlagModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Elegir País</h3>
              <button onClick={() => setShowFlagModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar país..."
              value={flagSearch}
              onChange={e => setFlagSearch(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem', minHeight: '300px' }}>
              {FLAGS.filter(f => f.name.toLowerCase().includes(flagSearch.toLowerCase())).map((flag, idx) => (
                <button
                  key={flag.code}
                  onClick={async () => {
                    setSelectedFlag(flag.code);
                    setShowFlagModal(false);
                    setFlagSearch('');
                    if (!isEditing) {
                      await updateProfile({ countryFlag: flag.code });
                    }
                  }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: selectedFlag === flag.code ? 'var(--primary-light)' : 'transparent',
                    border: selectedFlag === flag.code ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                  }}
                  title={flag.name}
                >
                  {renderFlag(flag.code, 40)}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.1' }}>
                    {flag.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ranking Help Modal */}
      {showHelpModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Sistema de Rangos</h3>
              <button onClick={() => setShowHelpModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Tu rango médico representa tu reputación y nivel de ayuda en la comunidad estudiantil de Verum.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>🧫</span>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Célula</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>0 a 149 XP (Rango inicial)</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>🦴</span>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Hueso</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>150 a 499 XP</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>🫁</span>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pulmón</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>500 a 1499 XP</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>🫀</span>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Corazón</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>1500 a 2999 XP</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>🧠</span>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--urgent)' }}>Cerebro</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>3000+ XP (Máximo rango)</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>¿Cómo ganar XP?</h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Crear un post validado por votos: <b>+100 XP</b></li>
                <li>Votar correctamente: <b>+10 XP</b></li>
                <li>Reportar información falsa exitosamente: <b>+50 XP</b></li>
              </ul>
            </div>

            <div style={{ backgroundColor: 'var(--urgent-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--urgent)' }}>¿Cómo perder XP?</h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--urgent)', paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Publicar información que es eliminada: <b>-50 XP</b></li>
                <li>Votar incorrectamente: <b>-20 XP</b></li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileScreen;
