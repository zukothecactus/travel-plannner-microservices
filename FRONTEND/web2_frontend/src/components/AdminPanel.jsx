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

    const promeniUlogu = async (korisnik) => {
        const novaUloga = korisnik.uloga === 'ADMIN' ? 'KORISNIK' : 'ADMIN';
        
        if(!window.confirm(`Da li sigurno želiš da postaviš ${korisnik.ime} u ulogu: ${novaUloga}?`)) {
            return;
        }

        try {
            // Obavezno šaljemo string kao JSON body
            await api.put(`/Admin/korisnici/${korisnik.id}/uloga`, JSON.stringify(novaUloga), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Lokalno osvežavanje state-a da korisnik odmah vidi promenu
            setKorisnici(korisnici.map(k => k.id === korisnik.id ? { ...k, uloga: novaUloga } : k));
            alert('Uloga uspešno promenjena.');
        } catch (error) {
            alert('Greška pri promeni uloge.');
        }
    };

    if (ucitava) return <p className="text-muted" style={{ textAlign: 'center', marginTop: '30px' }}>Učitavanje korisnika...</p>;
    if (greska) return <div style={{ padding: '15px', background: '#fee2e2', color: 'var(--danger)', borderRadius: '8px', textAlign: 'center', marginTop: '20px' }}>{greska}</div>;

    return (
        <div className="card" style={{ marginTop: '30px', borderTop: '4px solid var(--mystic-blue)' }}>
            <h2 style={{ color: 'var(--mystic-blue)', marginBottom: '20px' }}>👥 Upravljanje korisnicima</h2>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>ID</th>
                            <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Ime</th>
                            <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Email</th>
                            <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Uloga</th>
                            <th style={{ padding: '12px 10px', color: 'var(--text-muted)', textAlign: 'right' }}>Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {korisnici.map(korisnik => (
                            <tr key={korisnik.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{korisnik.id}</td>
                                <td style={{ padding: '12px 10px', fontWeight: '500', color: 'var(--mystic-blue)' }}>{korisnik.ime}</td>
                                <td style={{ padding: '12px 10px' }}>{korisnik.email}</td>
                                <td style={{ padding: '12px 10px' }}>
                                    <span className={`badge ${korisnik.uloga === 'ADMIN' ? 'badge-edit' : 'badge-view'}`}>
                                        {korisnik.uloga}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => promeniUlogu(korisnik)}
                                        className="btn btn-outline"
                                        style={{ 
                                            padding: '6px 12px', 
                                            fontSize: '13px', 
                                            marginRight: '8px',
                                            borderColor: 'var(--mystic-blue)',
                                            color: 'var(--mystic-blue)' 
                                        }}
                                    >
                                        {korisnik.uloga === 'ADMIN' ? 'Postavi kao KORISNIK' : 'Postavi kao ADMIN'}
                                    </button>
                                    {korisnik.uloga !== 'ADMIN' && (
                                        <button 
                                            onClick={() => obrisiKorisnika(korisnik.id, korisnik.ime)}
                                            className="btn btn-outline"
                                            style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                            onMouseOver={(e) => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                                            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--danger)'; }}
                                        >
                                            Obriši
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;