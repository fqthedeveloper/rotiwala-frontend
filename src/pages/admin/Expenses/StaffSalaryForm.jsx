// frontend/src/pages/admin/Expenses/StaffSalaryForm.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner, FaSave } from "react-icons/fa";
import { getStaffList, addStaffSalary } from "../../../service/expenseServices";

const StaffSalaryForm = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    staff_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "CASH",
    utr_number: "",
    payment_type: "MONTHLY",
    notes: "",
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getStaffList();
        setStaffList(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load staff list.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "staff_id") {
      const selected = staffList.find((s) => s.id === Number(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          amount: selected.monthly_salary || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!formData.staff_id) {
      setError("Please select a staff member.");
      setSubmitting(false);
      return;
    }
    if (!formData.payment_date) {
      setError("Please select a date.");
      setSubmitting(false);
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      setSubmitting(false);
      return;
    }
    if (formData.payment_method === "ONLINE" && !formData.utr_number.trim()) {
      setError("UTR number is required for online payments.");
      setSubmitting(false);
      return;
    }

    const payload = {
      staff_id: formData.staff_id,
      payment_date: formData.payment_date,
      amount: amount,
      payment_method: formData.payment_method,
      utr_number: formData.utr_number.trim(),
      payment_type: formData.payment_type,
      notes: formData.notes.trim(),
    };

    try {
      await addStaffSalary(payload);
      setSuccess(true);
      setFormData({
        staff_id: "",
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
        payment_method: "CASH",
        utr_number: "",
        payment_type: "MONTHLY",
        notes: "",
      });
      setTimeout(() => navigate("/admin/expenses/staff"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add salary.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading staff...</div>;

  return (
    <div className="staff-salary-form">
      <style>{`
        .staff-salary-form {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          color: #111827;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .page-header .back-btn {
          background: none;
          border: none;
          font-size: 1.4rem;
          color: #475569;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
        }
        .page-header .back-btn:hover {
          background: #e2e8f0;
        }
        .page-header h1 {
          margin: 0;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
        }
        .form-card {
          background: #fff;
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 40px rgba(15,23,42,0.05);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #0f172a;
        }
        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
        }
        .form-group select:focus,
        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .form-group .hint {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
          border: 1px solid rgba(15,23,42,0.1);
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .success-message {
          background: #dcfce7;
          color: #15803d;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(16,185,129,0.24);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .payment-method-group {
          display: flex;
          gap: 16px;
          padding-top: 8px;
        }
        .payment-method-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: normal;
        }
        .payment-method-group input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }
        @media (max-width: 768px) {
          .staff-salary-form { padding: 16px; }
          .form-card { padding: 20px; }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-actions { flex-direction: column; align-items: stretch; }
          .btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/admin/expenses/staff")}>
          <FaArrowLeft />
        </button>
        <h1>💰 Add Staff Payment</h1>
      </div>

      <div className="form-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">✅ Payment added successfully!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Staff Member *</label>
              <select
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                required
              >
                <option value="">Select staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (₹{Number(s.monthly_salary).toFixed(2)}/month)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Date *</label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="100"
                required
              />
              <div className="hint">Auto-filled from monthly salary</div>
            </div>

            <div className="form-group">
              <label>Payment Type *</label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
                required
              >
                <option value="MONTHLY">Monthly Salary</option>
                <option value="ADVANCE">Advance Payment</option>
                <option value="BONUS">Bonus</option>
                <option value="DEDUCTION">Deduction</option>
                <option value="EMERGENCY">Emergency Advance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <div className="payment-method-group">
                <label>
                  <input
                    type="radio"
                    name="payment_method"
                    value="CASH"
                    checked={formData.payment_method === "CASH"}
                    onChange={handleChange}
                  />
                  Cash
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment_method"
                    value="ONLINE"
                    checked={formData.payment_method === "ONLINE"}
                    onChange={handleChange}
                  />
                  Online
                </label>
              </div>
            </div>

            {formData.payment_method === "ONLINE" && (
              <div className="form-group">
                <label>UTR Number *</label>
                <input
                  type="text"
                  name="utr_number"
                  value={formData.utr_number}
                  onChange={handleChange}
                  placeholder="e.g., 123456789012"
                  required={formData.payment_method === "ONLINE"}
                />
                <div className="hint">Unique Transaction Reference number</div>
              </div>
            )}

            <div className="form-group full-width">
              <label>Notes (optional)</label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g., Emergency advance, Monthly salary, Bonus, Deduction..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/expenses/staff")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <FaSpinner className="spinner" /> : <FaSave />}
              {submitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffSalaryForm;