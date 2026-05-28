import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css'; // Ostavljamo default stilove koje je Vite generisao

function App() {
  // Stanja (state) za čuvanje podataka, učitavanja i potencijalnih grešaka
  const [plan, setPlan] = useState(null);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState(null);

  useEffect(() => {
    // Definišemo asinhronu funkciju za povlačenje podataka
    const ucitajPlan = async () => {
      try {
        // Gađamo rutu GET /api/PlanPutovanja/1
        // Axios automatski konvertuje JSON iz tvog C# backend-a u JavaScript objekat
        const odgovor = await api.get('/PlanPutovanja/1');
        
        setPlan(odgovor.data);
      } catch (err) {
        // U slučaju da klaster nije pokrenut ili CORS nije dobro podešen
        setGreska(err.message);
      } finally {
        setUcitava(false);
      }
    };

    // Pozivamo funkciju
    ucitajPlan();
  }, []); // Prazan niz [] osigurava da se useEffect pokrene SAMO JEDNOM, na početku

  return (
    <div className="app-container">
      <h1>Moj Travel Planner</h1>
      
      {/* Uslovno renderovanje na osnovu stanja */}
      {ucitava && <p>Učitavanje podataka iz baze...</p>}
      
      {greska && <p style={{ color: 'red' }}>Došlo je do greške: {greska}</p>}

      {/* Kada podaci stignu i nema greške, ispisujemo ih */}
      {plan && (
        <div style={{ textAlign: 'left', background: '#242424', padding: '20px', borderRadius: '8px', border: '1px solid #646cff' }}>
          <h2>{plan.naziv}</h2>
          <p><strong>Opis:</strong> {plan.opis}</p>
          <p><strong>Planirani budžet:</strong> {plan.planiraniBudzet}</p>
          
          <hr />
          
          <h3>Zabeleženi troškovi:</h3>
          {plan.troskovi && plan.troskovi.length > 0 ? (
            <ul>
              {plan.troskovi.map((trosak) => (
                // Ključ (key) je obavezan u Reactu pri renderovanju listi
                <li key={trosak.id}>
                  {trosak.kategorija} - {trosak.opis}: <strong>{trosak.iznos}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nema evidentiranih troškova za ovaj plan.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;