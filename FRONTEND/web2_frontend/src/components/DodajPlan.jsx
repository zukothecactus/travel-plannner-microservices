import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { kreirajPlan } from '../store/planSlice';
import { toast } from 'react-toastify';

const DodajPlan = () => {
  const dispatch = useDispatch();
  const [prikaziFormu, setPrikaziFormu] = useState(false);
  
  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [planiraniBudzet, setPlaniraniBudzet] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!naziv || !planiraniBudzet) {
        toast.warning('Molimo unesite naziv i planirani budžet.');
        return;
    }

    const noviPlan = {
      naziv,
      opis,
      planiraniBudzet: parseFloat(planiraniBudzet)
    };

    dispatch(kreirajPlan(noviPlan))
    .unwrap()
    .then(() => {
        toast.success('Plan putovanja uspešno kreiran');
        setNaziv('');
        setOpis('');
        setPlaniraniBudzet('');
        setPrikaziFormu(false);
    }).catch((err) => { 
        toast.error('Došlo je do greške: ' + err.message);
    });
  };

  // Prikaz samo dugmeta ako forma nije aktivna
  if (!prikaziFormu) {
    return (
      <button 
        onClick={() => setPrikaziFormu(true)}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
      >
        + Dodaj novi plan putovanja
      </button>
    );
  }

  // Prikaz forme
  return (
    <div className="card" style={{ borderTop: '4px solid var(--accent-primary)', marginBottom: '30px' }}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Novi plan putovanja</h3>
        <button 
          onClick={() => setPrikaziFormu(false)} 
          className="btn btn-outline"
          style={{ border: 'none', padding: '6px 12px' }}
        >
          ✖ Odustani
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Naziv putovanja</label>
          <input 
            type="text" 
            className="input-field"
            placeholder="npr. Vikend u Beču..." 
            value={naziv} 
            onChange={(e) => setNaziv(e.target.value)} 
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Kratak opis (opciono)</label>
          <textarea 
            className="input-field"
            placeholder="Plan za istraživanje grada..." 
            value={opis} 
            onChange={(e) => setOpis(e.target.value)} 
            rows="3"
            style={{ marginBottom: 0, resize: 'vertical' }}
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Planirani budžet (EUR)</label>
          <input 
            type="number" 
            step="0.01" 
            className="input-field"
            placeholder="0.00" 
            value={planiraniBudzet} 
            onChange={(e) => setPlaniraniBudzet(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Sačuvaj plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default DodajPlan;