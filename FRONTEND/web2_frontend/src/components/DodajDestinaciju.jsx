import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dodajDestinaciju } from '../store/planSlice';
import { toast } from 'react-toastify';

const DodajDestinaciju = ({ planId }) => {
  const dispatch = useDispatch();
  
  const [nazivMesta, setNazivMesta] = useState('');
  const [napomena, setNapomena] = useState('');
  const [datumDolaska, setDatumDolaska] = useState('');
  const [datumOdlaska, setDatumOdlaska] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nazivMesta || !datumDolaska || !datumOdlaska) {
        toast.warning('Molimo unesite naziv mesta i oba datuma.');
        return;
    }

    const novaDestinacija = {
      nazivMesta,
      napomena,
      datumDolaska: new Date(datumDolaska).toISOString(),
      datumOdlaska: new Date(datumOdlaska).toISOString(),
      planPutovanjaId: planId
    };

    dispatch(dodajDestinaciju(novaDestinacija))
    .unwrap()
    .then(() => {
        toast.success('Destinacija uspešno dodata');
        setNazivMesta('');
        setNapomena('');
        setDatumDolaska('');
        setDatumOdlaska('');
    }).catch((err) => {
        toast.error('Došlo je do greške: ' + err.message);
    });
  };

  return (
    <div className="card" style={{ borderTop: '4px solid var(--danube-blue)', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--mystic-blue)' }}>Dodaj novu destinaciju</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Naziv mesta</label>
          <input 
            type="text" 
            className="input-field"
            placeholder="npr. Tasos, Rim..." 
            value={nazivMesta} 
            onChange={(e) => setNazivMesta(e.target.value)} 
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Napomena (opciono)</label>
          <input 
            type="text" 
            className="input-field"
            placeholder="npr. Smeštaj blizu centra..." 
            value={napomena} 
            onChange={(e) => setNapomena(e.target.value)} 
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Datum dolaska</label>
            <input 
              type="date" 
              className="input-field"
              value={datumDolaska} 
              onChange={(e) => setDatumDolaska(e.target.value)} 
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Datum odlaska</label>
            <input 
              type="date" 
              className="input-field"
              value={datumOdlaska} 
              onChange={(e) => setDatumOdlaska(e.target.value)} 
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            + Dodaj destinaciju
          </button>
        </div>
      </form>
    </div>
  );
};

export default DodajDestinaciju;