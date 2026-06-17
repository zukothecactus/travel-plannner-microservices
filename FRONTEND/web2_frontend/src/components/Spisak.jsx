import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajNaSpisak, toggleZavrseno, obrisiSaSpiska } from '../store/planSlice';

// Dodali smo prop 'samoPregled' sa podrazumevanom vrednošću false
const Spisak = ({ planId, stavke = [], samoPregled = false }) => {
  const dispatch = useDispatch();
  
  const [otvoreno, setOtvoreno] = useState(false);
  const [noviZadatak, setNoviZadatak] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noviZadatak) return;

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
        style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
      >
        <h3 style={{ margin: 0 }}>📝 To-Do Spisak ({stavke.length})</h3>
        <span>{otvoreno ? '▲' : '▼'}</span>
      </div>

      {otvoreno && (
        <div style={{ padding: '15px', borderTop: '1px solid #444' }}>
          
          {/* Prikazujemo formu za dodavanje SAMO ako nismo u modu samo za pregled */}
          {!samoPregled && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Dodaj novu stavku..." 
                value={noviZadatak} 
                onChange={(e) => setNoviZadatak(e.target.value)}
                style={{ flex: 1 }} 
              />
              <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
                Dodaj
              </button>
            </form>
          )}

          {stavke.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {stavke.map((stavka) => (
                <li key={stavka.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#2a2a2a', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={stavka.jeZavrseno}
                      // Zaključavamo checkbox ako je u pitanju samo pregled
                      disabled={samoPregled} 
                      onChange={() => dispatch(toggleZavrseno({ stavkaId: stavka.id, planId }))}
                      style={{ cursor: samoPregled ? 'not-allowed' : 'pointer', width: '20px', height: '20px' }}
                    />
                    <span style={{ 
                      textDecoration: stavka.jeZavrseno ? 'line-through' : 'none', 
                      color: stavka.jeZavrseno ? '#888' : '#fff',
                      fontSize: '16px'
                    }}>
                      {stavka.tekst}
                    </span>
                  </div>

                  {/* Dugme za brisanje prikazujemo SAMO ako nismo u modu samo za pregled */}
                  {!samoPregled && (
                    <button 
                      onClick={() => dispatch(obrisiSaSpiska({ stavkaId: stavka.id, planId }))}
                      style={{ background: 'transparent', color: '#ff4d4d', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      title="Obriši stavku"
                    >
                      ✖
                    </button>
                  )}
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