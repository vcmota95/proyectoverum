import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Home, User, MessageSquare, Plus, ShieldAlert, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Don't show bottom nav on create post or onboarding screens
  if (location.pathname === '/create' || location.pathname === '/onboarding') {
    return null;
  }

  return (
    <>
      <div style={{ height: '70px' }}></div> {/* Spacer for fixed bottom nav */}
      <nav className="glass" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 0.5rem',
        zIndex: 100,
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        
        <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={navItemStyle}>
          <Calendar size={22} />
          <span style={labelStyle}>Calendario</span>
        </NavLink>

        <NavLink to="/feed" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={navItemStyle}>
          <Home size={22} />
          <span style={labelStyle}>Feed</span>
        </NavLink>

        <NavLink to="/create" style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translateY(-15px)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
          flexShrink: 0
        }}>
          <Plus size={24} />
        </NavLink>

        <NavLink to="/academic" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={navItemStyle}>
          <GraduationCap size={22} />
          <span style={labelStyle}>Académico</span>
        </NavLink>

        <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={{...navItemStyle, position: 'relative'}}>
          <User size={22} />
          {user?.adminMessages && user.adminMessages.length > 0 && (
            <span style={{ position: 'absolute', top: '-2px', right: '14px', width: '10px', height: '10px', backgroundColor: 'var(--urgent)', borderRadius: '50%', border: '2px solid var(--bg-color)' }}></span>
          )}
          <span style={labelStyle}>Perfil</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={navItemStyle}>
            <ShieldAlert size={22} />
            <span style={labelStyle}>Admin</span>
          </NavLink>
        )}

      </nav>
      <style>{`
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-item.active {
          color: var(--primary);
        }
      `}</style>
    </>
  );
};

const navItemStyle = {
  minWidth: '56px',
  textAlign: 'center'
};

const labelStyle = {
  fontSize: '0.7rem',
  marginTop: '4px',
  fontWeight: 500
};

export default BottomNav;
