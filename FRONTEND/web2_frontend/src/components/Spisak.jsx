import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajNaSpisak, toggleZavrseno, obrisiSaSpiska } from '../store/planSlice';

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
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      
      <div 
        onClick={() => setOtvoreno(!otvoreno)} 
        className="flex-between"
        style={{ padding: '16px 20px', cursor: 'pointer', background: 'var(--bg-main)', borderBottom: otvoreno ? '1px solid var(--border-color)' : 'none' }}
      >
        <h3 style={{ margin: 0, fontSize: '18px' }}>📝 To-Do Spisak ({stavke.length})</h3>
        <span style={{ color: 'var(--text-muted)' }}>{otvoreno ? '▲' : '▼'}</span>
      </div>

      {otvoreno && (
        <div style={{ padding: '20px' }}>
          
          {!samoPregled && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                className="input-field"
                placeholder="Dodaj novu stavku..." 
                value={noviZadatak} 
                onChange={(e) => setNoviZadatak(e.target.value)}
                style={{ marginBottom: 0 }} 
              />
              <button type="submit" className="btn btn-primary">
                Dodaj
              </button>
            </form>
          )}

          {stavke.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {stavke.map((stavka) => (
                <li key={stavka.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: samoPregled ? 'default' : 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={stavka.jeZavrseno}
                      disabled={samoPregled} 
                      onChange={() => dispatch(toggleZavrseno({ stavkaId: stavka.id, planId }))}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ 
                      textDecoration: stavka.jeZavrseno ? 'line-through' : 'none', 
                      color: stavka.jeZavrseno ? 'var(--text-muted)' : 'var(--text-main)',
                      fontSize: '15px'
                    }}>
                      {stavka.tekst}
                    </span>
                  </label>

                  {!samoPregled && (
                    <button 
                      onClick={() => dispatch(obrisiSaSpiska({ stavkaId: stavka.id, planId }))}
                      style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '4px' }}
                      title="Obriši stavku"
                      onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      ✖
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted" style={{ fontStyle: 'italic', margin: 0 }}>Spisak je trenutno prazan.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Spisak;