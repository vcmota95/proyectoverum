import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useFeed } from '../context/FeedContext';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import PostCard from '../components/PostCard';
import { dataService } from '../services/mock';

const CalendarScreen = () => {
  const { posts } = useFeed();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'weekly'
  const [selectedDate, setSelectedDate] = useState(null);
  const [officialDates, setOfficialDates] = useState([]);

  useEffect(() => {
    const loadDates = async () => {
      const dates = await dataService.getOfficialDates();
      setOfficialDates(dates || []);
    };
    loadDates();
  }, []);

  const nextPeriod = () => {
    setSelectedDate(null);
    if (viewMode === 'monthly') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
  };

  const prevPeriod = () => {
    setSelectedDate(null);
    if (viewMode === 'monthly') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
  };

  // Get events logic
  const getAllEvents = () => {
    const postEvents = posts.filter(p => p.eventDate).map(p => ({
      ...p,
      dateString: p.eventDate,
      type: 'post'
    }));
    const offEvents = officialDates.map(d => ({
      ...d,
      dateString: d.date,
      type: 'official'
    }));
    return [...postEvents, ...offEvents];
  };

  const allEvents = getAllEvents();

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return allEvents.filter(e => e.dateString === dateStr);
  };

  // Generate calendar days
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'monthly') {
      const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    } else {
      // Weekly view
      const curr = new Date(currentDate);
      const first = curr.getDate() - curr.getDay(); // Sunday
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(new Date(curr.setDate(first + i)));
      }
      return days;
    }
  };

  const days = generateDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDotColor = (event) => {
    if (event.type === 'official') return 'blue';
    if (event.notificationWeight === 'urgent') return 'red';
    if (event.status === 'confirmed') return 'green';
    return 'yellow'; // pending
  };

  return (
    <div className="app-container safe-bottom">
      <Header />
      
      <main style={{ padding: '1rem', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Calendario</h2>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`btn ${viewMode === 'monthly' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >Mes</button>
            <button 
              onClick={() => setViewMode('weekly')}
              className={`btn ${viewMode === 'weekly' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >Semana</button>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={prevPeriod} style={{ padding: '0.5rem', color: 'var(--text-primary)' }}><ChevronLeft /></button>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {viewMode === 'weekly' ? 'Semana del ' : ''}
              {(selectedDate || currentDate).getDate()} {monthNames[(selectedDate || currentDate).getMonth()]} {(selectedDate || currentDate).getFullYear()}
            </h3>
            <button onClick={nextPeriod} style={{ padding: '0.5rem', color: 'var(--text-primary)' }}><ChevronRight /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', textAlign: 'center', marginBottom: '0.5rem' }}>
            {weekDays.map(day => (
              <div key={day} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px' }}>
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} />;
              
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const dayEvents = getEventsForDate(date);

              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedDate(date)}
                  style={{ 
                    aspectRatio: viewMode === 'monthly' ? '1 / 1' : 'auto',
                    minHeight: viewMode === 'weekly' ? '240px' : 'auto',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: viewMode === 'monthly' ? 'center' : 'flex-start',
                    padding: viewMode === 'weekly' ? '0.25rem' : '0.25rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backgroundColor: isSelected ? 'var(--primary-light)' : (viewMode === 'weekly' ? 'var(--bg-color)' : 'transparent'),
                    border: isToday ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  <span style={{ 
                    width: '30px', height: '30px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', 
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? 'white' : (isToday ? 'var(--primary)' : 'var(--text-primary)'),
                    fontWeight: (isToday || isSelected) ? 'bold' : 'normal',
                    marginBottom: '0.25rem'
                  }}>
                    {date.getDate()}
                  </span>
                  
                  {viewMode === 'monthly' ? (
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '30px' }}>
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDotColor(e) }} />
                      ))}
                      {dayEvents.length > 3 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)' }} />}
                    </div>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {dayEvents.length === 0 ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.5rem' }}>Sin eventos</div>
                      ) : (
                        dayEvents.map((e, i) => (
                          <div key={i} style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.25rem 0.4rem', 
                            backgroundColor: getDotColor(e),
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '4px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {e.title}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Sheet for Events */}
      {selectedDate && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setSelectedDate(null)} />
          <div className="card animate-slide-up" style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, zIndex: 100, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: 'calc(100vh - 70px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Eventos del {selectedDate.getDate()}/{selectedDate.getMonth() + 1}</h3>
              <button onClick={() => setSelectedDate(null)} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '50%', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id}>
                  {event.type === 'official' ? (
                    <div style={{ padding: '1rem', borderLeft: '4px solid blue', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className="badge" style={{ backgroundColor: 'blue', color: 'white' }}>Calendario Académico UBA</span>
                      </div>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{event.description}</p>
                    </div>
                  ) : (
                    <PostCard post={event} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarScreen;
