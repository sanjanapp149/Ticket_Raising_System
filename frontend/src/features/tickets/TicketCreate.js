import React, { useState } from "react";
import api from "../../api/axios"; 
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const TicketCreate = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "", 
  });
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("priority", form.priority); 

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      await api.post("/tickets/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Ticket created successfully!");
      setTimeout(() => {
        navigate("/employee"); //Navigate to employee dashboard after success
      }, 2000);
    } catch (err) {
      console.error("Ticket creation error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.title.trim() && form.description.trim();

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Create New Ticket</h3>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Ticket Details */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Ticket Information</h4>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              style={styles.input}
              // placeholder="e.g., Laptop not booting"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              style={styles.textarea}
              rows="6"
              // placeholder="e.g., Stuck on Dell logo..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Priority</label>
            <select
              name="priority"
              style={styles.select}
              value={form.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Attachments */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Attachments (Optional)</h4>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Upload Files (Images/PDF/Doc)</label>
            <input
              type="file"
              multiple
              style={styles.fileInput}
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <small style={styles.smallText}>
              Attach screenshots, logs, or evidence (multiple files allowed)
            </small>
          </div>

          {files.length > 0 && (
            <div style={styles.fileList}>
              <p>Selected Files:</p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {files.map((file, index) => (
                  <li key={index} style={styles.fileItem}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitButton,
            opacity: loading || !isFormValid ? 0.7 : 1,
          }}
          disabled={loading || !isFormValid}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
};

// Styles - Purple Theme (C-DAC inspired)
const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
    background: "linear-gradient(to bottom, #f9faff, #ffffff)",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "32px",
    textAlign: "center",
    marginBottom: "40px",
    color: "#4527a0",
    fontWeight: "700",
  },
  errorAlert: {
    padding: "16px",
    background: "linear-gradient(135deg, #ff4d4f, #cf1322)",
    color: "#ffffff",
    borderRadius: "8px",
    marginBottom: "24px",
    textAlign: "center",
  },
  successAlert: {
    padding: "16px",
    background: "linear-gradient(135deg, #52c41a, #389e0d)",
    color: "#ffffff",
    borderRadius: "8px",
    marginBottom: "24px",
    textAlign: "center",
  },
  form: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#4527a0",
    fontWeight: "600",
    borderBottom: "2px solid #4527a0",
    paddingBottom: "8px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d9d9d9",
    borderRadius: "8px",
    fontSize: "15px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d9d9d9",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d9d9d9",
    borderRadius: "8px",
    fontSize: "15px",
    background: "#ffffff",
    cursor: "pointer",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #d9d9d9",
    borderRadius: "8px",
    fontSize: "15px",
  },
  smallText: {
    display: "block",
    fontSize: "13px",
    color: "#7a7a7a",
    marginTop: "8px",
  },
  fileList: {
    marginTop: "12px",
    padding: "12px",
    background: "#f9f9f9",
    borderRadius: "8px",
  },
  fileItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
  removeButton: {
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "12px",
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #7c4dff, #4527a0)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default TicketCreate;