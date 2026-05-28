import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dobaviPlan, dobaviPotrosnju, obrisiTrosak } from './store/planSlice';
import DodajTrosak from './components/DodajTrosak';
import ListaPlanova from './components/ListaPlanova';
import DodajDestinaciju from './components/DodajDestinaciju';
import './App.css';

function App() {
  const dispatch = useDispatch();
  
  const [aktivniPlanId, setAktivniPlanId] = useState(null);

  const { podaci, trenutniBudzet, ucitava, greska } = useSelector((state) => state.plan);

  // okida se kada se aktivniPlanId promeni
  useEffect(() => {
    if (aktivniPlanId !== null) {
      dispatch(dobaviPlan(aktivniPlanId));
      dispatch(dobaviPotrosnju(aktivniPlanId));
    }
  }, [dispatch, aktivniPlanId]);

  return (
    <div className="app-container">
      <h1>🌍 Moj Travel Planner</h1>
      
      {/* Ako nemamo izabran plan, prikazujemo listu */}
      {aktivniPlanId === null ? (
        <ListaPlanova onIzaberiPlan={(id) => setAktivniPlanId(id)} />
      ) : (
        /* Ako imamo izabran plan, prikazujemo detalje */
        <div>
          <button 
            onClick={() => setAktivniPlanId(null)} 
            style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #fff' }}
          >
            ← Nazad na sva putovanja
          </button>

          {ucitava && <p>Učitavanje detalja plana...</p>}
          {greska && <p style={{ color: 'red' }}>Greška: {greska}</p>}

          {podaci && !ucitava && (
            <div style={{ textAlign: 'left', background: '#242424', padding: '20px', borderRadius: '8px', border: '1px solid #646cff' }}>
              <h2>{podaci.naziv}</h2>
              <p><strong>Opis:</strong> {podaci.opis}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a1a1a', padding: '10px', borderRadius: '5px' }}>
                <span><strong>Planirani budžet:</strong> {podaci.planiraniBudzet}</span>
                <span style={{ color: trenutniBudzet > podaci.planiraniBudzet ? '#ff4d4d' : '#4dff4d' }}>
                  <strong>Trenutna potrošnja:</strong> {trenutniBudzet}
                </span>
              </div>
              
              {/* FORMA ZA DESTINACIJE */}
              <DodajDestinaciju planId={podaci.id} />

              <hr style={{ margin: '20px 0', borderColor: '#444' }} />

              {/* LISTA DESTINACIJA */}
              <h3>Planirane destinacije:</h3>
              {podaci.destinacije && podaci.destinacije.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {podaci.destinacije.map((dest) => (
                    <div key={dest.id} style={{ background: '#34495e', padding: '15px', borderRadius: '5px', borderLeft: '5px solid #3498db' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{dest.nazivMesta}</h4>
                      {dest.napomena && <p style={{ margin: '0 0 10px 0', fontStyle: 'italic', fontSize: '14px', color: '#ccc' }}>{dest.napomena}</p>}
                      <div style={{ fontSize: '13px', color: '#aaa' }}>
                        <strong>Od:</strong> {new Date(dest.datumDolaska).toLocaleDateString()} <br />
                        <strong>Do:</strong> {new Date(dest.datumOdlaska).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#888', marginBottom: '20px' }}>Nemate unetih destinacija za ovo putovanje.</p>
              )}


              <DodajTrosak planId={podaci.id} />

              <hr style={{ margin: '20px 0', borderColor: '#444' }} />
              
              <h3>Zabeleženi troškovi:</h3>
              {podaci.troskovi && podaci.troskovi.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {podaci.troskovi.map((trosak) => (
                   <li key={trosak.id} style={{ background: '#333', padding: '10px', marginBottom: '5px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{trosak.kategorija}</strong> - {trosak.opis} <br/>
                        <span style={{ color: '#aaa' }}>Iznos: {trosak.iznos}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if(window.confirm('Obriši ovaj trošak?')) {
                            dispatch(obrisiTrosak({ trosakId: trosak.id, planId: podaci.id, iznos: trosak.iznos }));
                          }
                        }}
                        style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', height: 'fit-content', cursor: 'pointer' }}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nema evidentiranih troškova za ovaj plan.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;