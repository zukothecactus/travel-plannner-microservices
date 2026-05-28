import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../services/api';

// Asinhrona funkcija za povlačenje plana putovanja
export const dobaviPlan = createAsyncThunk(
    'plan/dobaviPlan', 
    async (id) => {
    const odgovor = await api.get(`/PlanPutovanja/${id}`)
    return odgovor.data;
});
// Asinhrona funkcija za povlačenje potrpsnje
export const dobaviPotrosnju = createAsyncThunk(
    'plan/dobaviPotrosnju', 
    async (id) => {
    const odgovor = await api.get(`/PlanPutovanja/${id}/potrosnja`)
    return odgovor.data.ukupnaPotrosnja;
});

export const dodajTrosak = createAsyncThunk(
    'plan/dodajTrosak', 
    async (noviTrosak, {dispatch}) => {
    //post saljemo ka web apiju
    const odgovor = await api.post('/PlanPutovanja/trosak', noviTrosak);

    //koristimo dispatch za realtime osvezavanje
    dispatch(dobaviPlan(noviTrosak.planPutovanjaId));
    dispatch(dobaviPotrosnju(noviTrosak.planPutovanjaId));

    return odgovor.data;
});

export const dobaviSvePlanove = createAsyncThunk(
    'plan/dobaviSvePlanove', 
    async () => {
    const odgovor = await api.get('/PlanPutovanja');
    return odgovor.data;
});

export const kreirajPlan = createAsyncThunk(
    'plan/kreirajPlan',
    async (noviPlan, { dispatch }) => {
        // Šaljemo POST zahtev na osnovnu rutu kontrolera
        const odgovor = await api.post('/PlanPutovanja', noviPlan);
        
        // Čim baza potvrdi upis, osvežavamo listu na ekranu
        dispatch(dobaviSvePlanove());
        
        return odgovor.data;
    }
);

export const obrisiPlan = createAsyncThunk(
    'plan/obrisiPlan', 
    async (id, { dispatch }) => {
        await api.delete(`/PlanPutovanja/${id}`);
        // Čim obrišemo plan, tražimo od baze novu, osveženu listu
        dispatch(dobaviSvePlanove());
        return id;
    }
);

export const obrisiTrosak = createAsyncThunk(
    'plan/obrisiTrosak', 
    async ({ trosakId, planId, iznos }, { dispatch }) => {
        // Šaljemo planId i iznos kroz URL parametre (Query)
        await api.delete(`/PlanPutovanja/trosak/${trosakId}?planId=${planId}&iznos=${iznos}`);
        // Osvežavamo i bazu i trenutni budžet za taj plan
        dispatch(dobaviPlan(planId));
        dispatch(dobaviPotrosnju(planId));
        return trosakId;
    }
);

export const dodajDestinaciju = createAsyncThunk(
    'plan/dodajDestinaciju',
    async (novaDestinacija, { dispatch }) => {
        // Gađamo rutu koju smo ranije napravili na WebAPI-ju
        const odgovor = await api.post('/PlanPutovanja/destinacija', novaDestinacija);
        
        // Čim baza potvrdi upis, osvežavamo ceo plan kako bi se destinacija pojavila na ekranu
        dispatch(dobaviPlan(novaDestinacija.planPutovanjaId));
        
        return odgovor.data;
    }
);

//global store
const initialState = 
{
    sviPlanovi: [],
    podaci: null,
    trenutniBudzet: null,
    ucitava: false,
    greska: null,
};
//slajs
const planSlice = createSlice({
    name: 'plan',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(dobaviPlan.pending, (state) => {
                state.ucitava = true;
                state.greska = null;
            })
            .addCase(dobaviPlan.fulfilled, (state, action) => {
                state.ucitava = false;
                state.podaci = action.payload;
            })
            .addCase(dobaviPlan.rejected, (state, action) => {
                state.ucitava = false;
                state.greska = action.error.message;
            })
            .addCase(dobaviPotrosnju.pending, (state) => {
                state.greska = null;
            })
            //hvatamo i brzu potrosnju iz naseg stateful servisa
            .addCase(dobaviPotrosnju.fulfilled, (state, action) => {
                state.trenutniBudzet = action.payload;
            })
            .addCase(dobaviPotrosnju.rejected, (state, action) => {
                state.greska = action.error.message;
            })
            .addCase(dobaviSvePlanove.pending, (state) => {
                state.ucitava = true;
                state.greska = null;
            })
            .addCase(dobaviSvePlanove.fulfilled, (state, action) => {
                state.ucitava = false;
                state.sviPlanovi = action.payload; // Čuvamo listu sa servera
            })
            .addCase(dobaviSvePlanove.rejected, (state, action) => {
                state.ucitava = false;
                state.greska = action.error.message;
            });
    },
});

export default planSlice.reducer;