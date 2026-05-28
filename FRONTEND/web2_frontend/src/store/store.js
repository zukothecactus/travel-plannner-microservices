import { configureStore } from '@reduxjs/toolkit';
import planReducer from './planSlice';

export const store = configureStore({
    reducer: {
        plan: planReducer,
    },
});