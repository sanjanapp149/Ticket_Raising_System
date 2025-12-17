import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.is_staff || false;
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]); // All users for creator & assigned
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [editForm, setEditForm] = useState({
    status: "",
    assigned_to: "",
    confidential_notes: "",
  });

  const STATUS_OPTIONS = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
  ];

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await api.get(`tickets/${id}/`);
        setTicket(res.data);
        setEditForm({
          status: res.data.status || "Open",
          assigned_to: res.data.assigned_to || "",
          confidential_notes: res.data.confidential_notes || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  // Fetch users to map IDs → emails
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await api.get("/users/");
          setUsers(res.data);
        } catch (err) {
          console.warn("Could not load users:", err);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (editForm.status !== ticket.status) {
        formData.append("status", editForm.status);
      }
      if (editForm.assigned_to !== ticket.assigned_to) {
        if (editForm.assigned_to) {
          formData.append("assigned_to", editForm.assigned_to);
        } else {
          formData.append("assigned_to", "");
        }
      }
      formData.append("confidential_notes", editForm.confidential_notes || "");

      if ([...formData.entries()].length === 0) {
        setIsEditing(false);
        return;
      }

      const res = await api.patch(`tickets/${id}/`, formData);
      setTicket(res.data);
      setIsEditing(false);
      alert("Ticket updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      alert("Failed to update ticket.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      try {
        await api.delete(`tickets/${id}/`);
        alert("Ticket deleted successfully!");
        navigate("/admin");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete ticket.");
      }
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      const res = await api.patch(`tickets/${id}/`, formData);
      setTicket(res.data);
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const downloadAttachment = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download attachment.");
    }
  };

  if (loading) return <div style={styles.loading}>Loading ticket details...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!ticket) return null;

  const getPriorityBadge = (priority) => {
    const p = priority?.toUpperCase() || "";
    if (p === "HIGH") return { bg: "#ff4d4f", text: "High" };
    if (p === "MEDIUM") return { bg: "#faad14", text: "Medium" };
    if (p === "LOW") return { bg: "#52c41a", text: "Low" };
    return { bg: "#bfbfbf", text: priority || "N/A" };
  };

  const priorityBadge = getPriorityBadge(ticket.priority);
  const currentStatusLabel = STATUS_OPTIONS.find(opt => opt.value === ticket.status)?.label || ticket.status;

  // Map creator ID → email
  const creatorUser = users.find(u => u.id === ticket.creator);
  const creatorDisplay = creatorUser ? creatorUser.email : `User #${ticket.creator}`;

  // Map assigned ID → email
  const assignedUser = users.find(u => u.id === ticket.assigned_to);
  const assignedDisplay = assignedUser ? assignedUser.email : "Unassigned";

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Ticket #{id} - {ticket.title}</h3>
            <p style={styles.meta}>
              Created by {creatorDisplay} • {new Date(ticket.created_at).toLocaleDateString()}
              {ticket.updated_at && ticket.created_at !== ticket.updated_at &&
                ` • Updated ${new Date(ticket.updated_at).toLocaleDateString()}`
              }
            </p>
          </div>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, background: priorityBadge.bg }}>
              {priorityBadge.text}
            </span>
            <span style={{ ...styles.badge, background: "#1890ff" }}>
              {currentStatusLabel}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={styles.section}>
          <p style={styles.description}>{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments?.length > 0 ? (
          <div style={styles.section}>
            <strong style={styles.sectionTitle}>Attachments</strong>
            <div style={styles.attachmentGrid}>
              {ticket.attachments.map((att, idx) => (
                <button
                  key={idx}
                  onClick={() => downloadAttachment(att.file, att.file.split("/").pop())}
                  style={styles.downloadButton}
                >
                  Download {att.file.split("/").pop()}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p style={styles.noData}>No attachments</p>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <>
            <hr style={styles.hr} />
            <div style={styles.section}>
              <div style={styles.adminHeader}>
                <h5 style={styles.sectionTitle}>Admin Controls</h5>
                <div style={styles.buttonGroup}>
                  {!isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                        Edit Ticket
                      </button>
                      <button onClick={handleDelete} style={styles.deleteButton}>
                        Delete Ticket
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSave} style={styles.saveButton}>Save Changes</button>
                      <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>Cancel</button>
                    </>
                  )}
                </div>
              </div>

              <div style={styles.formGrid}>
                {/* Status */}
                <div style={styles.formRow}>
                  <strong>Status:</strong>
                  <div style={styles.fieldValue}>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={styles.select}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={styles.value}>{currentStatusLabel}</span>
                    )}
                  </div>
                </div>

                {/* Assigned To */}
                <div style={styles.formRow}>
                  <strong>Assigned To:</strong>
                  <div style={styles.fieldValue}>
                    {isEditing ? (
                      <select
                        value={editForm.assigned_to}
                        onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                        style={styles.select}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={styles.value}>{assignedDisplay}</span>
                    )}
                  </div>
                </div>

                {/* Confidential Notes */}
                <div style={styles.formRowFull}>
                  <strong>Confidential Notes (Admin Only):</strong>
                  {isEditing ? (
                    <textarea
                      value={editForm.confidential_notes}
                      onChange={(e) => setEditForm({ ...editForm, confidential_notes: e.target.value })}
                      rows="4"
                      style={styles.textarea}
                      placeholder="These notes are encrypted and visible only to admins..."
                    />
                  ) : (
                    <div style={styles.notesBox}>
                      {ticket.confidential_notes || <em style={{ color: "#aaa" }}>No confidential notes</em>}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Resolve */}
              {!isEditing && ticket.status !== "Resolved" && (
                <div style={styles.quickAction}>
                  <button onClick={() => updateStatus("Resolved")} style={styles.resolveButton}>
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Audit Log */}
        <hr style={styles.hr} />
        <div style={styles.section}>
          <h5 style={styles.sectionTitle}>Audit Log</h5>
          {ticket.audit_logs?.length > 0 ? (
            <div style={styles.auditList}>
              {ticket.audit_logs.map((log) => (
                <div key={log.id} style={styles.auditItem}>
                  <div style={styles.auditMeta}>
                    <strong>{log.created_by || "Admin"}</strong> •
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noData}>No audit logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "960px", margin: "0 auto", padding: "40px 20px", background: "#f9faff", minHeight: "100vh" },
  card: { background: "#fff", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", padding: "40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "32px" },
  title: { fontSize: "30px", fontWeight: "700", color: "#4527a0", margin: 0 },
  meta: { color: "#666", fontSize: "14px", marginTop: "8px" },
  badges: { display: "flex", gap: "12px", flexWrap: "wrap" },
  badge: { padding: "8px 18px", borderRadius: "30px", color: "#fff", fontWeight: "600", fontSize: "14px" },
  description: { fontSize: "16px", lineHeight: "1.7", color: "#333", background: "#f8f9fa", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #667eea" },

  section: { marginBottom: "36px" },
  sectionTitle: { fontSize: "22px", color: "#4527a0", marginBottom: "16px", fontWeight: "600" },
  attachmentGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  noData: { color: "#999", fontStyle: "italic", padding: "20px 0" },
  hr: { border: "none", height: "1px", background: "#eee", margin: "40px 0" },

  adminHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  buttonGroup: { display: "flex", gap: "12px" },
  formGrid: { display: "grid", gap: "20px", marginBottom: "24px" },
  formRow: { display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: "16px" },
  formRowFull: { display: "flex", flexDirection: "column", gap: "10px" },
  fieldValue: { minWidth: "200px" },
  value: { fontWeight: "600", color: "#333" },
  select: { padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px", background: "#fff" },
  textarea: { padding: "14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px", fontFamily: "inherit", resize: "vertical" },
  notesBox: { background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "10px", padding: "16px", minHeight: "80px", color: "#333" },

  editButton: { padding: "10px 20px", background: "#667eea", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  saveButton: { padding: "12px 24px", background: "#52c41a", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  cancelButton: { padding: "12px 24px", background: "#f5222d", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" },
  deleteButton: { padding: "10px 20px", background: "#f5222d", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  resolveButton: { padding: "14px 28px", background: "linear-gradient(135deg, #52c41a, #389e0d)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  quickAction: { textAlign: "center", marginTop: "20px" },
  downloadButton: { padding: "10px 20px", background: "#1890ff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },

  auditList: { display: "flex", flexDirection: "column", gap: "12px" },
  auditItem: { background: "#f8f9fa", borderRadius: "12px", padding: "16px", borderLeft: "4px solid #667eea" },
  auditMeta: { fontSize: "14px", color: "#666", marginBottom: "8px" },

  loading: { textAlign: "center", fontSize: "24px", color: "#4527a0", padding: "120px 0" },
  error: { textAlign: "center", fontSize: "20px", color: "#ff4d4f", padding: "120px 0" },
};

export default TicketDetail;