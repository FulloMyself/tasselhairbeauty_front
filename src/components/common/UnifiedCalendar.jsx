import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UnifiedCalendar = ({ userRole, userId, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [viewType, setViewType] = useState('month');
  const [weekStart, setWeekStart] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewType, weekStart, userRole, userId]);

  useEffect(() => {
    if (viewType === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      setWeekStart(start);
    }
  }, [viewType, currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const endpoint = '/calendar/events';
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

  // Helper to get local date string without timezone issues
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get date string from year/month/day numbers
  const getDateString = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day) => {
    const dateStr = getDateString(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    return events.filter(e => e.date === dateStr);
  };

  const handleDateClick = (day) => {
    const dateStr = getDateString(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    const dayEvents = getEventsForDate(day);
    
    setSelectedDate(dateStr);
    setSelectedDateEvents(dayEvents);
    
    if (onDateClick && dayEvents.length > 0) {
      onDateClick(day, dayEvents);
    }
  };

  const handleWeekDayClick = (weekDay) => {
    const dateStr = getLocalDateString(weekDay);
    const dayEvents = events.filter(e => e.date === dateStr);
    
    setSelectedDate(dateStr);
    setSelectedDateEvents(dayEvents);
    
    if (onDateClick && dayEvents.length > 0) {
      onDateClick(weekDay.getDate(), dayEvents);
    }
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
    setSelectedDateEvents([]);
  };

  const navigateWeek = (direction) => {
    if (viewType === 'week' && weekStart) {
      const newStart = new Date(weekStart);
      newStart.setDate(newStart.getDate() + (direction * 7));
      setWeekStart(newStart);
      setSelectedDate(null);
      setSelectedDateEvents([]);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    if (viewType === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      setWeekStart(start);
    }
    setSelectedDate(null);
    setSelectedDateEvents([]);
  };

  const handleViewChange = (newView) => {
    setViewType(newView);
    setSelectedDate(null);
    setSelectedDateEvents([]);
  };

  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  const isToday = (day) => {
    return currentDate.getFullYear() === today.getFullYear() &&
           currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDays = () => {
    if (!weekStart) return [];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    try {
      const d = new Date(selectedDate + 'T00:00:00');
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return selectedDate;
    }
  };

  return (
    <div className="unified-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="calendar-nav-btn" 
            onClick={() => viewType === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="calendar-title">
            <h2>
              <span className="month-name">{monthName}</span>
              <span className="year">{year}</span>
            </h2>
            {viewType === 'week' && weekStart && (
              <span className="week-range">
                {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          
          <button 
            className="calendar-nav-btn" 
            onClick={() => viewType === 'month' ? navigateMonth(1) : navigateWeek(1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-actions">
          <button className="calendar-today-btn" onClick={goToToday}>
            <i className="fas fa-calendar-day"></i> Today
          </button>
          
          <div className="calendar-view-toggle">
            <button 
              className={`view-btn ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => handleViewChange('month')}
            >
              <i className="fas fa-calendar-alt"></i> Month
            </button>
            <button 
              className={`view-btn ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => handleViewChange('week')}
            >
              <i className="fas fa-calendar-week"></i> Week
            </button>
          </div>
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
        <>
          {/* Month View */}
          {viewType === 'month' && (
            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = getDateString(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
                const dayEvents = events.filter(e => e.date === dateStr);
                const isCurrentDay = todayStr === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onClick={() => handleDateClick(day)}
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

          {/* Week View */}
          {viewType === 'week' && (
            <div className="week-view">
              {dayNames.map((dayName, idx) => {
                const weekDay = weekDays[idx];
                if (!weekDay) return null;
                
                const dateStr = getLocalDateString(weekDay);
                const dayEvents = events.filter(e => e.date === dateStr);
                const isCurrentDay = todayStr === dateStr;
                const isWeekSelected = selectedDate === dateStr;

                return (
                  <div key={dayName} className="week-day-column">
                    <div 
                      className={`week-day-header ${isCurrentDay ? 'today' : ''} ${isWeekSelected ? 'selected' : ''}`}
                      onClick={() => handleWeekDayClick(weekDay)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="week-day-name">{dayName}</span>
                      <span className={`week-day-number ${isCurrentDay ? 'today-badge' : ''}`}>
                        {weekDay.getDate()}
                      </span>
                    </div>
                    <div className="week-day-events">
                      {dayEvents.length === 0 ? (
                        <div className="no-events-mini">No events</div>
                      ) : (
                        dayEvents.map((event, idx) => {
                          const color = getEventColor(event.type);
                          return (
                            <div 
                              key={idx} 
                              className="week-event-card" 
                              style={{ borderLeft: `3px solid ${color.bg}`, cursor: 'pointer' }}
                              onClick={() => handleWeekDayClick(weekDay)}
                            >
                              <div className="week-event-header">
                                <span className="week-event-type" style={{ background: color.bg, color: color.text }}>
                                  {event.type}
                                </span>
                                {event.time && <span className="week-event-time">{event.time}</span>}
                              </div>
                              <p className="week-event-title">{event.title}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Selected Date Events Panel */}
      {selectedDate && (
        <div className="selected-date-panel">
          <div className="panel-header">
            <h3>
              <i className="fas fa-list"></i>{' '}
              Events for {formatSelectedDate()}
            </h3>
            <button className="panel-close" onClick={() => { setSelectedDate(null); setSelectedDateEvents([]); }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="panel-events">
            {selectedDateEvents.length === 0 ? (
              <p className="no-events">No events for this date</p>
            ) : (
              selectedDateEvents.map((event, idx) => {
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
                        {event.customerName && (
                          <span className="event-staff">
                            <i className="fas fa-user"></i> {event.customerName}
                          </span>
                        )}
                        {event.status && (
                          <span className={`event-status status-${event.status}`}>
                            {event.status}
                          </span>
                        )}
                        {event.amount && (
                          <span className="event-amount">
                            <i className="fas fa-money-bill"></i> R{event.amount?.toFixed(2)}
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