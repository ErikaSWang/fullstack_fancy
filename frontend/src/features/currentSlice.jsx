import { createSlice } from '@reduxjs/toolkit';

// THIS IS A STATE SAVER, THAT ALLOWS THE APP TO ACCESS THE CURRENT STATE OF THE VARIABLES FROM ANY PART OF THE APP
// (without having to use props)

// Includes the current state
// And a way to update the state
export const currentSlice = createSlice({
  name: 'current',
  initialState: {
    page: 'Home'
  },
  reducers: {
    changePage: (state, action) => {
      state.page = action.payload;
    }
  }
});

export const { changePage } = currentSlice.actions;
export const currentPage = (state) => state.current.page;
export default currentSlice.reducer;