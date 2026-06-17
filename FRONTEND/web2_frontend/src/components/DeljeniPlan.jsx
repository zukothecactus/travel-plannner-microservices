import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validirajDeljeniLink } from '../store/planSlice';
import DodajTrosak from './DodajTrosak';
import DodajDestinaciju from './DodajDestinaciju';
import Spisak from './Spisak';

const DeljeniPlan = ({ token }) => {
  const dispatch = useDispatch();
  
  const { deljeniPlan, nivoPristupaDeljenog, deljenjeUcitava, deljenjeGreska } = useSelector((state) => state.plan);

  useEffect(() => {
    if (token) {
      dispatch(validirajDeljeniLink(token));
    }
  }, [dispatch, token]);

  if (deljenjeUcitava) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>Učitavanje deljenog plana putovanja...</div>;
  }

  if (deljenjeGreska) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: '50px', maxWidth: '500px', margin: '50px auto' }}>
        <h2 style={{ color: 'var(--danger)' }}>Greška pri pristupu</h2>
        <p className="text-muted">{typeof deljenjeGreska === 'string' ? deljenjeGreska : 'Link je nevalidan ili je istekao.'}</p>
        <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '15px' }}>
          Idi na početnu
        </button>
      </div>
    );
  }

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