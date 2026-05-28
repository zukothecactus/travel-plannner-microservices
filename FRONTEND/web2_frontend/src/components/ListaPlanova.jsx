import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dobaviSvePlanove, obrisiPlan } from '../store/planSlice';
import DodajPlan from './DodajPlan'; // Ubacujemo novu komponentu

const ListaPlanova = ({ onIzaberiPlan }) => {
  const dispatch = useDispatch();
  const { sviPlanovi, ucitava, greska } = useSelector((state) => state.plan);

  useEffect(() => {
    dispatch(dobaviSvePlanove());
  }, [dispatch]);

  if (ucitava) return <p>Učitavanje planova putovanja...</p>;
  if (greska) return <p style={{ color: 'red' }}>Greška: {greska}</p>;

  return (
    <div>
      <h2>Sva moja putovanja</h2>
      
      {/* Dodajemo formu na sam vrh liste */}
      <DodajPlan />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
        {sviPlanovi.map((plan) => (
          <div 
            key={plan.id} 
            style={{ 
              background: '#242424', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #646cff',
              width: '250px',
              textAlign: 'left'
            }}
          >
            <h3>{plan.naziv}</h3>
            <p style={{ color: '#aaa', fontSize: '14px' }}>{plan.opis}</p>
            <p><strong>Budžet:</strong> {plan.planiraniBudzet}</p>
            
            <button 
              onClick={() => onIzaberiPlan(plan.id)}
              style={{ width: '100%', marginTop: '10px', background: '#535bf2' }}
            >
              Otvori detalje
            </button>
            <button onClick={() => {
                    if(window.confirm('Da li ste sigurni da želite da trajno obrišete ovaj plan putovanja?')) {
                    dispatch(obrisiPlan(plan.id));}}}
                style={{ width: '100%', marginTop: '5px', background: '#ff4d4d', color: 'white', border: 'none' }}
                >
                Obriši plan
            </button>
          </div>
        ))}
        
        {sviPlanovi.length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#888' }}>Nemate još nijedan kreiran plan putovanja.</p>
        )}
      </div>
    </div>
  );
};

export default ListaPlanova;