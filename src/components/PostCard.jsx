import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ExternalLink, Clock, CheckCircle, Flag, FileText, AlertTriangle, ShieldOff, X, ChevronRight } from 'lucide-react';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/mock';
import { getBadgeForXp } from '../utils/badges';
import { renderFlag } from '../utils/flags';

const SanctionBadge = ({ badge }) => {
  if (!badge) return null;
  const config = {
    warning:   { icon: '⚠️', label: 'Historial incorrecto', bg: 'var(--pending-bg)',   color: 'var(--pending)' },
    lowTrust:  { icon: '🔴', label: 'Baja confiabilidad',  bg: 'var(--urgent-bg)',    color: 'var(--urgent)' },
    suspended: { icon: '🔴', label: 'Suspendido',          bg: 'var(--urgent-bg)',    color: 'var(--urgent)' },
  }[badge];
  if (!config) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: config.bg, color: config.color, padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)', border: `1px solid ${config.color}` }}>
      {config.icon} {config.label}
    </span>
  );
};

const PostCard = ({ post }) => {
  const { voteOnPost, subjects, reportPost } = useFeed();
  const { user } = useAuth();
  const [author, setAuthor] = useState(null);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('Información falsa');
  const [reported, setReported] = useState(false);
  const [voteError, setVoteError] = useState(null);

  useEffect(() => {
    if (post.authorId) {
      authService.getUserById(post.authorId).then(setAuthor);
    }
  }, [post.authorId]);

  const subject = subjects.find(s => s.id === post.subjectId);
  const upvotes = post.votes.upvotes.length;
  const downvotes = post.votes.downvotes.length;
  const score = upvotes - downvotes;

  const hasUpvoted = post.votes.upvotes.includes(user?.id);
  const hasDownvoted = post.votes.downvotes.includes(user?.id);

  const handleVote = async (isUpvote) => {
    if (isUpvote && hasUpvoted) return;
    if (!isUpvote && hasDownvoted) return;
    try {
      await voteOnPost(post.id, isUpvote);
      setVoteError(null);
    } catch (err) {
      setVoteError(err.message);
      setTimeout(() => setVoteError(null), 5000);
    }
  };

  const submitReport = async () => {
    await reportPost(post.id, reportReason);
    setReported(true);
    setTimeout(() => {
      setShowReport(false);
    }, 2000);
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '1rem', position: 'relative' }}>
      
      {showReport && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-color)', zIndex: 10, borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {reported ? (
            <div style={{ textAlign: 'center', color: 'var(--confirmed)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
              <h4>Gracias, lo revisaremos</h4>
            </div>
          ) : (
            <>
              <h4 style={{ marginBottom: '1rem' }}>¿Por qué querés reportar este posteo?</h4>
              <select className="input-field" value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ marginBottom: '1rem' }}>
                <option value="Información falsa">Información falsa</option>
                <option value="Spam">Spam</option>
                <option value="Otro">Otro</option>
              </select>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitReport}>Reportar</button>
                <button className="btn" style={{ flex: 1, backgroundColor: 'var(--border-color)' }} onClick={() => setShowReport(false)}>Cancelar</button>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {post.isUrgent && (
            <span className="badge badge-urgent">Urgente</span>
          )}
          {subject && (
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              {subject.name}{post.comision ? ` - ${post.comision}` : ''}
            </span>
          )}
          {post.status === 'confirmed' ? (
            <span className="badge badge-confirmed" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={12} /> Confirmado
            </span>
          ) : (
            <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> Pendiente
            </span>
          )}
        </div>
        <button onClick={() => setShowReport(true)} style={{ color: 'var(--text-tertiary)' }} title="Reportar">
          <Flag size={16} />
        </button>
      </div>

      {author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            {author.avatar || '😀'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {author.displayName} {renderFlag(author.countryFlag || 'ar', 16)}
              </span>
              {author.role === 'professor' && (
                <span className="badge badge-confirmed" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>Docente</span>
              )}
              {author.role !== 'professor' && !author.sanctionBadge && (
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.1rem 0.75rem', fontSize: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>{getBadgeForXp(author.xp).icon}</span> {getBadgeForXp(author.xp).title}
                </span>
              )}
            </div>
            {((author.privacySettings?.showRealName || author.privacySettings?.showEmail) || author.role === 'professor') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(author.privacySettings?.showRealName || author.role === 'professor') ? author.name : ''} 
                {((author.privacySettings?.showRealName || author.role === 'professor') && author.privacySettings?.showEmail) ? ' • ' : ''}
                {(author.privacySettings?.showEmail || author.role === 'professor') ? author.email : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{post.title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>{post.description}</p>

      {/* Link Preview */}
      {post.sourceUrl && (
        <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', marginBottom: '1.25rem' }}>
          <div className="link-preview-card">
            <div className="link-preview-icon">
              <ExternalLink size={20} />
            </div>
            <div className="link-preview-content">
              <div className="link-preview-domain">
                {post.sourceUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </div>
              <div className="link-preview-url">
                {post.sourceUrl}
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', marginRight: '1rem', flexShrink: 0 }} />
          </div>
        </a>
      )}

      {/* File Preview */}
      {post.sourceFileContent ? (
        <div style={{ marginBottom: '1rem' }}>
          <div 
            onClick={() => setShowFullscreenPreview(true)}
            style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', position: 'relative', maxHeight: '150px', backgroundColor: 'var(--bg-color)' }}
          >
            {post.sourceFileContent.startsWith('data:image/') ? (
              <img src={post.sourceFileContent} alt={post.sourceFileName} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-secondary)' }}>
                <FileText size={40} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.85rem' }}>{post.sourceFileName}</span>
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
              <span style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>Click para expandir</span>
            </div>
          </div>
        </div>
      ) : post.sourceFileName && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem', backgroundColor: 'var(--bg-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
          <FileText size={14} /> {post.sourceFileName}
        </div>
      )}

      {voteError && (
        <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '0.75rem', border: '1px solid var(--urgent-border)' }}>
          {voteError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
          <button 
            onClick={() => handleVote(true)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '50%', 
              color: hasUpvoted ? 'var(--confirmed)' : 'var(--text-secondary)',
              backgroundColor: hasUpvoted ? 'var(--confirmed-bg)' : 'transparent'
            }}
          >
            <ArrowUp size={18} />
          </button>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', minWidth: '1.5rem', textAlign: 'center', color: score >= 0 ? 'var(--confirmed)' : 'var(--urgent)' }}>
            {score}
          </span>
          <button 
            onClick={() => handleVote(false)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '50%', 
              color: hasDownvoted ? 'var(--urgent)' : 'var(--text-secondary)',
              backgroundColor: hasDownvoted ? 'var(--urgent-bg)' : 'transparent'
            }}
          >
            <ArrowDown size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {author?.sanctionBadge && <SanctionBadge badge={author.sanctionBadge} />}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Fullscreen File Preview Modal */}
      {showFullscreenPreview && post.sourceFileContent && (
        <div 
          onClick={() => setShowFullscreenPreview(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFullscreenPreview(false); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}
            >
              <X size={24} />
            </button>
            {post.sourceFileContent.startsWith('data:image/') ? (
              <img src={post.sourceFileContent} alt={post.sourceFileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <FileText size={80} style={{ marginBottom: '1rem' }} />
                <span style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{post.sourceFileName}</span>
                <a href={post.sourceFileContent} download={post.sourceFileName} onClick={(e) => e.stopPropagation()} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  Descargar archivo
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
