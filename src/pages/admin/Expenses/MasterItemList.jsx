// frontend/src/pages/admin/Expenses/MasterItemList.js

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
} from "react-icons/fa";
import {
  getExpenseCategories,
  getExpenseMasterItems,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
} from "../../../service/expenseServices";

const MasterItemList = () => {
  const navigate = useNavigate();

  // ---------- State ----------
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemActive, setNewItemActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  // ---------- Fetch Categories ----------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getExpenseCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // ---------- Fetch Items when Category Changes ----------
  useEffect(() => {
    if (!selectedCategoryId) return;
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExpenseMasterItems(selectedCategoryId);
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items for this category.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategoryId]);

  // ---------- Handlers ----------
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setError("Item name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const newItem = await createMasterItem({
        category: selectedCategoryId,
        name: newItemName.trim(),
        is_active: newItemActive,
      });
      setItems([...items, newItem]);
      setNewItemName("");
      setNewItemActive(true);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err.response?.data?.name?.[0] || "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditActive(item.is_active);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditActive(true);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      const updated = await updateMasterItem(id, {
        name: editName.trim(),
        is_active: editActive,
      });
      setItems(items.map((item) => (item.id === id ? updated : item)));
      cancelEdit();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await deleteMasterItem(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  // ---------- Render ----------
  return (
    <div className="master-item-list-page">
      <style>{`
        .master-item-list-page {
          padding: 24px;
          max-width: 1000px;
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
          transition: background 0.2s ease;
        }
        .page-header .back-btn:hover {
          background: #e2e8f0;
        }
        .page-header h1 {
          margin: 0;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
        }
        .page-header .subtitle {
          color: #64748b;
          font-size: 1rem;
          margin-left: auto;
        }
        .filter-section {
          background: #fff;
          padding: 18px 22px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          margin-bottom: 24px;
        }
        .filter-section select {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #f8fafc;
          font-size: 15px;
          min-width: 250px;
          outline: none;
        }
        .filter-section select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }

        .add-item-form {
          background: #fff;
          padding: 20px 22px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
        }
        .add-item-form input[type="text"] {
          flex: 1 1 200px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #f8fafc;
          font-size: 15px;
          outline: none;
        }
        .add-item-form input[type="text"]:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }
        .add-item-form .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .add-item-form .checkbox-group input {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
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
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-success {
          background: #14b8a6;
          color: #fff;
        }
        .btn-success:hover:not(:disabled) {
          background: #0d9488;
        }
        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-danger {
          background: #ef4444;
          color: #fff;
        }
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.1);
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .items-table {
          width: 100%;
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
        }
        tr:hover td {
          background: rgba(14, 165, 233, 0.04);
        }
        .edit-input {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(15, 23, 42, 0.2);
          background: #f8fafc;
          font-size: 14px;
          width: 200px;
        }
        .edit-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
          outline: none;
        }
        .edit-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
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
        .actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 768px) {
          .master-item-list-page {
            padding: 16px;
          }
          .add-item-form {
            flex-direction: column;
            align-items: stretch;
          }
          .add-item-form input[type="text"] {
            width: 100%;
          }
          .filter-section select {
            width: 100%;
            min-width: unset;
          }
          table {
            font-size: 14px;
          }
          th,
          td {
            padding: 10px 12px;
          }
          .edit-input {
            width: 120px;
          }
        }
        @media (max-width: 560px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .page-header .subtitle {
            margin-left: 0;
          }
          td[data-label] {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
          }
          td[data-label]::before {
            content: attr(data-label);
            font-weight: 600;
            color: #475569;
          }
          thead {
            display: none;
          }
          tr {
            display: block;
            margin-bottom: 12px;
            border-bottom: 2px solid rgba(15, 23, 42, 0.08);
          }
          td {
            display: flex;
            justify-content: space-between;
            border: none;
            padding: 8px 12px;
          }
          .actions {
            justify-content: flex-end;
          }
        }
      `}</style>

      {/* ---------- Header ---------- */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/admin/expenses")}>
          <FaArrowLeft />
        </button>
        <h1>📦 Master Items (Raw Materials)</h1>
        <span className="subtitle">Manage items like Atta, Sugar, Oil</span>
      </div>

      {/* ---------- Category Selector ---------- */}
      <div className="filter-section">
        <label style={{ fontWeight: 600, marginRight: "12px" }}>Select Category:</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} {!cat.is_active && "(Inactive)"}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Error Display ---------- */}
      {error && <div className="error-message">{error}</div>}

      {/* ---------- Add Item Form ---------- */}
      <form className="add-item-form" onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Enter item name (e.g., Atta)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          disabled={submitting}
        />
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="newItemActive"
            checked={newItemActive}
            onChange={(e) => setNewItemActive(e.target.checked)}
            disabled={submitting}
          />
          <label htmlFor="newItemActive">Active</label>
        </div>
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? <FaSpinner className="spinner" /> : <FaPlus />}
          {submitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      {/* ---------- Items Table ---------- */}
      <div className="items-table">
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
              <tr>
                <td colSpan="4" className="empty-state">Loading items...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No items found in this category. Add one above!
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td data-label="ID">{item.id}</td>
                  <td data-label="Name">
                    {editingId === item.id ? (
                      <input
                        className="edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td data-label="Status">
                    {editingId === item.id ? (
                      <input
                        className="edit-checkbox"
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                    ) : (
                      <span className={`status-badge ${item.is_active ? "" : "inactive"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td data-label="Actions">
                    {editingId === item.id ? (
                      <div className="actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdate(item.id)}
                        >
                          <FaSave />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => startEdit(item)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id)}
                        >
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

export default MasterItemList;