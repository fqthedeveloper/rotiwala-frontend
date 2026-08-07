// frontend/src/pages/admin/Expenses/AddCategory.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { createExpenseCategory } from "../../../service/expenseServices";

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      setLoading(false);
      return;
    }

    try {
      await createExpenseCategory({ name: trimmedName, is_active: formData.is_active });
      setSuccess(true);
      setFormData({ name: "", is_active: true });
      // Navigate back to category list after success
      setTimeout(() => {
        navigate("/admin/expenses/categories");
      }, 1500);
    } catch (err) {
      console.error("Error creating category:", err);
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to create category.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-page">
      <style>{`
        .add-category-page {
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
          transition: background 0.2s ease;
        }
        .page-header .back-btn:hover {
          background: #e2e8f0;
        }
        .page-header h1 {
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          font-weight: 700;
          margin: 0;
        }
        .category-form {
          background: #ffffff;
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
        }
        .form-group {
          margin-bottom: 22px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #0f172a;
        }
        .form-group input[type="text"] {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }
        .form-group input[type="text"]:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }
        .form-group .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .form-group .checkbox-wrapper input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #3b82f6;
          cursor: pointer;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-primary {
          background: #3b82f6;
          color: #ffffff;
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
          border: 1px solid rgba(15, 23, 42, 0.1);
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
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .success-message {
          background: #dcfce7;
          color: #15803d;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(16, 185, 129, 0.24);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .add-category-page { padding: 16px; }
          .category-form { padding: 20px; }
          .form-actions { flex-direction: column; align-items: stretch; }
          .btn { width: 100%; justify-content: center; }
        }
        @media (max-width: 560px) {
          .add-category-page { padding: 12px; }
          .category-form { padding: 18px; }
        }
      `}</style>

      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/admin/expenses")}>
          <FaArrowLeft />
        </button>
        <h1>➕ Add Expense Category</h1>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Category created successfully! ✅</div>}

        <div className="form-group">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Raw Material, Staff Salary, Maintenance"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <span>Active (visible to managers)</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/expenses")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;