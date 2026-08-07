// frontend/src/pages/admin/Expenses/StaffManagement.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaMoneyBillWave,
  FaEye,
} from "react-icons/fa";
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";
import { useAuth } from "../../../context/AuthContext";

const StaffManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    monthly_salary: "",
    shop: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const isManager = user?.role === "manager";

  // Determine base path for navigation
  // Manager: /manager/staff/...
  // Admin: /admin/expenses/staff/... (matches the route)
  const basePath = isManager ? "/manager" : "/admin/expenses";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffData = await getStaffList();
        setStaff(staffData);
        if (!isManager) {
          const shopsData = await getShops();
          setShops(shopsData);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManager]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      monthly_salary: "",
      shop: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      monthly_salary: formData.monthly_salary || 0,
      is_active: formData.is_active,
    };
    if (!isManager) {
      if (!formData.shop) {
        setError("Please select a shop.");
        setSubmitting(false);
        return;
      }
      payload.shop = formData.shop;
    }

    try {
      let response;
      if (editingId) {
        response = await updateStaff(editingId, payload);
        setStaff(staff.map((s) => (s.id === editingId ? response : s)));
      } else {
        response = await createStaff(payload);
        setStaff([...staff, response]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      await deleteStaff(id);
      setStaff(staff.filter((s) => s.id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      phone: item.phone || "",
      monthly_salary: item.monthly_salary,
      shop: item.shop,
      is_active: item.is_active,
    });
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? shop.name : "N/A";
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="staff-management">
      <style>{`
        .staff-management {
          padding: 16px 24px;
          max-width: 1300px;
          margin: 0 auto;
          color: #111827;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
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
        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease;
          min-height: 44px;
          white-space: nowrap;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-success { background: #14b8a6; color: #fff; }
        .btn-primary { background: #3b82f6; color: #fff; }
        .btn-danger { background: #ef4444; color: #fff; }
        .btn-secondary { background: #e2e8f0; color: #0f172a; border: 1px solid rgba(15,23,42,0.1); }
        .btn-sm { padding: 6px 12px; font-size: 13px; }
        .btn-warning { background: #f59e0b; color: #fff; }
        .btn-warning:hover { background: #d97706; }
        .btn-info { background: #8b5cf6; color: #fff; }
        .btn-info:hover { background: #7c3aed; }

        .form-card {
          background: #fff;
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
          margin-bottom: 24px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px 20px;
          align-items: end;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #475569;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.12);
          background: #f8fafc;
          font-size: 14px;
          outline: none;
        }
        .form-group input:focus,
        .form-group select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .form-group .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .form-group .checkbox-wrapper input {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }
        .form-group.actions-group {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .table-wrapper {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }
        th, td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          white-space: nowrap;
        }
        th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
        }
        tr:hover td {
          background: rgba(14,165,233,0.04);
        }
        .actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .actions button {
          min-width: 44px;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          background: #dcfce7;
          color: #15803d;
          display: inline-block;
        }
        .status-badge.inactive {
          background: #fee2e2;
          color: #b91c1c;
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 992px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .staff-management { padding: 14px 16px; }
          .form-card { padding: 18px; }
          .form-grid { grid-template-columns: 1fr; gap: 14px; }
          .form-group.actions-group {
            flex-direction: column;
            align-items: stretch;
          }
          .form-group.actions-group .btn {
            width: 100%;
            justify-content: center;
          }
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .page-header .btn {
            width: 100%;
            justify-content: center;
          }
          table { min-width: 600px; }
        }
        @media (max-width: 480px) {
          .staff-management { padding: 12px; }
          .form-card { padding: 16px; }
          th, td { padding: 12px 14px; }
          .page-header h1 { font-size: 1.7rem; }
          .btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            className="back-btn"
            onClick={() => navigate(isManager ? "/manager/expenses" : "/admin/expenses")}
          >
            <FaArrowLeft />
          </button>
          <h1>👨‍🍳 Staff Management</h1>
        </div>
        <button
          className="btn btn-warning"
          onClick={() => navigate(`${basePath}/staff/salary/add`)}
        >
          <FaMoneyBillWave /> Add Salary
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Monthly Salary (₹)</label>
              <input
                type="number"
                name="monthly_salary"
                value={formData.monthly_salary}
                onChange={handleChange}
                min="0"
                step="100"
              />
            </div>
            {!isManager && (
              <div className="form-group">
                <label>Shop</label>
                <select
                  name="shop"
                  value={formData.shop}
                  onChange={handleChange}
                  required={!editingId}
                >
                  <option value="">Select Shop</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group" style={{ minWidth: "120px" }}>
              <label>Status</label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Active</span>
              </div>
            </div>
            <div className="form-group actions-group">
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? <FaSpinner className="spinner" /> : editingId ? <FaSave /> : <FaPlus />}
                {editingId ? "Update" : "Add Staff"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Staff Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Monthly Salary</th>
              <th>Shop</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No staff members yet.</td></tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.phone || "-"}</td>
                  <td>₹{Number(s.monthly_salary).toFixed(2)}</td>
                  <td>{isManager ? "My Shop" : getShopName(s.shop)}</td>
                  <td>
                    <span className={`status-badge ${s.is_active ? "" : "inactive"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {/* View Salary Details */}
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => navigate(`${basePath}/staff/salary/detail/${s.id}`)}
                      >
                        <FaEye /> View
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => startEdit(s)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;