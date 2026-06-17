import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajTrosak } from '../store/planSlice';
import { toast } from 'react-toastify';

const DodajTrosak = ({ planId }) => {
  const dispatch = useDispatch();
  
  const [kategorija, setKategorija] = useState('Smeštaj');
  const [opis, setOpis] = useState('');
  const [iznos, setIznos] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!opis || !iznos) {
        toast.warning('Molimo popunite sva polja.');
        return;
    }

    const noviTrosak = {
      kategorija,
      opis,
      iznos: parseFloat(iznos),
      datum: new Date().toISOString(),
      planPutovanjaId: planId
    };

    dispatch(dodajTrosak(noviTrosak))
    .unwrap()
    .then(() => {
        toast.success('Trošak uspešno dodat');
        setOpis('');
        setIznos('');
    }).catch((err) => {
        toast.error('Došlo je do greške prilikom dodavanja troška: ' + err.message);
    });
  };

  return (
    <div className="card" style={{ borderTop: '4px solid var(--warning)', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--mystic-blue)' }}>💳 Dodaj novi trošak</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Kategorija</label>
            <select 
              className="input-field" 
              value={kategorija} 
              onChange={(e) => setKategorija(e.target.value)}
              style={{ marginBottom: 0, cursor: 'pointer' }}
            >
              <option value="Smeštaj">Smeštaj</option>
              <option value="Prevoz">Prevoz</option>
              <option value="Hrana">Hrana</option>
              <option value="Ostalo">Ostalo</option>
            </select>
          </div>
          
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Kratak opis</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="npr. Apartman, Gorivo, Ručak..." 
              value={opis} 
              onChange={(e) => setOpis(e.target.value)} 
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Iznos (EUR)</label>
          <input 
            type="number" 
            step="0.01" 
            className="input-field"
            placeholder="0.00" 
            value={iznos} 
            onChange={(e) => setIznos(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            + Dodaj trošak
          </button>
        </div>
      </form>
    </div>
  );
};

export default DodajTrosak;