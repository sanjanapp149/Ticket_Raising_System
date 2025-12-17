import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TicketDetail from './features/tickets/TicketDetail';
import TicketCreate from './features/tickets/TicketCreate';
import Login from './pages/Login';
import ProtectedLayout from "./components/ProjectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/tickets/create" element={<TicketCreate />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
          
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
