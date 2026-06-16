import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dobaviPlan, dobaviPotrosnju, obrisiTrosak } from './store/planSlice';
import { logout } from './store/authSlice';
import DodajTrosak from './components/DodajTrosak';
import ListaPlanova from './components/ListaPlanova';
import DodajDestinaciju from './components/DodajDestinaciju';
import Spisak from './components/Spisak'; 
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Sharing from './components/Sharing';
import DeljeniPlan from './components/DeljeniPlan';
import './App.css';

function App() {
  const dispatch = useDispatch();
  
  const [prikaziLogin, setPrikaziLogin] = useState(true);
  const [aktivniPlanId, setAktivniPlanId] = useState(null);
  const [prikaziAdminPanel, setPrikaziAdminPanel] = useState(false);
  const [prikaziModalZaDeljenje, setPrikaziModalZaDeljenje] = useState(false);
  
  const { token, korisnik } = useSelector((state) => state.auth);
  const { podaci, trenutniBudzet, ucitava, greska } = useSelector((state) => state.plan);

  useEffect(() => {
    if (token && aktivniPlanId !== null) {
      dispatch(dobaviPlan(aktivniPlanId));
      dispatch(dobaviPotrosnju(aktivniPlanId));
    }
  }, [dispatch, aktivniPlanId, token]);

  // Provera da li je korisnik došao preko QR koda / linka za deljenje
const putanja = window.location.pathname; // npr. /deli/ovde_ide_token
if (putanja.startsWith('/deli/')) {
    // Izdvajamo token string iz URL-a
    const urlTokenZaDeljenje = putanja.split('/deli/')[1];

    return (
        <div className="app-container">
            <DeljeniPlan token={urlTokenZaDeljenje} />
        </div>
    );
}

  if (!token) {
    return (
      <div className="app-container">
        <h1>🌍 Dobrodošli u Travel Planner</h1>
        {prikaziLogin ? (
          <Login onPrebaciNaRegistraciju={() => setPrikaziLogin(false)} />
        ) : (
          <Register onPrebaciNaLogin={() => setPrikaziLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER SA DUGMETOM ZA ODJAVU */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🌍 Moj Travel Planner</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Zdravo, <strong>{korisnik?.ime}</strong>!</span>
          
          {/* Prikazujemo dugme za Admin Panel samo ako je korisnik ADMIN */}
          {korisnik?.uloga === 'ADMIN' && (
            <button 
              onClick={() => {
                setPrikaziAdminPanel(!prikaziAdminPanel);
                setAktivniPlanId(null); 
              }}
              style={{ background: '#ff9800', padding: '8px 15px', color: '#fff' }}
            >
              {prikaziAdminPanel ? 'Nazad na planove' : 'Admin Panel'}
            </button>
          )}

          <button 
            onClick={() => {
              dispatch(logout());
              setAktivniPlanId(null); 
              setPrikaziAdminPanel(false); 
            }} 
            style={{ background: '#ff4d4d', padding: '8px 15px' }}
          >
            Odjavi se
          </button>
        </div>
      </div>

      {/* GLAVNI SADRŽAJ (Admin Panel ili Planovi) */}
      {prikaziAdminPanel ? (
        <AdminPanel />
      ) : (
        <>
          {aktivniPlanId === null ? (
            <ListaPlanova onIzaberiPlan={(id) => setAktivniPlanId(id)} />
          ) : (
            <div>
              <button 
                onClick={() => setAktivniPlanId(null)} 
                style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #fff' }}
              >
                ← Nazad na sva putovanja
              </button>

              {ucitava && <p>Učitavanje detalja plana...</p>}
              {greska && <p style={{ color: 'red' }}>Greška: {greska}</p>}

              {podaci && (
                <div style={{ textAlign: 'left', background: '#242424', padding: '20px', borderRadius: '8px', border: '1px solid #646cff' }}>
                  <h2>{podaci.naziv}</h2>
                  <p><strong>Opis:</strong> {podaci.opis}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1a1a1a', padding: '10px', borderRadius: '5px' }}>
                    <span><strong>Planirani budžet:</strong> {podaci.planiraniBudzet}</span>
                    <span style={{ color: trenutniBudzet > podaci.planiraniBudzet ? '#ff4d4d' : '#4dff4d' }}>
                      <strong>Trenutna potrošnja:</strong> {trenutniBudzet}
                    </span>
                  </div>

                  <button 
                      onClick={() => setPrikaziModalZaDeljenje(true)}
                      style={{ background: '#646cff', color: 'white', marginLeft: '15px', padding: '8px 16px', border: 'none', borderRadius: '8px' }}
                  >
                      🔗 Podeli
                  </button>
            
                  <Spisak planId={podaci.id} stavke={podaci.spisak || []} />
                  
                  <hr style={{ margin: '20px 0', borderColor: '#444' }} />
                  
                  <DodajDestinaciju planId={podaci.id} />

                  <hr style={{ margin: '20px 0', borderColor: '#444' }} />

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

                  <hr style={{ margin: '20px 0', borderColor: '#444' }} />

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
              {prikaziModalZaDeljenje && (
                  <Sharing 
                      planId={aktivniPlanId} 
                      onClose={() => setPrikaziModalZaDeljenje(false)} 
                  />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;