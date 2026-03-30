import { configureStore } from '@reduxjs/toolkit';
import currentReducer from './features/currentSlice';

const store = configureStore({
  reducer: {
    current: currentReducer,
  },
});

export default store;