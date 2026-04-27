import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Moon, Sun, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HelpModal from './HelpModal';
import { getBadgeForXp } from '../utils/badges';
import { renderFlag } from '../utils/flags';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('verum_theme') || 'light');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('verum_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMiniRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="badge badge-urgent" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Admin</span>;
      case 'professor': return <span className="badge badge-confirmed" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Docente</span>;
      case 'validated_student': return <span className="badge badge-confirmed" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Validado</span>;
      default: return null;
    }
  };

  return (
    <>
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              V
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="text-gradient">Verum</h1>
          </Link>

          {user && (
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.75rem', paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary)', fontSize: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {user.displayName || user.name.split(' ')[0]} {renderFlag(user.countryFlag || 'ar', 12)}
              </span>
              {getMiniRoleBadge(user.role)}
              {!user.sanctionBadge && (
                <span className="golden-bar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.1rem 0.75rem', fontSize: '0.75rem', margin: '0 0.2rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>{getBadgeForXp(user.xp).icon}</span> {user.xp} XP
                </span>
              )}
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setShowHelp(true)} style={{ color: 'var(--text-secondary)' }} title="Ayuda">
            <HelpCircle size={20} />
          </button>
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)' }} title="Cambiar tema">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {user && (
            <>
              <Link to="/profile" style={{ color: 'var(--text-secondary)' }} title="Perfil">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} style={{ color: 'var(--text-secondary)' }} title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </header>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
};

export default Header;
