import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const token = useSelector((state) => state.auth.token);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]); // To map ID → email
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  // Fetch tickets and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tickets
        const ticketsRes = await api.get('/tickets/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(ticketsRes.data);

        // Fetch users to map creator ID → email
        const usersRes = await api.get('/users/');
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Status counts using correct values from your model
  const statusCounts = {
    Total: tickets.length,
    Open: tickets.filter(t => t.status === 'Open').length,
    InProgress: tickets.filter(t => t.status === 'In Progress').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  const getPriorityValue = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket =>
    filterStatus === 'All' ? true : ticket.status === filterStatus
  );

  // Sort by priority
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priA = getPriorityValue(a.priority);
    const priB = getPriorityValue(b.priority);
    return sortOrder === 'asc' ? priA - priB : priB - priA;
  });

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return '#ff4d4f';
    if (p === 'MEDIUM') return '#faad14';
    if (p === 'LOW') return '#52c41a';
    return '#d9d9d9';
  };

  const getStatusColor = (status) => {
    if (status === 'Open') return '#1890ff';
    if (status === 'In Progress') return '#faad14';
    if (status === 'Resolved') return '#52c41a';
    return '#d9d9d9';
  };

  const getStatusDisplay = (status) => {
    const map = {
      'Open': 'Open',
      'In Progress': 'In Progress',
      'Resolved': 'Resolved',
    };
    return map[status] || status;
  };

  // Helper to get creator email from ID
  const getCreatorEmail = (creatorId) => {
    const user = users.find(u => u.id === creatorId);
    return user ? user.email : `User #${creatorId}`;
  };

  if (loading) return <div style={styles.loading}>Loading tickets...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard - All Tickets</h1>

      {/* Overview Cards */}
      <div style={styles.countsGrid}>
        <div style={{ ...styles.countCard, background: '#4527a0' }}>
          <div style={styles.countNumber}>{statusCounts.Total}</div>
          <p style={styles.countLabel}>Total Tickets</p>
        </div>
        <div style={{ ...styles.countCard, background: '#1890ff' }}>
          <div style={styles.countNumber}>{statusCounts.Open}</div>
          <p style={styles.countLabel}>Open</p>
        </div>
        <div style={{ ...styles.countCard, background: '#faad14' }}>
          <div style={styles.countNumber}>{statusCounts.InProgress}</div>
          <p style={styles.countLabel}>In Progress</p>
        </div>
        <div style={{ ...styles.countCard, background: '#52c41a' }}>
          <div style={styles.countNumber}>{statusCounts.Resolved}</div>
          <p style={styles.countLabel}>Resolved</p>
        </div>
      </div>

      {/* Filter & Sort */}
      <div style={styles.controls}>
        <div>
          <label style={styles.label}>Filter by Status: </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <button onClick={toggleSort} style={styles.sortButton}>
          Sort by Priority: {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
        </button>
      </div>

      {/* Ticket Cards Grid */}
      <div style={styles.ticketsGrid}>
        {sortedTickets.length === 0 ? (
          <p style={styles.noTickets}>No tickets found</p>
        ) : (
          sortedTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={styles.ticketCard}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div style={styles.ticketHeader}>
                <h3 style={styles.ticketTitle}>#{ticket.id} - {ticket.title}</h3>
                <span style={{ ...styles.badge, background: getPriorityColor(ticket.priority) }}>
                  {ticket.priority || 'N/A'}
                </span>
                <span style={{ ...styles.badge, background: getStatusColor(ticket.status) }}>
                  {getStatusDisplay(ticket.status)}
                </span>
              </div>
              <p style={styles.ticketMeta}>
                Creator: {getCreatorEmail(ticket.creator)}
              </p>
              <p style={styles.ticketDescription}>
                {ticket.description?.substring(0, 120)}{ticket.description?.length > 120 ? '...' : ''}
              </p>
              <p style={styles.ticketDate}>
                Created: {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'linear-gradient(to bottom, #f9faff, #ffffff)',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '32px',
    color: '#4527a0',
    fontWeight: '700',
    marginBottom: '40px',
  },
  countsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  countCard: {
    padding: '28px 20px',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#ffffff',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
  },
  countNumber: {
    fontSize: '42px',
    margin: '0 0 8px',
    fontWeight: '800',
  },
  countLabel: {
    fontSize: '18px',
    margin: 0,
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
  },
  label: {
    fontWeight: '600',
    marginRight: '10px',
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d9d9d9',
    fontSize: '16px',
  },
  sortButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c4dff, #4527a0)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  ticketsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
  },
  ticketCard: {
    padding: '24px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  ticketTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '24px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  ticketMeta: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '12px',
  },
  ticketDescription: {
    fontSize: '15px',
    color: '#4a4a4a',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  ticketDate: {
    fontSize: '13px',
    color: '#7a7a7a',
    margin: 0,
  },
  noTickets: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#666',
    padding: '80px 0',
  },
  loading: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#4527a0',
    padding: '120px 0',
  },
  error: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#ff4d4f',
    padding: '120px 0',
  },
};

export default AdminDashboard;