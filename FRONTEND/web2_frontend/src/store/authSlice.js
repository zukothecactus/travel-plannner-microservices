import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../services/api';

//async funkcija za login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (podaci, {rejectWithValue}) => 
    {
        try{
            const response = await api.post('/Auth/login', podaci);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('korisnik', JSON.stringify(response.data.korisnik));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || "Greška prilikom logovanja");
        }
    }
);

const authSlice = createSlice(
    {
        name: 'auth',
        initialState: 
        {
            korisnik: JSON.parse(localStorage.getItem('korisnik') || null),
            token: localStorage.getItem('token') || null,
            ucitava : false,
            greska: null
        },
        reducers:
        {
            logout: (state) =>
            {
                state.korisnik = null;
                state.token = null;
                localStorage.removeItem('korisnik');
                localStorage.removeItem('token');
            }
        },
        extraReducers: (builder) =>
        {
            builder
                .addCase(loginUser.pending, (state) => 
                {
                    state.ucitava = true;
                    state.greska = null;
                })
                .addCase(loginUser.fulfilled, (state, action) =>
                {
                    state.ucitava = false;
                    state.korisnik = action.payload.korisnik;
                    state.token = action.payload.token;
                })
                .addCase(loginUser.rejected, (state, action) =>
                {
                    state.ucitava = false;
                    state.greska = action.payload || "Greška prilikom logovanja";
                });
        }
    }
);

export const {logout} = authSlice.actions;
export default authSlice.reducer;