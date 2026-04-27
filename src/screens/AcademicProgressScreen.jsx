import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import Header from '../components/Header';
import { ArrowLeft, Plus, ChevronRight, CheckCircle, Clock, Trash2, Edit2, X, Award, BarChart2 } from 'lucide-react';

const AcademicProgressScreen = () => {
  const { user, updateAcademicRecord, deleteAcademicRecord } = useAuth();
  const { subjects } = useFeed();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [formData, setFormData] = useState({
    status: 'approved', // 'regular', 'approved', 'promoted'
    grade: '',
    date: new Date().toISOString().split('T')[0],
    attempts: []
  });

  const academicHistory = user?.passedSubjects || [];

  // Data Aggregation
  const stats = useMemo(() => {
    const cycles = ['CBC', 'Ciclo Biomédico', 'Ciclo Clínico', 'PFO'];
    const summary = cycles.map(cycle => {
      const cycleSubjects = subjects.filter(s => s.cycle === cycle);
      const approvedCount = cycleSubjects.filter(s => 
        academicHistory.find(r => r.subjectId === s.id && (r.status === 'approved' || r.status === 'promoted' || (r.grade && r.grade >= 4)))
      ).length;
      
      return {
        name: cycle,
        total: cycleSubjects.length,
        approved: approvedCount,
        progress: cycleSubjects.length > 0 ? (approvedCount / cycleSubjects.length) * 100 : 0
      };
    });

    const nonCbcApproved = academicHistory.filter(r => {
      const s = subjects.find(sub => sub.id === r.subjectId);
      return s && s.cycle !== 'CBC' && r.grade;
    });
    
    const allApproved = academicHistory.filter(r => r.grade);

    const gpa = allApproved.length > 0 
      ? (allApproved.reduce((acc, curr) => acc + Number(curr.grade), 0) / allApproved.length).toFixed(2)
      : '0.00';
    
    const gpaNoCbc = nonCbcApproved.length > 0
      ? (nonCbcApproved.reduce((acc, curr) => acc + Number(curr.grade), 0) / nonCbcApproved.length).toFixed(2)
      : '0.00';

    return { summary, gpa, gpaNoCbc, totalApproved: allApproved.length };
  }, [subjects, academicHistory]);

  const handleOpenAdd = (subjectId = '') => {
    setSelectedSubjectId(subjectId);
    setEditingRecord(null);
    setFormData({
      status: 'approved',
      grade: '',
      date: new Date().toISOString().split('T')[0],
      attempts: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setSelectedSubjectId(record.subjectId);
    setFormData({
      status: record.status || 'approved',
      grade: record.grade || '',
      date: record.date || new Date().toISOString().split('T')[0],
      attempts: record.attempts || []
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!selectedSubjectId) return;
    await updateAcademicRecord(selectedSubjectId, {
      ...formData,
      grade: formData.grade ? Number(formData.grade) : null
    });
    setShowAddModal(false);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      await deleteAcademicRecord(subjectId);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'promoted': return <span className="badge badge-confirmed">Promocionada</span>;
      case 'approved': return <span className="badge badge-confirmed">Aprobada</span>;
      case 'regular': return <span className="badge badge-pending">Regular</span>;
      default: return <span className="badge">Pendiente</span>;
    }
  };

  return (
    <div className="app-container safe-bottom">
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)' }}><ArrowLeft size={24} /></button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Progreso Académico</h1>
      </header>

      <main style={{ padding: '1rem' }}>
        {/* GPA Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Promedio (con CBC)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.gpa}</span>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Promedio (sin CBC)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.gpaNoCbc}</span>
          </div>
        </div>

        {/* Cycle Progress */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} /> Avance por Ciclo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.summary.map(cycle => (
              <div key={cycle.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>{cycle.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{cycle.approved} / {cycle.total}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: cycle.progress === 100 ? 'var(--confirmed)' : 'var(--primary)', 
                      width: `${cycle.progress}%`,
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Materias</h3>
          <button onClick={() => handleOpenAdd()} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Plus size={16} /> Registrar Nota
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['CBC', 'Ciclo Biomédico', 'Ciclo Clínico', 'PFO'].map(cycleName => {
            const cycleSubjects = subjects.filter(s => s.cycle === cycleName);
            if (cycleSubjects.length === 0) return null;

            return (
              <div key={cycleName} style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>{cycleName}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cycleSubjects.map(subject => {
                    const record = academicHistory.find(r => r.subjectId === subject.id);
                    return (
                      <div key={subject.id} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {record ? (
                              <>
                                {getStatusBadge(record.status)}
                                {record.grade && <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Nota: {record.grade}</span>}
                              </>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>No registrada</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {record ? (
                            <>
                              <button onClick={() => handleEdit(record)} style={{ color: 'var(--text-tertiary)' }}><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(subject.id)} style={{ color: 'var(--urgent)' }}><Trash2 size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => handleOpenAdd(subject.id)} style={{ color: 'var(--primary)' }}><Plus size={20} /></button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '600px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingRecord ? 'Editar Registro' : 'Registrar Avance'}</h3>
              <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>

            <div className="input-group">
              <label className="input-label">Materia</label>
              <select 
                className="input-field" 
                value={selectedSubjectId} 
                onChange={e => setSelectedSubjectId(e.target.value)}
                disabled={!!editingRecord}
              >
                <option value="" disabled>Seleccionar materia...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.cycle})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Condición / Estado</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {['regular', 'approved', 'promoted'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setFormData({...formData, status: s})}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: 'var(--radius-md)', 
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      border: '1px solid var(--border-color)',
                      backgroundColor: formData.status === s ? 'var(--primary)' : 'transparent',
                      color: formData.status === s ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    {s === 'regular' ? 'Regular' : s === 'approved' ? 'Final' : 'Promo'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Nota (Opcional)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  min="1" max="10" 
                  value={formData.grade} 
                  onChange={e => setFormData({...formData, grade: e.target.value})} 
                  placeholder="Ej: 8"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fecha</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                />
              </div>
            </div>

            <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicProgressScreen;
