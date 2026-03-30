import { createSlice } from '@reduxjs/toolkit';

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