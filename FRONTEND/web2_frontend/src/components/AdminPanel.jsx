import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  
    const [korisnici, setKorisnici] = useState([]);
    const [ucitava, setUcitava] = useState(true);
    const [greska, setGreska] = useState('');

    const dobaviKorisnike = async() => {

        try {
            const response = await api.get('/Admin/korisnici');
            setKorisnici(response.data);
            setUcitava(false);
        } catch (error) {
            setGreska(error.response?.status === 403 
                ? 'Nemate pravo pristupa (403 Forbidden).'
                : 'Greška prilikom učitavanja korisnika.'
            );
            setUcitava(false);
        }
    };

    useEffect(() => {
        dobaviKorisnike();
    }, []);
    
    const obrisiKorisnika = async(id, ime) => {
        if(!window.confirm(`Da li ste sigurni da želite obrisati korisnika ${ime}?`)) {
            return;
        }
        try {
            await api.delete(`/Admin/korisnici/${id}`);
            setKorisnici(korisnici.filter(k => k.id !== id));
            alert(`Korisnik ${ime} je uspešno obrisan.`);
        } catch (error) {
            setGreska('Greška prilikom brisanja korisnika.');
        }
    };

    if (ucitava) return <p>Učitavanje korisnika...</p>;
    if (greska) return <div style={{ background: '#ff4d4d', padding: '10px', borderRadius: '5px' }}>{greska}</div>;

  return (
    <div style={{ background: '#242424', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2>🛠️ Administratorski Panel</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>Pregled i upravljanje svim nalozima u sistemu.</p>

      {korisnici.length === 0 ? (
        <p>Nema registrovanih korisnika u sistemu.</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #555' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Ime</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Uloga</th>
              <th style={{ padding: '10px' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.map(korisnik => (
              <tr key={korisnik.id} style={{ borderBottom: '1px solid #444' }}>
                <td style={{ padding: '10px' }}>{korisnik.id}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{korisnik.ime}</td>
                <td style={{ padding: '10px' }}>{korisnik.email}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    background: korisnik.uloga === 'ADMIN' ? '#ff9800' : '#4CAF50', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}>
                    {korisnik.uloga}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  {/* Skrivamo dugme za brisanje samog sebe kako admin ne bi slučajno obrisao svoj nalog */}
                  {korisnik.uloga !== 'ADMIN' && (
                    <button 
                      onClick={() => obrisiKorisnika(korisnik.id, korisnik.ime)}
                      style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Obriši
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;