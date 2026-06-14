import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';

const Login = ({ onPrebaciNaRegistraciju }) => {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  
  const dispatch = useDispatch();
  // Izvlačimo status iz Redux-a
  const { ucitava, greska } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pozivamo asinhronu thunk akciju
    dispatch(loginUser({ Email: email, Lozinka: lozinka }));
  };

  return (
    <div style={{ background: '#242424', padding: '30px', borderRadius: '8px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Prijava</h2>
      
      {greska && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: '#ff4d4d' }}>
          {greska}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
          placeholder="Lozinka" 
          value={lozinka} 
          onChange={(e) => setLozinka(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <button type="submit" disabled={ucitava} style={{ background: '#4CAF50', color: 'white', padding: '10px' }}>
          {ucitava ? 'Prijavljivanje...' : 'Uđi'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Nemaš nalog?{' '}
        <span onClick={onPrebaciNaRegistraciju} style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}>
          Registruj se ovde
        </span>
      </p>
    </div>
  );
};

export default Login;