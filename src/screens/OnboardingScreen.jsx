import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector';

const OnboardingScreen = () => {
  const { user, updateSubjects } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState(user?.enrolledSubjects || []);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    await updateSubjects(selectedSubjects);
    navigate('/');
  };

  return (
    <div className="app-container animate-fade-in" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Elegí tus materias</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Seleccioná las materias que estás cursando para personalizar tu feed.
        </p>

        <SubjectSelector selectedIds={selectedSubjects} onChange={setSelectedSubjects} />
      </div>

      <div style={{ padding: '1rem 0', marginTop: '2rem' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }} 
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Completar Perfil'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
