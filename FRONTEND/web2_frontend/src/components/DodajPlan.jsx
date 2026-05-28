import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { kreirajPlan } from '../store/planSlice';

const DodajPlan = () => {
  const dispatch = useDispatch();
  
  // Stanje za prikazivanje/skrivanje forme
  const [prikaziFormu, setPrikaziFormu] = useState(false);
  
  // Stanja za polja u formi
  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [planiraniBudzet, setPlaniraniBudzet] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!naziv || !planiraniBudzet) {
        alert('Molimo unesite naziv i planirani budžet.');
        return;
    }

    const noviPlan = {
      naziv,
      opis,
      planiraniBudzet: parseFloat(planiraniBudzet)
    };

    dispatch(kreirajPlan(noviPlan));
    
    // Resetujemo formu i zatvaramo je
    setNaziv('');
    setOpis('');
    setPlaniraniBudzet('');
    setPrikaziFormu(false);
  };

  // Ako forma nije aktivna, prikazujemo samo dugme
  if (!prikaziFormu) {
    return (
      <button 
        onClick={() => setPrikaziFormu(true)}
        style={{ marginBottom: '20px', background: '#4CAF50', color: 'white', fontWeight: 'bold' }}
      >
        + Kreiraj novi plan putovanja
      </button>
    );
  }

  // Ako jeste aktivna, prikazujemo formu
  return (
    <div style={{ background: '#242424', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4CAF50' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Novi plan putovanja</h3>
        <button onClick={() => setPrikaziFormu(false)} style={{ background: 'transparent', color: '#ff4d4d', border: 'none' }}>
          ✖ Zatvori
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
        <input 
          type="text" 
          placeholder="Naziv putovanja (npr. Vikend u Beču)..." 
          value={naziv} 
          onChange={(e) => setNaziv(e.target.value)} 
        />
        
        <textarea 
          placeholder="Kratak opis..." 
          value={opis} 
          onChange={(e) => setOpis(e.target.value)} 
          rows="3"
        />
        
        <input 
          type="number" 
          step="0.01" 
          placeholder="Planirani budžet (ukupno)..." 
          value={planiraniBudzet} 
          onChange={(e) => setPlaniraniBudzet(e.target.value)} 
        />
        
        <button type="submit" style={{ cursor: 'pointer', background: '#4CAF50', color: 'white' }}>
          Sačuvaj u bazu
        </button>
      </form>
    </div>
  );
};

export default DodajPlan;