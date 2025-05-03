import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // Flag to mark if the user is currently logged in
    isAuthenticated: null,
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

const selectAuthenticated = (state) => state.auth.isAuthenticated;
const { setAuthenticated } = authSlice.actions;

export { selectAuthenticated, setAuthenticated };
export default authSlice.reducer;
