import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
    },
    updateTicket: (state, action) => {
      const index = state.tickets.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.tickets[index] = action.payload;
    },
  },
});

export const { setTickets, addTicket, updateTicket } = ticketSlice.actions;
export default ticketSlice.reducer;
