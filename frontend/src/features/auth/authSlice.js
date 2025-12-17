// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: null,
//   token: localStorage.getItem('access_token') || null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       localStorage.setItem('token', action.payload.token);
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       localStorage.removeItem('token');
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;
// frontend/src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null, // Load from storage on app start
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token); // Save to storage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token"); // Optional: clear refresh token too
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;