import { createSlice } from '@reduxjs/toolkit';

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    alertMessage: '',
  },
  reducers: {
    setAlertMessage: (state, action) => {
      state.alertMessage = action.payload;
    },
    clearAlertMessage: (state) => {
      state.alertMessage = '';
    },
  },
});

const { setAlertMessage, clearAlertMessage } = alertSlice.actions;
const selectAlertMessage = (state) => state.alert.alertMessage;

export { setAlertMessage, clearAlertMessage, selectAlertMessage };
export default alertSlice.reducer;
