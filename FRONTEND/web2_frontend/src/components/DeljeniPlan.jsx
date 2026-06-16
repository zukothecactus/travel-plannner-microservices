import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validirajDeljeniLink } from '../store/planSlice';
import DodajTrosak from './DodajTrosak';
import DodajDestinaciju from './DodajDestinaciju';
import Spisak from './Spisak';

const DeljeniPlan = ({ token }) => {
  const dispatch = useDispatch();
  
  // Povlačimo podatke o deljenom planu iz Redux stanja
  const { deljeniPlan, nivoPristupaDeljenog, deljenjeUcitava, deljenjeGreska } = useSelector((state) => state.plan);

  useEffect(() => {
    if (token) {
      dispatch(validirajDeljeniLink(token));
    }
  }, [dispatch, token]);

  if (deljenjeUcitava) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Učitavanje deljenog plana putovanja...</div>;
  }

  if (deljenjeGreska) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#ff4d4d' }}>
        <h2>Greška pri pristupu</h2>
        <p>{typeof deljenjeGreska === 'string' ? deljenjeGreska : 'Link je nevalidan ili je istekao.'}</p>
        <button onClick={() => window.location.href = '/'} style={{ background: '#646cff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' }}>
          Idi na početnu
        </button>
      </div>
    );
  }

  if (!deljeniPlan) return null;

  const jeEditMod = nivoPristupaDeljenog === 'EDIT';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'left' }}>
      <button onClick={() => window.location.href = '/'} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}>
        ⬅️ Nazad na početnu
      </button>

      <div style={{ background: '#242424', padding: '30px', borderRadius: '12px', border: '1px solid #646cff', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{deljeniPlan.naziv}</h1>
          <span style={{ background: jeEditMod ? '#ff9800' : '#4CAF50', color: 'white', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
            Nivo pristupa: {nivoPristupaDeljenog}
          </span>
        </div>
        <p style={{ color: '#aaa', fontSize: '16px', marginTop: '10px' }}>{deljeniPlan.opis}</p>
        <h3 style={{ marginTop: '20px', color: '#4CAF50' }}>Planirani budžet: {deljeniPlan.planiraniBudzet} EUR</h3>
      </div>

      {/* To-Do Spisak - prikazujemo ga svima, ali unutrašnja logika može zavisiti od prava izmena */}
      <Spisak planId={deljeniPlan.id} stavke={deljeniPlan.spisak} />

      {/* Sekcija za Destinacije */}
      <div style={{ marginTop: '30px' }}>
        <h2>📍 Destinacije</h2>
        {jeEditMod && <DodajDestinaciju planId={deljeniPlan.id} />}
        
        {deljeniPlan.destinacije && deljeniPlan.destinacije.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {deljeniPlan.destinacije.map((dest) => (
              <div key={dest.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #444' }}>
                <h4>{dest.nazivMesta}</h4>
                <p style={{ fontSize: '14px', color: '#888' }}>
                  {new Date(dest.datumDolaska).toLocaleDateString()} - {new Date(dest.datumOdlaska).toLocaleDateString()}
                </p>
                {dest.napomena && <p style={{ fontStyle: 'italic', fontSize: '14px', marginTop: '5px' }}>Napomena: {dest.napomena}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>Nema dodatih destinacija.</p>
        )}
      </div>

      {/* Sekcija za Troškove */}
      <div style={{ marginTop: '40px', marginBottom: '50px' }}>
        <h2>💰 Troškovi</h2>
        {jeEditMod && <DodajTrosak planId={deljeniPlan.id} />}

        {deljeniPlan.troskovi && deljeniPlan.troskovi.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
            {deljeniPlan.troskovi.map((trosak) => (
              <li key={trosak.id} style={{ background: '#333', padding: '12px', marginBottom: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{trosak.kategorija}</strong> - {trosak.opis}
                </div>
                <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>{trosak.iznos} EUR</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>Nema evidentiranih troškova.</p>
        )}
      </div>
    </div>
  );
};

export default DeljeniPlan;