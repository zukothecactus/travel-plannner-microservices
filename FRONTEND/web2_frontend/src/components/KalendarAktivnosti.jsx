import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure the localizer via moment
const localizer = momentLocalizer(moment);

const KalendarAktivnosti = ({ 
  aktivnosti = [], 
  onAktivnostSelektovana, 
  onPrazanSlotSelektovan,
  onAktivnostObrisana 
}) => {
  // 1. Controlled State for Date and View to make toolbar navigation/switching responsive
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');
  const initialFocusedRef = useRef(false);

  // Auto-focus on the first activity date on initial load to improve user experience
  useEffect(() => {
    if (aktivnosti && aktivnosti.length > 0 && !initialFocusedRef.current) {
      const firstAct = aktivnosti.find(a => a.vremePocetka);
      if (firstAct) {
        setDate(new Date(firstAct.vremePocetka));
        initialFocusedRef.current = true;
      }
    }
  }, [aktivnosti]);

  // Map activities from Redux/props to the schema expected by react-big-calendar
  const dogadjaji = aktivnosti.map(a => ({
    id: a.id,
    title: a.naziv,
    start: new Date(a.vremePocetka),
    end: new Date(a.vremeZavrsetka),
    opis: a.opis,
    lokacija: a.lokacija,
    trosak: a.trosak,
    status: a.status,
    destinacijaId: a.destinacijaId
  }));

  // 3. Custom component for rendering events in Agenda ("Spisak") view
  const CustomAgendaEvent = ({ event }) => {
    const handleEdit = (e) => {
      e.stopPropagation();
      if (onAktivnostSelektovana) {
        onAktivnostSelektovana(event);
      }
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      if (window.confirm(`Obriši aktivnost "${event.title}"?`)) {
        if (onAktivnostObrisana) {
          onAktivnostObrisana(event.id);
        }
      }
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '2px 0'
      }}>
        <span 
          style={{ 
            cursor: onAktivnostSelektovana ? 'pointer' : 'default', 
            fontWeight: 500,
            color: 'var(--text-main, #091D36)'
          }}
          onClick={() => onAktivnostSelektovana && onAktivnostSelektovana(event)}
        >
          {event.title}
        </span>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onAktivnostSelektovana && (
            <button
              onClick={handleEdit}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #9BC1EE)',
                background: 'white',
                color: 'var(--text-main, #091D36)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gray-flash, #F0EFF5)';
                e.currentTarget.style.borderColor = 'var(--accent-primary, #0B4C84)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = 'var(--border-color, #9BC1EE)';
              }}
            >
              ✏️ Izmeni
            </button>
          )}
          {onAktivnostObrisana && (
            <button
              onClick={handleDelete}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                background: 'white',
                color: 'var(--danger, #ef4444)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.borderColor = 'var(--danger, #ef4444)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              ✖ Obriši
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '600px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }} className="card">
      <Calendar
        localizer={localizer}
        events={dogadjaji}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        onSelectEvent={onAktivnostSelektovana}
        onSelectSlot={onPrazanSlotSelektovan}
        
        // Controlled properties
        date={date}
        view={view}
        onNavigate={(newDate) => setDate(newDate)}
        onView={(newView) => setView(newView)}

        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        
        components={{
          agenda: {
            event: CustomAgendaEvent
          }
        }}
        
        // 2. Serbian/Bosnian Translations for calendar controls
        messages={{
          next: 'Sledeći',
          previous: 'Prethodni',
          today: 'Danas',
          month: 'Mesec',
          week: 'Nedelja',
          day: 'Dan',
          agenda: 'Spisak',
          date: 'Datum',
          time: 'Vreme',
          event: 'Aktivnost',
          noEventsInRange: 'Nema planiranih aktivnosti u ovom periodu.'
        }}
      />
    </div>
  );
};

export default KalendarAktivnosti;