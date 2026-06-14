import { configureStore } from '@reduxjs/toolkit';
import planReducer from './planSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        plan: planReducer,
        auth: authReducer,
    },
});