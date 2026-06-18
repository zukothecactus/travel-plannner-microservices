import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Podešavanje lokalizatora preko moment biblioteke
const localizer = momentLocalizer(moment);

const KalendarAktivnosti = ({ aktivnosti, onAktivnostSelektovana, onPrazanSlotSelektovan }) => {
  
  // Mapiramo aktivnosti iz Redux-a u format koji react-big-calendar prepoznaje
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
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week" // Nedeljni pregled je najpraktičniji za putovanja
        messages={{
          next: 'Sledeći',
          previous: 'Prethodni',
          today: 'Danas',
          month: 'Mesec',
          week: 'Nedelja',
          day: 'Dan',
          agenda: 'Spisak'
        }}
      />
    </div>
  );
};

export default KalendarAktivnosti;