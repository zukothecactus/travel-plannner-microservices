import { useState } from 'react';
import api from '../services/api';

const Register = ({ onPrebaciNaLogin }) => {
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [status, setStatus] = useState({ tip: '', poruka: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ tip: 'info', poruka: 'Registracija u toku...' });
    
    try {
      await api.post('/Auth/registracija', {
        Ime: ime,
        Email: email,
        Lozinka: lozinka
      });
      
      setStatus({ tip: 'uspeh', poruka: 'Registracija uspešna!' });
      // Posle 2 sekunde prebacujemo korisnika na login 
      setTimeout(() => { onPrebaciNaLogin(); }, 2000);

    } catch (error) {
      setStatus({
        tip: 'greska', 
        poruka: 'Greška prilikom registracije.'
      });
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--mystic-blue)', marginBottom: '24px' }}>Registracija</h2>
        
        {status.poruka && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            borderRadius: '8px', 
            fontSize: '14px',
            textAlign: 'center',
            background: status.tip === 'greska' ? '#fee2e2' : status.tip === 'uspeh' ? '#d1fae5' : 'var(--bg-main)',
            color: status.tip === 'greska' ? 'var(--danger)' : status.tip === 'uspeh' ? 'var(--success)' : 'var(--text-main)',
            border: `1px solid ${status.tip === 'greska' ? '#fca5a5' : status.tip === 'uspeh' ? '#6ee7b7' : 'var(--border-color)'}`
          }}>
            {status.poruka}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Tvoje ime</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="npr. Petar Petrović" 
              value={ime} 
              onChange={(e) => setIme(e.target.value)} 
              required 
              style={{ marginBottom: 0 }}
            />
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Email adresa</label>
            <input 
              type="email" 
              className="input-field"
              placeholder="unesite email..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ marginBottom: 0 }}
            />
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Lozinka (min. 6 karaktera)</label>
            <input 
              type="password" 
              className="input-field"
              placeholder="unesite lozinku..." 
              value={lozinka} 
              onChange={(e) => setLozinka(e.target.value)} 
              required 
              minLength={6}
              style={{ marginBottom: 0 }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px', width: '100%', fontSize: '16px' }}>
            Registruj se
          </button>
        </form>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>Već imaš nalog?</p>
          <button 
            onClick={onPrebaciNaLogin} 
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            Prijavi se
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;