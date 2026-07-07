import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { dodajAktivnost, izmeniAktivnost, obrisiAktivnost } from '../store/planSlice';

// 1. Dodali smo samoPregled = false
const FormaAktivnost = ({ isOpen, onClose, planId, destinacijaId, aktivnostZaIzmenu = null, samoPregled = false }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    naziv: '', opis: '', vremePocetka: '', vremeZavrsetka: '', lokacija: '', trosak: 0, status: 0
  });

  useEffect(() => {
    if (aktivnostZaIzmenu) {
      setFormData({
        ...aktivnostZaIzmenu,
        vremePocetka: aktivnostZaIzmenu.vremePocetka.slice(0, 16),
        vremeZavrsetka: aktivnostZaIzmenu.vremeZavrsetka.slice(0, 16)
      });
    } else {
      setFormData({
        naziv: '', opis: '', vremePocetka: '', vremeZavrsetka: '', lokacija: '', trosak: 0, status: 0
      });
    }
  }, [aktivnostZaIzmenu, isOpen]);

  if (!isOpen) return null;

  const handleObriši = () => {
    if (window.confirm(`Da li sigurno želiš da obrišeš aktivnost "${formData.naziv}"?`)) {
      dispatch(obrisiAktivnost({ aktivnostId: aktivnostZaIzmenu.id, planId: planId }));
      onClose(); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (samoPregled) return; // Dodatna zaštita da se ne okiuda submit u read-only modu

    const payload = {
      ...formData,
      destinacijaId: destinacijaId,
      planPutovanjaId: planId,
      trosak: parseFloat(formData.trosak) || 0,
      status: parseInt(formData.status, 10)
    };

    if (aktivnostZaIzmenu) {
      dispatch(izmeniAktivnost(payload));
    } else {
      dispatch(dodajAktivnost(payload));
    }
    onClose();
  };

  return (
    <div className="card" style={{ marginTop: '20px', textAlign: 'left' }}>
        {/* 2. Dinamičan naslov u zavisnosti od moda */}
        <h3>{samoPregled ? 'Detalji aktivnosti' : (aktivnostZaIzmenu ? 'Izmeni aktivnost' : 'Dodaj novu aktivnost')}</h3>
        
        <form onSubmit={handleSubmit}>
          {/* 3. Dodajemo disabled={samoPregled} na SVA polja */}
          <input type="text" className="input-field" placeholder="Naziv aktivnosti" required
            disabled={samoPregled}
            value={formData.naziv} onChange={(e) => setFormData({...formData, naziv: e.target.value})} />
            
          <input type="text" className="input-field" placeholder="Lokacija"
            disabled={samoPregled}
            value={formData.lokacija} onChange={(e) => setFormData({...formData, lokacija: e.target.value})} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="datetime-local" className="input-field" required
              disabled={samoPregled}
              value={formData.vremePocetka} onChange={(e) => setFormData({...formData, vremePocetka: e.target.value})} />
            <input type="datetime-local" className="input-field" required
              disabled={samoPregled}
              value={formData.vremeZavrsetka} onChange={(e) => setFormData({...formData, vremeZavrsetka: e.target.value})} />
          </div>

          <textarea className="input-field" placeholder="Opis" rows="3"
            disabled={samoPregled}
            value={formData.opis} onChange={(e) => setFormData({...formData, opis: e.target.value})} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" className="input-field" placeholder="Trošak (EUR/RSD)"
              disabled={samoPregled}
              value={formData.trosak} onChange={(e) => setFormData({...formData, trosak: parseFloat(e.target.value)})} />
            
            <select className="input-field" value={formData.status} disabled={samoPregled} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="0">Planirano</option>
              <option value="1">Rezervisano</option>
              <option value="2">Završeno</option>
              <option value="3">Otkazano</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            
            {/* Sakrivamo dugme za brisanje u read-only modu */}
            {!samoPregled && aktivnostZaIzmenu && (
              <button type="button" className="btn btn-outline" onClick={handleObriši}
                style={{ marginRight: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Obriši aktivnost
              </button>
            )}

            {/* Menjamo tekst dugmeta "Otkaži" u "Zatvori" u read-only modu */}
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {samoPregled ? 'Zatvori' : 'Otkaži'}
            </button>

            {/* Sakrivamo dugme za submit u read-only modu */}
            {!samoPregled && (
              <button type="submit" className="btn btn-primary">
                {aktivnostZaIzmenu ? 'Sačuvaj izmene' : 'Dodaj aktivnost'}
              </button>
            )}
          </div>
        </form>
    </div>
  );
};

export default FormaAktivnost;