import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UnifiedCalendar = ({ userRole, userId, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewType, setViewType] = useState('month'); // month or week

  useEffect(() => {
    fetchEvents();
  }, [currentDate, userRole, userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/calendar/events';
      const params = new URLSearchParams({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        role: userRole,
        userId: userId || ''
      });
      
      const response = await api.get(`${endpoint}?${params}`);
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getEventColor = (type) => {
    const colors = {
      booking: { bg: '#dbeafe', text: '#1e40af', icon: 'fa-calendar-check' },
      leave: { bg: '#fee2e2', text: '#991b1b', icon: 'fa-umbrella-beach' },
      appointment: { bg: '#d1fae5', text: '#065f46', icon: 'fa-cut' },
      order: { bg: '#fef3c7', text: '#92400e', icon: 'fa-shopping-cart' },
      special: { bg: '#fce7f3', text: '#9d174d', icon: 'fa-tag' },
      payroll: { bg: '#e0e7ff', text: '#3730a3', icon: 'fa-money-bill' },
    };
    return colors[type] || { bg: '#e5e7eb', text: '#374151', icon: 'fa-circle' };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const today = new Date();
  const isToday = (day) => {
    return currentDate.getFullYear() === today.getFullYear() &&
           currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="unified-calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{monthName}</h2>
          <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <button className="calendar-today-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>
        <div className="calendar-view-toggle">
          <button 
            className={`view-btn ${viewType === 'month' ? 'active' : ''}`}
            onClick={() => setViewType('month')}
          >
            Month
          </button>
          <button 
            className={`view-btn ${viewType === 'week' ? 'active' : ''}`}
            onClick={() => setViewType('week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* Event Legend */}
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#dbeafe' }}></span> Bookings
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#fee2e2' }}></span> Leave
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#d1fae5' }}></span> Appointments
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#fef3c7' }}></span> Orders
        </span>
      </div>

      {loading ? (
        <div className="calendar-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading events...
        </div>
      ) : (
        <div className="calendar-grid">
          {/* Day Names */}
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}

          {/* Empty cells for days before first of month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isSelected = selectedDate === day;
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day}
                className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  if (onDateClick && dayEvents.length > 0) {
                    onDateClick(day, dayEvents);
                  }
                }}
              >
                <span className="day-number">{day}</span>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map((event, idx) => {
                    const color = getEventColor(event.type);
                    return (
                      <div
                        key={idx}
                        className="day-event"
                        style={{ background: color.bg, color: color.text }}
                        title={`${event.type}: ${event.title}`}
                      >
                        <i className={`fas ${color.icon}`} style={{ fontSize: '8px', marginRight: '2px' }}></i>
                        <span className="event-label">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Date Events Panel */}
      {selectedDate && (
        <div className="selected-date-panel">
          <div className="panel-header">
            <h3>
              Events for {currentDate.toLocaleString('default', { month: 'long' })} {selectedDate}, {currentDate.getFullYear()}
            </h3>
            <button className="panel-close" onClick={() => setSelectedDate(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="panel-events">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="no-events">No events for this date</p>
            ) : (
              getEventsForDate(selectedDate).map((event, idx) => {
                const color = getEventColor(event.type);
                return (
                  <div key={idx} className="panel-event">
                    <div className="event-icon" style={{ background: color.bg, color: color.text }}>
                      <i className={`fas ${color.icon}`}></i>
                    </div>
                    <div className="event-details">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span className="event-type" style={{ background: color.bg, color: color.text }}>
                          {event.type}
                        </span>
                        {event.time && (
                          <span className="event-time">
                            <i className="fas fa-clock"></i> {event.time}
                          </span>
                        )}
                        {event.staffName && (
                          <span className="event-staff">
                            <i className="fas fa-user-tie"></i> {event.staffName}
                          </span>
                        )}
                        {event.status && (
                          <span className={`event-status status-${event.status}`}>
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCalendar;