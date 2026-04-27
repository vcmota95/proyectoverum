import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import FeedScreen from './screens/FeedScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import CalendarScreen from './screens/CalendarScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import AcademicProgressScreen from './screens/AcademicProgressScreen';
import BottomNav from './components/BottomNav';
import { AlertTriangle, Check } from 'lucide-react';

const AdminMessageOverlay = () => {
  const { user, dismissAdminMessage } = useAuth();
  
  if (!user || !user.adminMessages || user.adminMessages.length === 0) return null;
  
  const currentMessage = user.adminMessages[0];
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(5px)' }}>
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', padding: '2rem', borderTop: '4px solid var(--urgent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--urgent)' }}>
          <AlertTriangle size={28} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Mensaje del Administrador</h2>
        </div>
        
        <p style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: '2rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {currentMessage.text}
        </p>
        
        <button 
          onClick={() => dismissAdminMessage(currentMessage.id)}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem' }}
        >
          <Check size={20} /> Entendido
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return (
    <>
      <AdminMessageOverlay />
      {children}
    </>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <CalendarScreen />
          </ProtectedRoute>
        } />

        <Route path="/feed" element={
          <ProtectedRoute>
            <FeedScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/create" element={
          <ProtectedRoute>
            <CreatePostScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />

        <Route path="/academic" element={
          <ProtectedRoute>
            <AcademicProgressScreen />
          </ProtectedRoute>
        } />

        <Route path="/feedback" element={
          <ProtectedRoute>
            <FeedbackScreen />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanelScreen />
          </ProtectedRoute>
        } />
      </Routes>
      {user && <BottomNav />}
    </>
  );
};

export default App;
