import React, { useState } from 'react';
import { X } from 'lucide-react';

const HelpModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('how');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 200,
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal */}
      <div
        className="card animate-slide-up"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 201,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: '1.25rem',
          borderTopRightRadius: '1.25rem',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem 0'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ayuda</h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              backgroundColor: 'var(--bg-color)',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          padding: '1rem 1.5rem 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {[
            { id: 'how', label: 'Cómo usar' },
            { id: 'rules', label: 'Reglas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                marginBottom: '-1px',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {activeTab === 'how' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>¿Cómo usar Verum?</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Verum es tu centro de información verificada para Medicina UBA. Así funciona:
              </p>

              {[
                {
                  n: '1', title: 'Configurá tu perfil',
                  body: 'Indicá las materias que estás cursando para ver solo la información que te importa.'
                },
                {
                  n: '2', title: 'Revisá tu Feed y Calendario',
                  body: 'El Feed muestra los avisos recientes de tus materias. El Calendario te muestra todas las fechas importantes de un vistazo.'
                },
                {
                  n: '3', title: 'Publicá información',
                  body: '¿Sabés algo que otros deberían saber? Publicalo. Siempre adjuntá una fuente: un link oficial o una captura de pantalla que respalde lo que decís.'
                },
                {
                  n: '4', title: 'Verificá lo que otros publican',
                  body: 'Cada publicación necesita votos para ser confirmada. Si sabés que una información es correcta, confirmala. Si es falsa, marcala como incorrecta.'
                },
                {
                  n: '5', title: 'Reportá contenido problemático',
                  body: 'Usá el ícono de bandera en cualquier publicación para reportarla al administrador.'
                }
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                  }}>
                    {step.n}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{step.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Reglas de Verum</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Verum funciona porque sus usuarios son responsables. Por eso pedimos:
              </p>

              {[
                {
                  icon: '✅', title: 'Publicá solo información verificable',
                  body: 'Toda publicación debe tener una fuente adjunta (link o captura). Sin fuente, no se puede publicar.'
                },
                {
                  icon: '✅', title: 'Votá con honestidad',
                  body: 'Solo confirmá información que realmente podés verificar. Votar al azar daña la confiabilidad de todos.'
                },
                {
                  icon: '✅', title: 'Usá el nivel de urgencia correctamente',
                  body: '"Urgente" es solo para situaciones que afectan a todos de forma inmediata. No abuses de este nivel o perderá su significado.'
                }
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{rule.icon}</span>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{rule.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{rule.body}</p>
                  </div>
                </div>
              ))}

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>⛔</span>
                  <h4 style={{ fontWeight: 700, color: 'var(--urgent)', fontSize: '0.95rem' }}>Está prohibido:</h4>
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    'Publicar información falsa intencionalmente',
                    'Hacerse pasar por docentes o miembros del centro de estudiantes sin validación',
                    'Usar la plataforma para difundir rumores sin fuente',
                    'Reportar publicaciones de forma malintencionada'
                  ].map((item, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>· {item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--pending-bg)', border: '1px solid var(--pending-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <h4 style={{ fontWeight: 700, color: 'var(--pending)', fontSize: '0.95rem' }}>Sistema de sanciones:</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', paddingLeft: '1.75rem', lineHeight: 1.6 }}>
                  Verum tiene un sistema progresivo de sanciones para usuarios con historial de información incorrecta:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.75rem' }}>
                  {[
                    { level: '3 publicaciones falsas confirmadas', consequence: 'Badge de advertencia visible en tu perfil público.' },
                    { level: 'Reincidencia (6)', consequence: 'Badge de baja confiabilidad + suspensión de 7 días (no podés publicar ni votar).' },
                    { level: 'Nueva reincidencia (10)', consequence: 'Suspensión de 30 días + revisión del administrador.' }
                  ].map((s, i) => (
                    <div key={i} style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>· {s.level} → </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.consequence}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.75rem', paddingLeft: '1.75rem', fontStyle: 'italic' }}>
                  Los badges son visibles para toda la comunidad.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpModal;
