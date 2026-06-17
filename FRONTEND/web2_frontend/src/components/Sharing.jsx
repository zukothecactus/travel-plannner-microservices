import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generisiLinkZaDeljenje } from '../store/planSlice';
import { QRCodeSVG } from 'qrcode.react';

const Sharing = ({ planId, onClose }) => {
  const dispatch = useDispatch();
  
  const { generisaniToken, greska } = useSelector((state) => state.plan);
  const [izabraniNivo, setIzabraniNivo] = useState(null);

  const handleGenerisi = (nivo) => {
    setIzabraniNivo(nivo);
    dispatch(generisiLinkZaDeljenje({ planId, nivoPristupa: nivo, trajanjeUMinutima: 1440 }));
  };

  const urlZaDeljenje = generisaniToken 
    ? `${window.location.origin}/deli/${generisaniToken}` 
    : '';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(9, 29, 54, 0.6)', /* Mystic Blue sa prozirnošću */
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      zIndex: 1000, padding: '20px', boxSizing: 'border-box'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', margin: 0, textAlign: 'center' }}>
        
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
          onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          ✖
        </button>

        <h2 style={{ color: 'var(--mystic-blue)', marginBottom: '10px' }}>🔗 Podeli plan putovanja</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Izaberi ko može da vidi i menja ovaj plan.</p>

        {!generisaniToken ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => handleGenerisi('VIEW')}
              className="btn btn-outline"
              style={{ padding: '14px', fontSize: '15px', justifyContent: 'flex-start', color: 'var(--success)', borderColor: 'var(--success)' }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(16, 185, 129, 0.1)' }}
              onMouseOut={(e) => { e.target.style.background = 'transparent' }}
            >
              👁️ VIEW (Samo pregled)
            </button>
            <button 
              onClick={() => handleGenerisi('EDIT')}
              className="btn btn-outline"
              style={{ padding: '14px', fontSize: '15px', justifyContent: 'flex-start', color: 'var(--warning)', borderColor: 'var(--warning)' }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(245, 158, 11, 0.1)' }}
              onMouseOut={(e) => { e.target.style.background = 'transparent' }}
            >
              ✏️ EDIT (Može da menja)
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '20px' }}>
              Link za {izabraniNivo} pristup je generisan!
            </p>
            
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
              <QRCodeSVG value={urlZaDeljenje} size={180} fgColor="var(--mystic-blue)" />
            </div>
            
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '20px' }}>
              Skeniraj kod kamerom telefona ili kopiraj link ispod.
            </p>

            <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
              <input 
                type="text" 
                readOnly 
                value={urlZaDeljenje} 
                className="input-field" 
                style={{ marginBottom: 0, fontSize: '12px', flex: 1 }} 
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(urlZaDeljenje);
                  alert('Link je kopiran!');
                }} 
                className="btn btn-primary"
              >
                Kopiraj
              </button>
            </div>
          </div>
        )}

        {greska && <div style={{ padding: '10px', background: '#fee2e2', color: 'var(--danger)', borderRadius: '6px', marginTop: '15px' }}>{greska}</div>}
      </div>
    </div>
  );
};

export default Sharing;