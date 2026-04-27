import React from 'react';
import { useFeed } from '../context/FeedContext';

const SubjectSelector = ({ selectedIds, onChange }) => {
  const { subjects } = useFeed();

  const toggleSubject = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sId => sId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const cycles = ['CBC', 'Ciclo Biomédico', 'Ciclo Clínico', 'PFO'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {cycles.map(cycle => {
        const cycleSubjects = subjects.filter(s => s.cycle === cycle || (!s.cycle && cycle === 'CBC')); // fallback for legacy
        if (cycleSubjects.length === 0) return null;

        return (
          <div key={cycle}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>{cycle}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {cycleSubjects.map(subject => {
                const isSelected = selectedIds.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-color)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all var(--transition)'
                    }}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubjectSelector;
