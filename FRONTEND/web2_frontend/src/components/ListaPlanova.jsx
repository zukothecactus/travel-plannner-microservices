import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dobaviSvePlanove, obrisiPlan } from '../store/planSlice';
import DodajPlan from './DodajPlan'; 

const ListaPlanova = ({ onIzaberiPlan }) => {
  const dispatch = useDispatch();
  const { sviPlanovi, ucitava, greska } = useSelector((state) => state.plan);

  useEffect(() => {
    dispatch(dobaviSvePlanove());
  }, [dispatch]);

  if (ucitava) return <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>Učitavanje planova putovanja...</p>;
  if (greska) return <p style={{ color: 'var(--danger)', textAlign: 'center' }}>Greška: {greska}</p>;

  return (
    <div className="app-container" style={{ padding: '0' }}>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--mystic-blue)' }}>Sva moja putovanja</h2>
      </div>
      
      {/* Dugme i forma za dodavanje novog plana */}
      <DodajPlan />

      {sviPlanovi.length === 0 && !ucitava ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', marginTop: '30px' }}>
           <p className="text-muted" style={{ fontSize: '16px' }}>Trenutno nema dodatih planova. Dodaj svoj prvi plan iznad!</p>
        </div>
      ) : (
        /* Primenjena .plans-grid klasa za ravnomeran raspored */
        <div className="plans-grid">
          {sviPlanovi.map((plan) => (
            <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', marginBottom: 0 }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--venice-blue)' }}>{plan.naziv}</h3>
              <p className="text-muted" style={{ flexGrow: 1, marginBottom: '20px' }}>{plan.opis}</p>
              
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '20px' }}>
                <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Planirani budžet</span>
                <strong style={{ fontSize: '18px', color: 'var(--mystic-blue)' }}>{plan.planiraniBudzet} EUR</strong>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => onIzaberiPlan(plan.id)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Otvori detalje
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('Da li ste sigurni da želite da trajno obrišete ovaj plan putovanja?')) {
                      dispatch(obrisiPlan(plan.id));
                    }
                  }}
                  className="btn btn-outline"
                  style={{ padding: '10px', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent' }}
                  onMouseOver={(e) => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--danger)'; }}
                  title="Obriši plan"
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaPlanova;