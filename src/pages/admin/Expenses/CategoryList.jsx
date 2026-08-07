// frontend/src/pages/admin/Expenses/CategoryList.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpenseCategories,
  deleteExpenseCategory,
  updateExpenseCategory,
} from "../../../service/expenseServices";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa";

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category permanently? This may affect existing expenses.")) {
      try {
        await deleteExpenseCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
      } catch (err) {
        alert("Delete failed: " + (err.response?.data?.detail || "Unknown error"));
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditActive(category.is_active);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditActive(true);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      const updated = await updateExpenseCategory(id, { name: editName.trim(), is_active: editActive });
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      cancelEdit();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  return (
    <div className="category-list-page">
      <style>{`
        .category-list-page {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          color: #111827;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        .page-header .left {
          display: flex;
          align-items: center;
          gap: 16px;
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
          margin: 0;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
        }
        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        .btn-success {
          background: #14b8a6;
          color: #fff;
        }
        .btn-success:hover {
          background: #0d9488;
        }
        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-danger {
          background: #ef4444;
          color: #fff;
        }
        .btn-danger:hover {
          background: #dc2626;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
          border: 1px solid rgba(15,23,42,0.1);
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
        .category-table {
          width: 100%;
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 40px rgba(15,23,42,0.05);
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        th {
          background: #f8fafc;
          font-weight: 700;
        }
        tr:hover td {
          background: rgba(14,165,233,0.05);
        }
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .edit-input {
          padding: 6px 12px;
          border: 1px solid rgba(15,23,42,0.2);
          border-radius: 8px;
          background: #f8fafc;
          font-size: 14px;
          width: 200px;
        }
        .edit-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
          outline: none;
        }
        .edit-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
          cursor: pointer;
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
        .empty {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
        @media (max-width: 768px) {
          .category-list-page { padding: 16px; }
          .page-header { flex-direction: column; align-items: stretch; }
          table { font-size: 14px; }
          th, td { padding: 12px; }
          .edit-input { width: 120px; }
          .actions { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="page-header">
        <div className="left">
          <button className="back-btn" onClick={() => navigate("/admin/expenses")}>
            <FaArrowLeft />
          </button>
          <h1>📂 Expense Categories</h1>
        </div>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/expenses/categories/add")}
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</div>}

      <div className="category-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="empty">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="empty">No categories yet. Create one!</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>
                    {editingId === cat.id ? (
                      <input
                        className="edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td>
                    {editingId === cat.id ? (
                      <input
                        className="edit-checkbox"
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                    ) : (
                      <span className={`status-badge ${cat.is_active ? "" : "inactive"}`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === cat.id ? (
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => saveEdit(cat.id)}>
                          <FaSave />
                        </button>
                        <button className="btn btn-secondary" onClick={cancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => startEdit(cat)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(cat.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    )}
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

export default CategoryList;