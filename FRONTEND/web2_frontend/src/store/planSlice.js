import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../services/api';

// Asinhrona funkcija za povlačenje plana putovanja
export const dobaviPlan = createAsyncThunk('plan/dobaviPlan', async (id) => {
    const odgovor = await api.get(`/PlanPutovanja/${id}`)
    return odgovor.data;
});

// Asinhrona funkcija za povlačenje potrpsnje
export const dobaviPotrosnju = createAsyncThunk('plan/dobaviPotrosnju', async (id) => {
    const odgovor = await api.get(`/PlanPutovanja/${id}/potrosnja`)
    return odgovor.data.ukupnaPotrosnja;
});

//global store
const initialState = 
{
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
            });
    },
});

export default planSlice.reducer;