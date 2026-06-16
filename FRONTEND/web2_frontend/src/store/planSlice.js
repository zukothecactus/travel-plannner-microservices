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

export const dodajNaSpisak = createAsyncThunk(
    'plan/dodajNaSpisak',
    async (novaStavka, {dispatch}) =>
    {
        await api.post('/PlanPutovanja/todo', novaStavka);
        dispatch(dobaviPlan(novaStavka.PlanPutovanjaId));
        return novaStavka;
    }
);

export const toggleZavrseno = createAsyncThunk(
    'plan/toggleZavrseno',
    async ({ stavkaId, planId }, { dispatch }) => {
        await api.put(`/PlanPutovanja/todo/${stavkaId}/toggle`);
        dispatch(dobaviPlan(planId));
        return stavkaId;
    }   
);

export const obrisiSaSpiska = createAsyncThunk(
    'plan/obrisiSaSpiska',
    async ({ stavkaId, planId }, { dispatch }) => {
        await api.delete(`/PlanPutovanja/todo/${stavkaId}`);
        dispatch(dobaviPlan(planId));
        return stavkaId;
    }
);

export const generisiLinkZaDeljenje = createAsyncThunk(
    'plan/generisiLinkZaDeljenje',
    async({planId, nivoPristupa, trajanjeUMinutima = 1440}, {rejectWithValue}) => {
        try {
            const response = await api.post(`/PlanPutovanja/${planId}/generisi-token`, {
                nivoPristupa,
                trajanjeUMinutima
            });
            return response.data.token;
        }catch (error) {
            return rejectWithValue(error.response?.data || "Greska pri generisanju linka za deljenje.");

        }
    }
);

export const validirajDeljeniLink = createAsyncThunk(
    'plan/validirajDeljeniLink',
    async (token, { rejectWithValue }) => {
        try {
            // Slanje GET zahteva sa tokenom u URL-u (ovo je ona [AllowAnonymous] ruta)
            const odgovor = await api.get(`/PlanPutovanja/validiraj-deljenje/${token}`);
            return odgovor.data; // Očekujemo { plan: {...}, nivoPristupa: "VIEW"|"EDIT", poruka }
        } catch (error) {
            return rejectWithValue(error.response?.data || "Neispravan ili istekao link za deljenje.");
        }
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

    deljeniPlan: null, // Čuvamo podatke o planu koji je deljen putem linka
    nivoPristupaDeljenog: null,
    deljenjUcitava: false,
    deljenjGreska: null,
    generisaniToken: null, // Token koji je generisan za deljenje
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
            })
            .addCase(generisiLinkZaDeljenje.pending, (state) => {
                state.greska = null;
            })
            .addCase(generisiLinkZaDeljenje.fulfilled, (state, action) => {
                state.generisaniToken = action.payload; // Čuvamo token kako bi ga komponenta pretvorila u QR kod
            })
            .addCase(generisiLinkZaDeljenje.rejected, (state, action) => {
                state.greska = action.payload;
            })
            .addCase(validirajDeljeniLink.pending, (state) => {
                state.deljenjeUcitava = true;
                state.deljenjeGreska = null;
                state.deljeniPlan = null;
                state.nivoPristupaDeljenog = null;
            })
            .addCase(validirajDeljeniLink.fulfilled, (state, action) => {
                state.deljenjeUcitava = false;
                // Akcija payload sadrži strukturu koju nam vraća C#: { Plan, NivoPristupa, Poruka }
                state.deljeniPlan = action.payload.plan; 
                state.nivoPristupaDeljenog = action.payload.nivoPristupa;
            })
            .addCase(validirajDeljeniLink.rejected, (state, action) => {
                state.deljenjeUcitava = false;
                state.deljenjeGreska = action.payload;
            });
    },
});

export default planSlice.reducer;