import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      setError('Please log in to view your tickets.');
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets/");
        let allTickets = response.data;

        // Employee sees only their tickets
        if (!user.is_staff) {
          allTickets = allTickets.filter(
            (ticket) => ticket.creator?.toString() === user.id?.toString()
          );
        }

        setTickets(allTickets);
        setFilteredTickets(allTickets);
      } catch (err) {
        console.error('Fetch error:', err);
        const message = err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load tickets. Please try again.';
        setError(message);
        if (err.response?.status === 401) {
          dispatch({ type: 'auth/logout' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, user, dispatch]);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = tickets.filter(ticket =>
      ticket.title?.toLowerCase().includes(term) ||
      ticket.description?.toLowerCase().includes(term)
    );
    setFilteredTickets(filtered);
  }, [searchTerm, tickets]);

  // Correct status counts using exact DB values
  const statusCounts = {
    NEW: tickets.filter(t => t.status === 'Open').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'In Progress').length,
    CLOSED: tickets.filter(t => t.status === 'Resolved').length,
    PARTIALLY_CLOSED: 0, // Add if you have this status
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'linear-gradient(135deg, #ff4d4f, #cf1322)';
    if (p === 'MEDIUM') return 'linear-gradient(135deg, #faad14, #d48806)';
    if (p === 'LOW') return 'linear-gradient(135deg, #52c41a, #389e0d)';
    return 'linear-gradient(135deg, #d9d9d9, #bfbfbf)';
  };

  const getStatusColor = (status) => {
    if (status === 'Open') return 'linear-gradient(135deg, #1890ff, #096dd9)';
    if (status === 'In Progress') return 'linear-gradient(135deg, #faad14, #d48806)';
    if (status === 'Resolved') return 'linear-gradient(135deg, #52c41a, #389e0d)';
    return 'linear-gradient(135deg, #d9d9d9, #bfbfbf)';
  };

  const getStatusDisplay = (status) => {
    const map = {
      'Open': 'Open',
      'In Progress': 'In Progress',
      'Resolved': 'Resolved',
    };
    return map[status] || status;
  };

  if (loading) return <div style={styles.loading}>Loading your tickets...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {user.is_staff ? 'Admin Dashboard - All Tickets' : 'My Tickets'}
        </h2>
        <Link to="/tickets/create" style={styles.createButton}>
          Create New Ticket
        </Link>
      </div>

      {/* Status Overview Cards */}
      <div style={styles.countsGrid}>
        <div style={{ ...styles.countCard, background: '#1890ff' }}>
          <span style={styles.countIcon}>🆕</span>
          <h3 style={styles.countNumber}>{statusCounts.NEW}</h3>
          <p style={styles.countLabel}>New</p>
        </div>
        <div style={{ ...styles.countCard, background: '#faad14' }}>
          <span style={styles.countIcon}>⚙️</span>
          <h3 style={styles.countNumber}>{statusCounts.IN_PROGRESS}</h3>
          <p style={styles.countLabel}>In Progress</p>
        </div>
        <div style={{ ...styles.countCard, background: '#52c41a' }}>
          <span style={styles.countIcon}>✅</span>
          <h3 style={styles.countNumber}>{statusCounts.CLOSED}</h3>
          <p style={styles.countLabel}>Closed</p>
        </div>
        <div style={{ ...styles.countCard, background: '#9254de' }}>
          <span style={styles.countIcon}>🔒</span>
          <h3 style={styles.countNumber}>{statusCounts.PARTIALLY_CLOSED}</h3>
          <p style={styles.countLabel}>Partially Closed</p>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search tickets by title or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div style={styles.noTickets}>
          <p>{searchTerm ? 'No tickets match your search.' : 'No tickets found.'}</p>
        </div>
      ) : (
        <div style={styles.ticketsGrid}>
          {filteredTickets.map((ticket) => (
            <Link
              to={`/tickets/${ticket.id}`}
              key={ticket.id}
              style={styles.ticketLink}
            >
              <div style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <h4 style={styles.ticketTitle}>#{ticket.id} - {ticket.title}</h4>
                  <span style={{ ...styles.badge, background: getPriorityColor(ticket.priority) }}>
                    {ticket.priority}
                  </span>
                  <span style={{ ...styles.badge, background: getStatusColor(ticket.status) }}>
                    {getStatusDisplay(ticket.status)}
                  </span>
                </div>
                {user.is_staff && ticket.assigned_to && (
                  <p style={styles.assignedTo}>Assigned to: User #{ticket.assigned_to}</p>
                )}
                <p style={styles.ticketDescription}>
                  {ticket.description?.substring(0, 150)}{ticket.description?.length > 150 ? '...' : ''}
                </p>
                <p style={styles.ticketMeta}>
                  Created: {new Date(ticket.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', background: 'linear-gradient(to bottom, #f9faff, #ffffff)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', margin: 0, color: '#4527a0', fontWeight: '700' },
  createButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #7c4dff, #4527a0)', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '16px' },
  countsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' },
  countCard: { padding: '28px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: '#ffffff', transition: 'transform 0.3s' },
  countIcon: { fontSize: '36px', marginBottom: '12px', display: 'block' },
  countNumber: { fontSize: '42px', margin: '0 0 8px', fontWeight: '800' },
  countLabel: { fontSize: '18px', margin: 0, fontWeight: '600' },
  searchInput: { width: '100%', padding: '12px', marginBottom: '32px', border: '1px solid #d9d9d9', borderRadius: '8px', fontSize: '16px', background: '#ffffff' },
  ticketsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' },
  ticketLink: { textDecoration: 'none', color: 'inherit' },
  ticketCard: { padding: '24px', borderRadius: '16px', background: '#ffffff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' },
  ticketHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  ticketTitle: { margin: 0, fontSize: '20px', fontWeight: '700', flex: 1, color: '#1a1a1a' },
  badge: { padding: '8px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase' },
  assignedTo: { fontSize: '14px', color: '#7a7a7a', margin: '0 0 12px', fontStyle: 'italic' },
  ticketDescription: { fontSize: '15px', color: '#4a4a4a', margin: '0 0 16px', lineHeight: '1.6' },
  ticketMeta: { fontSize: '13px', color: '#7a7a7a', margin: 0 },
  loading: { textAlign: 'center', fontSize: '24px', color: '#4527a0', padding: '120px 0' },
  error: { textAlign: 'center', fontSize: '20px', color: '#ff4d4f', padding: '120px 0' },
  noTickets: { textAlign: 'center', fontSize: '20px', color: '#666', padding: '80px 0' },
};

export default EmployeeDashboard;