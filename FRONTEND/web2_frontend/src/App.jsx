import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  dobaviPlan, 
  dobaviPotrosnju, 
  obrisiTrosak, 
  resetujGenerisaniToken, 
  obrisiDestinaciju,
  izmeniPlan,
  izmeniDestinaciju,
  izmeniTrosak, 
  izmeniAktivnost,
  obrisiAktivnost
} from './store/planSlice';
import { logout } from './store/authSlice';
import { generisiPlanPDF } from './services/pdfGenerator';
import DodajTrosak from './components/DodajTrosak';
import ListaPlanova from './components/ListaPlanova';
import DodajDestinaciju from './components/DodajDestinaciju';
import Spisak from './components/Spisak'; 
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Sharing from './components/Sharing';
import DeljeniPlan from './components/DeljeniPlan';
import DodajAktivnost from './components/DodajAktivnost';
import KalendarAktivnosti from './components/KalendarAktivnosti';
import RouteMap from './components/RouteMap';
import './App.css';

function App() {
  const dispatch = useDispatch();
  
  const [prikaziLogin, setPrikaziLogin] = useState(true);
  const [aktivniPlanId, setAktivniPlanId] = useState(null);
  const [prikaziAdminPanel, setPrikaziAdminPanel] = useState(false);
  const [prikaziModalZaDeljenje, setPrikaziModalZaDeljenje] = useState(false);
  
  // Stanja za izmenu osnovnih podataka plana putovanja
  const [izmenaPlana, setIzmenaPlana] = useState(false);
  const [planNaziv, setPlanNaziv] = useState('');
  const [planOpis, setPlanOpis] = useState('');
  const [planBudzet, setPlanBudzet] = useState('');

  // Stanja za inline izmenu selektovane destinacije
  const [izmenaDestinacijeId, setIzmenaDestinacijeId] = useState(null);
  const [destinacijaMesto, setDestinacijaMesto] = useState('');
  const [destinacijaNapomena, setDestinacijaNapomena] = useState('');
  const [destinacijaDolazak, setDestinacijaDolazak] = useState('');
  const [destinacijaOdlazak, setDestinacijaOdlazak] = useState('');

  // Stanja za inline izmenu selektovanog troška
  const [izmenaTroskaId, setIzmenaTroskaId] = useState(null);
  const [trosakKategorija, setTrosakKategorija] = useState('');
  const [trosakOpis, setTrosakOpis] = useState('');
  const [trosakIznos, setTrosakIznos] = useState('');

  const [selektovanaKategorija, setSelektovanaKategorija] = useState('Svi troskovi');
  const kategorije = ['Svi troskovi', 'Smeštaj', 'Prevoz', 'Hrana', 'Ostalo'];

// Stanja za kontrolu kalendara i aktivnosti
const [prikaziModalZaAktivnost, setPrikaziModalZaAktivnost] = useState(false);
const [aktivnostZaEdit, setAktivnostZaEdit] = useState(null);
const [aktivnaDestinacijaId, setAktivnaDestinacijaId] = useState(null); // Dodato da se ne bi bunio prosleđeni prop u Formi

  const { token, korisnik } = useSelector((state) => state.auth);
  const { podaci, trenutniBudzet, ucitava, greska } = useSelector((state) => state.plan);

  useEffect(() => {
    if (token && aktivniPlanId !== null) {
      dispatch(dobaviPlan(aktivniPlanId));
      dispatch(dobaviPotrosnju(aktivniPlanId));
    }
  }, [dispatch, token, aktivniPlanId]);


  const handleSavePlan = () => {
    dispatch(izmeniPlan({
      id: podaci.id,
      naziv: noviNaziv,
      opis: noviOpis,
      planiraniBudzet: parseFloat(noviBudzet),
      korisnikId: podaci.korisnikId
    }));
    setIsEditingPlan(false);
  };

  // Funkcije za izmenu Plana
const pokreniIzmenuPlana = () => {
  setPlanNaziv(podaci.naziv);
  setPlanOpis(podaci.opis || '');
  setPlanBudzet(podaci.planiraniBudzet);
  setIzmenaPlana(true);
};

const handleSacuvajPlan = () => {
  dispatch(izmeniPlan({
    id: podaci.id,
    naziv: planNaziv,
    opis: planOpis,
    planiraniBudzet: parseFloat(planBudzet),
    korisnikId: podaci.korisnikId
  }));
  setIzmenaPlana(false);
};

// Funkcije za izmenu Destinacije
const pokreniIzmenuDestinacije = (destinacija) => {
  setIzmenaDestinacijeId(destinacija.id);
  setDestinacijaMesto(destinacija.nazivMesta);
  setDestinacijaNapomena(destinacija.napomena || '');
  // Secemo string na YYYY-MM-DD format koji input type="date" zahteva
  setDestinacijaDolazak(destinacija.datumDolaska.substring(0, 10));
  setDestinacijaOdlazak(destinacija.datumOdlaska.substring(0, 10));
};

const handleSacuvajDestinaciju = (id) => {
  dispatch(izmeniDestinaciju({
    id,
    nazivMesta: destinacijaMesto,
    napomena: destinacijaNapomena,
    datumDolaska: new Date(destinacijaDolazak).toISOString(),
    datumOdlaska: new Date(destinacijaOdlazak).toISOString(),
    planPutovanjaId: podaci.id
  }));
  setIzmenaDestinacijeId(null);
};

// Funkcije za izmenu Troška
const pokreniIzmenuTroska = (trosak) => {
  setIzmenaTroskaId(trosak.id);
  setTrosakKategorija(trosak.kategorija);
  setTrosakOpis(trosak.opis || '');
  setTrosakIznos(trosak.iznos);
};

const handleSacuvajTrosak = (id) => {
  dispatch(izmeniTrosak({
    id,
    kategorija: trosakKategorija,
    opis: trosakOpis,
    iznos: parseFloat(trosakIznos),
    planPutovanjaId: podaci.id,
    datum: new Date().toISOString()
  }));
  setIzmenaTroskaId(null);
};
const handleAktivnostSelektovana = (event) => {
  // Mapiramo nazad u format koji tvoja FormaAktivnost očekuje za editovanje
  setAktivnostZaEdit({
    id: event.id,
    naziv: event.title,
    vremePocetka: event.start.toISOString(),
    vremeZavrsetka: event.end.toISOString(),
    opis: event.opis,
    lokacija: event.lokacija,
    trosak: event.trosak,
    status: event.status,
    destinacijaId: event.destinacijaId
  });
  setPrikaziModalZaAktivnost(true);
};

const handlePrazanSlotSelektovan = (slotInfo) => {
  setAktivnostZaEdit(null); // Osiguravamo da je prazno za novu aktivnost
  setPrikaziModalZaAktivnost(true);
};

const sviTroskovi = podaci?.troskovi || [];
const prikazaniTroskovi = selektovanaKategorija === 'Svi troskovi' 
    ? sviTroskovi
    : sviTroskovi.filter(t => t.kategorija?.toLowerCase() === selektovanaKategorija.toLowerCase());

// Prikupljamo sve aktivnosti iz svih destinacija koje pripadaju ovom planu
const sveAktivnosti = podaci?.destinacije?.flatMap(d => d.aktivnosti || []) || [];

// Provera da li se korisnik trenutno nalazi na ruti za deljeni plan
const jesteDeljeniLink = window.location.pathname.includes('/deli/');
const deljeniToken = jesteDeljeniLink ? window.location.pathname.split('/deli/')[1] : null;

// 1. PRVO proveravamo da li je korisnik na deljenom linku
if (jesteDeljeniLink) {
  // Renderujemo DeljeniPlan bez obzira da li ima token. 
  // Ako mu treba token za EDIT a nema ga, DeljeniPlan će sam prikazati Login formu.
  return <DeljeniPlan token={deljeniToken} />;
}

// 2. TEK ONDA, ako NIJE na deljenom linku, a nema token, tražimo da se uloguje za pristup glavnoj aplikaciji
if (!token) {
  return prikaziLogin ? (
    <Login onPrebaciNaRegistraciju={() => setPrikaziLogin(false)} />
  ) : (
    <Register onPrebaciNaLogin={() => setPrikaziLogin(true)} />
  );
}

  return (
    <div className="app-container">
      
      {/* Glavno zaglavlje aplikacije (Header) */}
      <div className="card flex-between" style={{ padding: '16px 24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--venice-blue)' }}>Zdravo, {korisnik?.ime || 'Putniče'}! 👋</h2>
          {korisnik?.uloga === 'ADMIN' && (
            <button 
              onClick={() => setPrikaziAdminPanel(!prikaziAdminPanel)}
              className={prikaziAdminPanel ? "btn btn-primary" : "btn btn-outline"}
            >
              {prikaziAdminPanel ? 'Nazad na planove' : 'Admin Panel'}
            </button>
          )}
          
        </div>
        <button 
          onClick={() => { 
            dispatch(logout()); 
            setAktivniPlanId(null);
            setPrikaziAdminPanel(false);
          }}
          className="btn btn-outline"
          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
          onMouseOver={(e) => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--danger)'; }}
        >
          Odjavi se
        </button>
      </div>

      {/* Sadržaj ispod zaglavlja */}
      {prikaziAdminPanel ? (
        <AdminPanel />
      ) : aktivniPlanId === null ? (
        <ListaPlanova onIzaberiPlan={(id) => setAktivniPlanId(id)} />
      ) : (
        <div>
          <button 
            onClick={() => setAktivniPlanId(null)}
            className="btn btn-outline"
            style={{ marginBottom: '20px' }}
          >
            ⬅ Nazad na sve planove
          </button>

          {ucitava ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '40px' }}>Učitavanje detalja plana...</p>
          ) : greska ? (
            <p style={{ color: 'var(--danger)', textAlign: 'center' }}>Greška: {greska}</p>
          ) : podaci && (
            <div>
              {/* Kartica sa informacijama o aktivnom planu */}
              <div className="card">
                <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h1 style={{ marginBottom: '8px', color: 'var(--mystic-blue)' }}>{podaci?.naziv}</h1>
                    <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>{podaci?.opis}</p>
                  </div>
                  <button 
                    onClick={() => setPrikaziModalZaDeljenje(true)}
                    className="btn btn-primary"
                    style={{ marginTop: '30px', marginLeft: '10px' }}
                  >
                    🔗 Podeli plan
                  </button>
                  <button 
                    onClick={() => generisiPlanPDF(podaci, trenutniBudzet)} 
                    className="btn btn-primary"
                    style={{ backgroundColor: '#2ca01c', borderColor: '#2ca01c', margin: '30px 10px 0 0' }} // Zelena boja za dokumente
                  >
                    📄 Generiši PDF
                  </button>
                  {!izmenaPlana && (
                    <button onClick={pokreniIzmenuPlana} className="btn btn-primary" style={{ marginTop: '30px', marginLeft: '-10px' }}>
                      ✏ Izmeni plan
                    </button>
                  )}
                  {izmenaPlana && (
                    <div className="card" style={{ padding: '20px', marginBottom: '25px', borderColor: 'var(--accent-primary)' }}>
                      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Uredi plan putovanja</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={planNaziv} 
                          onChange={(e) => setPlanNaziv(e.target.value)} 
                          placeholder="Naziv plana"
                        />
                        <textarea 
                          className="input-field" 
                          value={planOpis} 
                          onChange={(e) => setPlanOpis(e.target.value)} 
                          placeholder="Opis putovanja (opciono)"
                          rows="3"
                        />
                        <input 
                          type="number" 
                          className="input-field" 
                          value={planBudzet} 
                          onChange={(e) => setPlanBudzet(e.target.value)} 
                          placeholder="Planirani budžet (EUR)"
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '5px' }}>
                          <button onClick={() => setIzmenaPlana(false)} className="btn btn-outline" style={{ padding: '6px 12px' }}>Otkaži</button>
                          <button onClick={handleSacuvajPlan} className="btn btn-primary" style={{ padding: '6px 12px' }}>Sačuvaj</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Budžet sekcija */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, padding: '16px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                    <span className="text-muted" style={{ fontSize: '13px', display: 'block' }}>Planirani budžet</span>
                    <strong style={{ fontSize: '20px', color: 'var(--mystic-blue)' }}>{podaci.planiraniBudzet} RSD</strong>
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: trenutniBudzet < 0 ? '#fee2e2' : 'var(--bg-main)', borderRadius: '8px' }}>
                    <span className="text-muted" style={{ fontSize: '13px', display: 'block' }}> Potrošeno</span>
                    <strong style={{ fontSize: '20px', color: trenutniBudzet < 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {trenutniBudzet} RSD
                    </strong>
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: trenutniBudzet < 0 ? '#fee2e2' : 'var(--bg-main)', borderRadius: '8px' }}>
                    <span className="text-muted" style={{ fontSize: '13px', display: 'block' }}> Preostali budžet</span>
                    <strong style={{ fontSize: '20px', color: trenutniBudzet < 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {podaci.planiraniBudzet - trenutniBudzet} RSD
                    </strong>
                  </div>
                </div>
              </div>

              {/* To-Do Spisak */}
              <Spisak planId={podaci.id} stavke={podaci.spisak} />

              {/* Sekcija za Destinacije */}
              <div style={{ marginTop: '40px' }}>
                <h2 style={{ color: 'var(--venice-blue)' }}>📍 Destinacije</h2>
                <DodajDestinaciju planId={podaci.id} />
                
                {podaci.destinacije && podaci.destinacije.map((destinacija) => (
                  <div key={destinacija.id} className="card" style={{ marginBottom: '12px', padding: '14px' }}>
                    {izmenaDestinacijeId === destinacija.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={destinacijaMesto} 
                          onChange={(e) => setDestinacijaMesto(e.target.value)} 
                          placeholder="Naziv mesta"
                        />
                        <input 
                          type="text" 
                          className="input-field" 
                          value={destinacijaNapomena} 
                          onChange={(e) => setDestinacijaNapomena(e.target.value)} 
                          placeholder="Napomena"
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="date" className="input-field" value={destinacijaDolazak} onChange={(e) => setDestinacijaDolazak(e.target.value)} />
                          <input type="date" className="input-field" value={destinacijaOdlazak} onChange={(e) => setDestinacijaOdlazak(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setIzmenaDestinacijeId(null)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px' }}>Otkaži</button>
                          <button onClick={() => handleSacuvajDestinaciju(destinacija.id)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '13px' }}>Sačuvaj</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-between">
                        <div>
                          <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>📍 {destinacija.nazivMesta}</strong>
                          {destinacija.napomena && <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{destinacija.napomena}</p>}
                          <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>
                            📅 {new Date(destinacija.datumDolaska).toLocaleDateString()} - {new Date(destinacija.datumOdlaska).toLocaleDateString()}
                          </small>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => pokreniIzmenuDestinacije(destinacija)}
                            className="btn"
                            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', fontSize: '16px' }}
                            onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                            title="Izmeni destinaciju"
                          >
                            ✏
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Obriši ovu destinaciju?')) {
                                dispatch(obrisiDestinaciju(destinacija.id));
                              }
                            }}
                            className="btn"
                            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', fontSize: '16px' }}
                            onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                            title="Obriši destinaciju"
                          >
                            ✖
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '30px' }}>
                <h2>📅 Raspored i aktivnosti</h2>
                <KalendarAktivnosti 
                  aktivnosti={sveAktivnosti} // Menjamo ovo!
                  onAktivnostSelektovana={handleAktivnostSelektovana}
                  onPrazanSlotSelektovan={handlePrazanSlotSelektovan}
                  onAktivnostObrisana={(aktivnostId) => dispatch(obrisiAktivnost({ aktivnostId, planId: podaci.id }))}
                />
              </div>

              {prikaziModalZaAktivnost && (
                <div style={{ marginTop: '20px' }}>
                  <DodajAktivnost 
                    isOpen={prikaziModalZaAktivnost}
                    onClose={() => {
                      setPrikaziModalZaAktivnost(false);
                      setAktivnostZaEdit(null); // Resetujemo kada zatvorimo
                    }}
                    planId={aktivniPlanId}
                    destinacijaId={aktivnaDestinacijaId || (podaci?.destinacije?.length > 0 ? podaci.destinacije[0].id : 0)}
                    aktivnostZaIzmenu={aktivnostZaEdit}
                  />
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <RouteMap activities={sveAktivnosti} />
              </div>

              {/* Sekcija za Troškove */}
              <div style={{ marginTop: '40px', marginBottom: '50px' }}>
                <h2 style={{ color: 'var(--venice-blue)' }}>💰 Troškovi</h2>
                <DodajTrosak planId={podaci.id} />
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  {kategorije.map(kat => (
                      <button
                          key={kat}
                          onClick={() => setSelektovanaKategorija(kat)}
                          style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: '1px solid var(--accent-primary)',
                              background: selektovanaKategorija === kat ? 'var(--accent-primary)' : 'transparent',
                              color: selektovanaKategorija === kat ? 'white' : 'var(--accent-primary)',
                              cursor: 'pointer',
                              fontSize: '13px',
                              transition: 'all 0.2s'
                          }}
                      >
                          {kat}
                      </button>
                  ))}
              </div>
                {prikazaniTroskovi && prikazaniTroskovi.length>0 ? (
                  <div>
                    {prikazaniTroskovi.map((trosak) => (
                      <div key={trosak.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                        {izmenaTroskaId === trosak.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input type="text" className="input-field" style={{ flex: 1 }} value={trosakKategorija} onChange={(e) => setTrosakKategorija(e.target.value)} placeholder="Kategorija" />
                              <input type="number" className="input-field" style={{ width: '100px' }} value={trosakIznos} onChange={(e) => setTrosakIznos(e.target.value)} placeholder="Iznos" />
                            </div>
                            <input type="text" className="input-field" value={trosakOpis} onChange={(e) => setTrosakOpis(e.target.value)} placeholder="Opis troška" />
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setIzmenaTroskaId(null)} className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '12px' }}>Otkaži</button>
                              <button onClick={() => handleSacuvajTrosak(trosak.id)} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '12px' }}>Sačuvaj</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span style={{ fontWeight: 500 }}>{trosak.kategorija}</span>
                              {trosak.opis && <span className="text-muted" style={{ fontSize: '13px', marginLeft: '8px' }}>({trosak.opis})</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <strong style={{ color: 'var(--danger)' }}>-{trosak.iznos} RSD</strong>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  onClick={() => pokreniIzmenuTroska(trosak)}
                                  className="btn"
                                  style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', fontSize: '15px' }}
                                  onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'}
                                  onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                                  title="Izmeni trošak"
                                >
                                  ✏
                                </button>
                                <button 
                                  onClick={() => {
                                    if(window.confirm('Obriši ovaj trošak?')) {
                                      dispatch(obrisiTrosak({ trosakId: trosak.id, planId: podaci.id, iznos: trosak.iznos }));
                                    }
                                  }}
                                  className="btn"
                                  style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', fontSize: '15px' }}
                                  onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                                  onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                                  title="Obriši trošak"
                                >
                                  ✖
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    </div>
                ) :(
                  <p className="text-muted" style={{ fontStyle: 'italic' }}>
                    {selektovanaKategorija === 'Svi troškovi' 
                      ? 'Nema evidentiranih troškova.' 
                      : `Nema troškova u kategoriji: ${selektovanaKategorija}`}
                  </p>
                )}
              </div>
              
              {/* Modal za generisanje linka */}
              {prikaziModalZaDeljenje && (
                <Sharing 
                  planId={aktivniPlanId} 
                  onClose={() => {
                    setPrikaziModalZaDeljenje(false);
                    dispatch(resetujGenerisaniToken());
                  }} 
                />
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;