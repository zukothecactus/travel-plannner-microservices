import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajDestinaciju } from '../store/planSlice';

const DodajDestinaciju = ({ planId }) => {
  const dispatch = useDispatch();
  
  const [nazivMesta, setNazivMesta] = useState('');
  const [napomena, setNapomena] = useState('');
  const [datumDolaska, setDatumDolaska] = useState('');
  const [datumOdlaska, setDatumOdlaska] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nazivMesta || !datumDolaska || !datumOdlaska) {
        alert('Molimo unesite naziv mesta i oba datuma.');
        return;
    }

    const novaDestinacija = {
      nazivMesta,
      napomena,
      // Pretvaramo datume u ISO format koji C# backend očekuje
      datumDolaska: new Date(datumDolaska).toISOString(),
      datumOdlaska: new Date(datumOdlaska).toISOString(),
      planPutovanjaId: planId
    };

    dispatch(dodajDestinaciju(novaDestinacija));
    
    // Resetovanje forme
    setNazivMesta('');
    setNapomena('');
    setDatumDolaska('');
    setDatumOdlaska('');
  };

  return (
    <div style={{ background: '#2c3e50', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>🗺️ Dodaj novu destinaciju</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Naziv mesta (npr. Tasos, Rim)..." 
          value={nazivMesta} 
          onChange={(e) => setNazivMesta(e.target.value)} 
        />
        
        <input 
          type="text" 
          placeholder="Napomena (opciono)..." 
          value={napomena} 
          onChange={(e) => setNapomena(e.target.value)} 
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Datum dolaska:</label>
            <input 
              type="date" 
              value={datumDolaska} 
              onChange={(e) => setDatumDolaska(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Datum odlaska:</label>
            <input 
              type="date" 
              value={datumOdlaska} 
              onChange={(e) => setDatumOdlaska(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <button type="submit" style={{ cursor: 'pointer', background: '#2980b9', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>
          Sačuvaj destinaciju
        </button>
      </form>
    </div>
  );
};

export default DodajDestinaciju;