import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajTrosak } from '../store/planSlice';

const DodajTrosak = ({ planId }) => {
  const dispatch = useDispatch();
  
  // Lokalna stanja (moraju biti unutar komponente!)
  const [kategorija, setKategorija] = useState('Smeštaj');
  const [opis, setOpis] = useState('');
  const [iznos, setIznos] = useState('');

  // Funkcija za slanje (mora biti deklarisana ovde, PRE return bloka!)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!opis || !iznos) {
        alert('Molimo popunite sva polja.');
        return;
    }

    const noviTrosak = {
      kategorija,
      opis,
      iznos: parseFloat(iznos),
      datum: new Date().toISOString(),
      planPutovanjaId: planId
    };

    dispatch(dodajTrosak(noviTrosak));
    
    setOpis('');
    setIznos('');
  };

  return (
    <div style={{ background: '#333', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Dodaj novi trošak</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select value={kategorija} onChange={(e) => setKategorija(e.target.value)}>
          <option value="Smeštaj">Smeštaj</option>
          <option value="Prevoz">Prevoz</option>
          <option value="Hrana">Hrana</option>
          <option value="Ostalo">Ostalo</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Kratak opis (npr. Apartman)..." 
          value={opis} 
          onChange={(e) => setOpis(e.target.value)} 
        />
        
        <input 
          type="number" 
          step="0.01" 
          placeholder="Iznos..." 
          value={iznos} 
          onChange={(e) => setIznos(e.target.value)} 
        />
        
        {/* Obrati pažnju: ovde se stavlja samo onSubmit na formi, a dugme je type="submit" */}
        <button type="submit" style={{ cursor: 'pointer', background: '#646cff' }}>
          Evidentiraj trošak
        </button>
      </form>
    </div>
  );
};

export default DodajTrosak;