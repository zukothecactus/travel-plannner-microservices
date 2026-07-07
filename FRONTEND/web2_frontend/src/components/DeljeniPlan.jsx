import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validirajDeljeniLink } from '../store/planSlice';
import DodajTrosak from './DodajTrosak';
import DodajDestinaciju from './DodajDestinaciju';
import Spisak from './Spisak';
import KalendarAktivnosti from './KalendarAktivnosti';
import DodajAktivnost from './DodajAktivnost';
import Login from './Login';

const DeljeniPlan = ({ token }) => {
  const dispatch = useDispatch();
  
  const { deljeniPlan, nivoPristupaDeljenog, deljenjeUcitava, deljenjeGreska } = useSelector((state) => state.plan);

  const ulogovaniToken = useSelector((state) => state.auth.token);

  // Lokalna stanja za modal detalja
  const [prikaziDetalje, setPrikaziDetalje] = useState(false);
  const [aktivnostZaDetalje, setAktivnostZaDetalje] = useState(null)

  useEffect(() => {
    if (token) {
      dispatch(validirajDeljeniLink(token));
    }
  }, [dispatch, token, ulogovaniToken]);

  if (deljenjeUcitava) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>Učitavanje deljenog plana putovanja...</div>;
  }

  if (deljenjeGreska) {
    // Bezbedna provera koja pokriva i stringove i objekte koje axios/redux vrati
    const greskaString = typeof deljenjeGreska === 'object' ? JSON.stringify(deljenjeGreska) : String(deljenjeGreska);
    
    const zahtevaLogin = 
      greskaString.includes('401') || 
      greskaString.toLowerCase().includes('ulogovati') || 
      greskaString.toLowerCase().includes('unauthorized');

    if (zahtevaLogin) {
      return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '420px', 
            padding: '15px', 
            marginBottom: '10px', 
            borderRadius: '8px', 
            background: '#fee2e2', 
            color: 'var(--danger)', 
            border: '1px solid #fca5a5', 
            fontSize: '14px', 
            textAlign: 'center',
            fontWeight: '600'
          }}>
            🔐 Ovaj plan je podeljen u EDIT modu. Morate se ulogovati da biste mu pristupili ili vršili izmene.
          </div>
          <Login onPrebaciNaRegistraciju={() => window.location.href = '/register'} />
        </div>
      );
    }

    // Za sve ostale greške (npr. 404 Not Found ako link ne postoji)
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: '50px', padding: '30px', color: 'var(--danger)' }}>
        <h4>Upozorenje</h4>
        <p>{typeof deljenjeGreska === 'object' ? deljenjeGreska.poruka || 'Link nije validan.' : deljenjeGreska}</p>
      </div>
    );
  }

  // Prikupljamo sve aktivnosti iz svih destinacija deljenog plana
  const sveAktivnosti = deljeniPlan?.destinacije?.flatMap(d => d.aktivnosti || []) || [];

  const handleSamoPregled = () => {
    alert("Nije moguće menjati aktivnosti iz pregleda deljenog plana.");
  };

  const handlePregledAktivnosti = (event) => {
    setAktivnostZaDetalje({
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
    setPrikaziDetalje(true);
  };

    // Za klik na prazan slot ostavljamo blokadu, jer tu gosti ne treba da dodaju ništa
  const handlePrazanSlot = () => {
    // Ne radi ništa ili stavi alert("Režim pregleda.")
  };

  const handlePrazanSlotZaDodavanje = (slotInfo) => {
    // Postavljamo aktivnostZaDetalje na null jer je nova aktivnost
    setAktivnostZaDetalje(null);
    setPrikaziDetalje(true);
  };

  if (!deljeniPlan) return null;

  const jeEditMod = nivoPristupaDeljenog === 'EDIT';

  return (
    <div className="app-container">
      <button onClick={() => window.location.href = '/'} className="btn btn-outline" style={{ marginBottom: '20px' }}>
        ⬅ Nazad na početnu
      </button>

      <div className="card">
        <div className="flex-between">
          <h1 style={{ margin: 0 }}>{deljeniPlan.naziv}</h1>
          <span className={`badge ${jeEditMod ? 'badge-edit' : 'badge-view'}`}>
            Pristup: {nivoPristupaDeljenog}
          </span>
        </div>
        <p className="text-muted" style={{ fontSize: '16px', marginTop: '10px' }}>{deljeniPlan.opis}</p>
        <h3 style={{ marginTop: '20px', color: 'var(--success)' }}>Budžet: {deljeniPlan.planiraniBudzet} RSD</h3>
      </div>

      <Spisak planId={deljeniPlan.id} stavke={deljeniPlan.spisak} samoPregled={!jeEditMod} />

      <div style={{ marginTop: '30px' }}>
        <h2>📍 Destinacije</h2>
        {jeEditMod && <DodajDestinaciju planId={deljeniPlan.id} />}
        
        {deljeniPlan.destinacije && deljeniPlan.destinacije.length > 0 ? (
          <div style={{ marginTop: '15px' }}>
            {deljeniPlan.destinacije.map((dest) => (
              <div key={dest.id} className="card-item">
                <h4 style={{ margin: '0 0 4px 0' }}>{dest.nazivMesta}</h4>
                <p className="text-muted" style={{ margin: 0 }}>
                  {new Date(dest.datumDolaska).toLocaleDateString('sr-RS')} - {new Date(dest.datumOdlaska).toLocaleDateString('sr-RS')}
                </p>
                {dest.napomena && <p className="text-muted" style={{ fontStyle: 'italic', marginTop: '8px', marginBottom: 0 }}>Napomena: {dest.napomena}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ fontStyle: 'italic' }}>Nema dodatih destinacija.</p>
        )}
      </div>
      
      {/* Sekcija za kalendar aktivnosti */}
   <div style={{ marginTop: '40px', marginBottom: '30px' }}>
     <h2>📅 Raspored putovanja</h2>
     {sveAktivnosti.length > 0 ? (
       <KalendarAktivnosti 
         aktivnosti={sveAktivnosti}
         onAktivnostSelektovana={handlePregledAktivnosti} // OVO JE IZMENJENO
         onPrazanSlotSelektovan={jeEditMod ? handlePrazanSlotZaDodavanje : handleSamoPregled}        // OVO JE IZMENJENO
       />
     ) : (
       <p className="text-muted" style={{ fontStyle: 'italic' }}>
         Nema planiranih aktivnosti za ovo putovanje.
       </p>
     )}
   </div>

   {/* Naš postojeći modal, sada u READ-ONLY modu */}
   {prikaziDetalje && (
     <DodajAktivnost 
       isOpen={prikaziDetalje}
       onClose={() => {
         setPrikaziDetalje(false);
         setAktivnostZaDetalje(null);
       }}
       planId={deljeniPlan.id}
       destinacijaId={aktivnostZaDetalje?.destinacijaId}
       aktivnostZaIzmenu={aktivnostZaDetalje}
       samoPregled={!jeEditMod} // OVO KLJUČNO ZAKLJUČAVA FORMU
     />
   )}

      <div style={{ marginTop: '40px', marginBottom: '50px' }}>
        <h2>💰 Troškovi</h2>
        {jeEditMod && <DodajTrosak planId={deljeniPlan.id} />}

        {deljeniPlan.troskovi && deljeniPlan.troskovi.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
            {deljeniPlan.troskovi.map((trosak) => (
              <li key={trosak.id} className="card-item flex-between" style={{ padding: '12px 16px' }}>
                <div>
                  <strong>{trosak.kategorija}</strong> - <span className="text-muted">{trosak.opis}</span>
                </div>
                <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{trosak.iznos} RSD</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted" style={{ fontStyle: 'italic' }}>Nema evidentiranih troškova.</p>
        )}
      </div>
    </div>
  );
};

export default DeljeniPlan;