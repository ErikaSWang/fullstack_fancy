import { configureStore } from '@reduxjs/toolkit';
import currentReducer from './features/currentSlice';

// THESE ARE WHERE THE STATE VARIABLES ARE STORED (AND ACCESSED?)
const store = configureStore({
  reducer: {
    current: currentReducer,
  },
});

export default store;