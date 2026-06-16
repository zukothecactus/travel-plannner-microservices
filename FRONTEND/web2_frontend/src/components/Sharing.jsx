import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generisiLinkZaDeljenje } from '../store/planSlice';
import { QRCodeSVG } from 'qrcode.react';

const ModalZaDeljenje = ({ planId, onClose }) => {
  const dispatch = useDispatch();
  
  // Povlačimo token i potencijalne greške iz Redux stanja
  const { generisaniToken, greska } = useSelector((state) => state.plan);
  const [izabraniNivo, setIzabraniNivo] = useState(null);

  const handleGenerisi = (nivo) => {
    setIzabraniNivo(nivo);
    // Trajanje postavljamo na 24h (1440 minuta) po defaultu
    dispatch(generisiLinkZaDeljenje({ planId, nivoPristupa: nivo, trajanjeUMinutima: 1440 }));
  };

  // URL koji će biti zapisan u QR kod. 
  // Ovo je putanja ka tvojoj React aplikaciji koju ćemo tek napraviti.
  const urlZaDeljenje = generisaniToken 
    ? `${window.location.origin}/deli/${generisaniToken}` 
    : '';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#242424', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', border: '1px solid #646cff' }}>
        <h2>Podeli plan putovanja</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>Izaberi nivo pristupa za osobu kojoj šalješ link.</p>
        
        {!generisaniToken ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => handleGenerisi('VIEW')}
              style={{ background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              👁️ VIEW (Samo pregled)
            </button>
            <button 
              onClick={() => handleGenerisi('EDIT')}
              style={{ background: '#ff9800', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ✏️ EDIT (Može da menja)
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>Link za {izabraniNivo} pristup je generisan!</p>
            <div style={{ background: 'white', padding: '15px', borderRadius: '8px', display: 'inline-block', marginTop: '10px' }}>
              <QRCodeSVG value={urlZaDeljenje} size={200} />
            </div>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
              Skeniraj kod kamerom telefona ili prosledi link.
            </p>
          </div>
        )}

        {greska && <p style={{ color: '#ff4d4d', marginTop: '15px' }}>{greska}</p>}

        <button 
          onClick={onClose} 
          style={{ marginTop: '30px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};

export default ModalZaDeljenje;