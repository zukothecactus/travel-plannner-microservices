import { useState } from 'react';
import { useDispatch } from 'react-redux';
// Uvozimo TAČNA imena tvojih metoda iz planSlice-a
import { dodajNaSpisak, toggleZavrseno, obrisiSaSpiska } from '../store/planSlice';

const Spisak = ({ planId, stavke = [] }) => {
  const dispatch = useDispatch();
  
  const [otvoreno, setOtvoreno] = useState(false);
  const [noviZadatak, setNoviZadatak] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noviZadatak) return;

    // Obrati pažnju: ovde mora biti PlanPutovanjaId sa velikim P, 
    // jer si ga tako napisao u svom dodajNaSpisak thunk-u!
    dispatch(dodajNaSpisak({
      tekst: noviZadatak,
      jeZavrseno: false,
      PlanPutovanjaId: planId 
    }));
    
    setNoviZadatak('');
  };

  return (
    <div style={{ background: '#1a1a1a', borderRadius: '8px', border: '1px solid #444', marginTop: '20px' }}>
      
      <div 
        onClick={() => setOtvoreno(!otvoreno)} 
        style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: '#242424', borderRadius: otvoreno ? '8px 8px 0 0' : '8px' }}
      >
        <h3 style={{ margin: 0 }}>📝 Spisak za putovanje</h3>
        <span>{otvoreno ? '▲' : '▼'}</span>
      </div>

      {otvoreno && (
        <div style={{ padding: '15px' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Unesi novu stavku (npr. Kupi kremu za sunčanje)..." 
              value={noviZadatak} 
              onChange={(e) => setNoviZadatak(e.target.value)} 
              style={{ flex: 1, padding: '8px' }}
            />
            <button type="submit" style={{ background: '#4CAF50', color: 'white' }}>Dodaj</button>
          </form>

          {stavke.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {stavke.map((stavka) => (
                <li key={stavka.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={stavka.jeZavrseno}
                      // Koristimo tvoju toggleZavrseno metodu
                      onChange={() => dispatch(toggleZavrseno({ stavkaId: stavka.id, planId }))}
                      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                    <span style={{ 
                      textDecoration: stavka.jeZavrseno ? 'line-through' : 'none', 
                      color: stavka.jeZavrseno ? '#888' : '#fff',
                      fontSize: '16px'
                    }}>
                      {stavka.tekst}
                    </span>
                  </div>

                  {/* Dodali smo i dugme koje poziva tvoju obrisiSaSpiska metodu! */}
                  <button 
                    onClick={() => dispatch(obrisiSaSpiska({ stavkaId: stavka.id, planId }))}
                    style={{ background: 'transparent', color: '#ff4d4d', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Obriši stavku"
                  >
                    ✖
                  </button>

                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Spisak je trenutno prazan.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Spisak;