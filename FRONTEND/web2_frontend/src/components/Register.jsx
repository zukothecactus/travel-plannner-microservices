import {useState} from 'react';
import api from '../services/api';

const Register = ({onPrebaciNaLogin}) =>
{
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [status, setStatus] = useState({ tip: '', poruka: '' });

  const handleSubmit = async(e) =>
  {
      e.preventDefault();
      setStatus({tip: 'info', poruka: 'Registracija u toku...'});
      try{
          await api.post('/Auth/registracija', 
              {
                  Ime: ime,
                  Email: email,
                  Lozinka: lozinka
              }
          );
          setStatus({tip: 'success', poruka: 'Registracija uspešna!'});
          //posle 2 sekunde prebacujemo korisnika na login 
          setTimeout(() => {OnPrebaciNaLogin();}, 2000);

      } catch (error) {
          setStatus({
              tip: 'error', 
              poruka: 'Greška prilikom registracije.'
          });
      }
  };

return (
    <div style={{ background: '#242424', padding: '30px', borderRadius: '8px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Registracija</h2>
      
      {status.poruka && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '4px',
          background: status.tip === 'greska' ? '#ff4d4d' : status.tip === 'uspeh' ? '#4CAF50' : '#333'
        }}>
          {status.poruka}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Tvoje ime" 
          value={ime} 
          onChange={(e) => setIme(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="email" 
          placeholder="Email adresa" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Lozinka (min. 6 karaktera)" 
          value={lozinka} 
          onChange={(e) => setLozinka(e.target.value)} 
          required 
          minLength={6}
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ background: '#646cff', color: 'white', padding: '10px' }}>
          Registruj se
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Već imaš nalog?{' '}
        <span onClick={onPrebaciNaLogin} style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}>
          Prijavi se ovde
        </span>
      </p>
    </div>
  );
};

export default Register;