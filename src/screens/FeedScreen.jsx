import React, { useState } from 'react';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Header from '../components/Header';

const FeedScreen = () => {
  const { posts, loading, subjects } = useFeed();
  const { user } = useAuth();

  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const isDateInRange = (dateString, filter) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch(filter) {
      case 'today':
        return date.toDateString() === today.toDateString();
      case 'this_week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return date >= startOfWeek && date <= endOfWeek;
      }
      case 'this_month':
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      case 'next_month': {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return date.getMonth() === nextMonth.getMonth() && date.getFullYear() === nextMonth.getFullYear();
      }
      case 'this_semester': {
        const semesterStart = today.getMonth() < 7 ? new Date(today.getFullYear(), 2, 1) : new Date(today.getFullYear(), 7, 1);
        const semesterEnd = today.getMonth() < 7 ? new Date(today.getFullYear(), 6, 31) : new Date(today.getFullYear(), 11, 31);
        return date >= semesterStart && date <= semesterEnd;
      }
      case 'custom': {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(customEndDate);
        end.setHours(23,59,59,999);
        return date >= start && date <= end;
      }
      default:
        return true;
    }
  };

  const getFilteredPosts = () => {
    return posts.filter(post => {
      // 1. Category Filter
      let passCategory = true;
      if (categoryFilter === 'urgent') {
        passCategory = post.notificationWeight === 'urgent';
      } else if (categoryFilter === 'my_subjects') {
        passCategory = user?.enrolledSubjects?.includes(post.subjectId);
      } else if (categoryFilter !== 'all') {
        passCategory = post.subjectId === categoryFilter;
      }
      if (!passCategory) return false;

      // 2. Commission Filter (Bypassed for Admins)
      if (user?.role !== 'admin' && user?.selectedCommissions && user.selectedCommissions[post.subjectId]) {
        if (post.comision && post.comision !== user.selectedCommissions[post.subjectId]) {
          return false;
        }
      }

      // 3. Date Filter
      const isSpecificSubject = categoryFilter !== 'all' && categoryFilter !== 'urgent' && categoryFilter !== 'my_subjects';
      if (post.notificationWeight === 'urgent' && !isSpecificSubject) {
        return true; // Bypass
      }
      if (dateFilter !== 'all') {
        return isDateInRange(post.eventDate, dateFilter);
      }
      
      return true;
    }).sort((a, b) => {
      // Urgent always first
      if (a.notificationWeight === 'urgent' && b.notificationWeight !== 'urgent') return -1;
      if (b.notificationWeight === 'urgent' && a.notificationWeight !== 'urgent') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="app-container safe-bottom">
      <Header />
      
      <main style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Tu Feed</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <select 
              className="input-field" 
              style={{ minWidth: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="urgent">Urgentes</option>
              <option value="my_subjects">Mis materias actuales</option>
              <optgroup label="Tus Materias">
                {user?.enrolledSubjects?.map(id => {
                  const s = subjects.find(sub => sub.id === id);
                  return s ? <option key={id} value={id}>{s.name}</option> : null;
                })}
              </optgroup>
            </select>

            <select 
              className="input-field" 
              style={{ minWidth: '150px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Todos los avisos</option>
              <option value="today">Hoy</option>
              <option value="this_week">Esta semana</option>
              <option value="this_month">Este mes</option>
              <option value="next_month">El mes que viene</option>
              <option value="this_semester">Este cuatrimestre</option>
              <option value="custom">Rango personalizado</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="date" className="input-field" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
              <input type="date" className="input-field" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
            </div>
          )}
        </div>

        {loading ? (
          <div>
            <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }}></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div>
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3>Sin resultados</h3>
            <p>No hay eventos ni avisos para este período en tus materias.</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default FeedScreen;
