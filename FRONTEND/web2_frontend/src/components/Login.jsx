import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';

const Login = ({ onPrebaciNaRegistraciju }) => {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  
  const dispatch = useDispatch();
  const { ucitava, greska } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ Email: email, Lozinka: lozinka }));
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--mystic-blue)', marginBottom: '24px' }}>Prijava</h2>
        
        {greska && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: '#fee2e2', color: 'var(--danger)', border: '1px solid #fca5a5', fontSize: '14px', textAlign: 'center' }}>
            {greska}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <label className="text-muted" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Lozinka</label>
            <input 
              type="password" 
              className="input-field"
              placeholder="unesite lozinku..." 
              value={lozinka} 
              onChange={(e) => setLozinka(e.target.value)} 
              required 
              style={{ marginBottom: 0 }}
            />
          </div>
          
          <button type="submit" disabled={ucitava} className="btn btn-primary" style={{ marginTop: '10px', padding: '12px', width: '100%', fontSize: '16px' }}>
            {ucitava ? 'Prijavljivanje...' : 'Uđi'}
          </button>
        </form>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>Nemaš nalog?</p>
          <button 
            onClick={onPrebaciNaRegistraciju} 
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            Kreiraj nalog
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;