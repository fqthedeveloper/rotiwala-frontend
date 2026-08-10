// frontend/src/pages/admin/Expenses/RawMaterialList.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { format } from "date-fns";
import {
  getRawMaterialExpenses,
  deleteRawMaterialExpense,
} from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";
import Swal from "sweetalert2";

const RawMaterialList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shops, setShops] = useState([]);
  const [filters, setFilters] = useState({
    shop: "",
    start_date: "",
    end_date: "",
    search: "",
  });

  const basePath = isManager ? "/manager" : "/admin";

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] === null || params[k] === undefined)
          delete params[k];
      });
      const data = await getRawMaterialExpenses(params);
      setExpenses(data.results || data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load raw material expenses.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isManager) {
      getShops().then(setShops).catch(console.error);
    }
    fetchExpenses();
  }, [fetchExpenses, isManager]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await deleteRawMaterialExpense(id);
        setExpenses(expenses.filter((e) => e.id !== id));
        Swal.fire("Deleted!", "Record has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete record.", "error");
      }
    }
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? shop.name : "N/A";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "dd/MM/yyyy");
  };

  return (
    <div className="raw-material-list">
      <style>{`
        .raw-material-list {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          color: #111827;
        }
        .page-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
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
        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }
        .btn-clear {
          background: #fff;
          color: #0f172a;
          border: 1px solid rgba(15,23,42,0.12);
        }
        .btn-clear:hover {
          background: #e2e8f0;
        }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
          margin-bottom: 24px;
          align-items: center;
        }
        .filter-bar input,
        .filter-bar select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.12);
          background: #f8fafc;
          font-size: 14px;
          outline: none;
        }
        .filter-bar input:focus,
        .filter-bar select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .table-wrapper {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
        }
        th, td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15,23,42,0.06);
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
        }
        .unit-badge {
          background: #e2e8f0;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .raw-material-list { padding: 16px; }
          .filter-bar { flex-direction: column; align-items: stretch; }
          .page-header { flex-direction: column; align-items: stretch; }
          .btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="page-header">
        <div className="left">
          <button className="back-btn" onClick={() => navigate(`${basePath}/expenses`)}>
            <FaArrowLeft />
          </button>
          <h1>📦 Raw Material Expenses</h1>
        </div>
        <button
          className="btn btn-success"
          onClick={() => navigate(`${basePath}/expenses/raw-materials/add`)}
        >
          <FaPlus /> Add Raw Material
        </button>
      </div>

      <div className="filter-bar">
        {!isManager && (
          <select
            value={filters.shop}
            onChange={(e) => setFilters({ ...filters, shop: e.target.value })}
          >
            <option value="">All Shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          placeholder="Start Date"
        />
        <span>to</span>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          placeholder="End Date"
        />
        <input
          type="text"
          placeholder="Search item/vendor..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ minWidth: "200px" }}
        />
        <button
          className="btn btn-clear"
          onClick={() => setFilters({ shop: "", start_date: "", end_date: "", search: "" })}
        >
          <FaTimes /> Clear
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shop</th>
              <th>Item</th>
              <th>Vendor</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Amount (₹)</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: 40 }}>Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No raw material expenses found.</td></tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{formatDate(exp.expense_date)}</td>
                  <td>{exp.shop_name || getShopName(exp.shop)}</td>
                  <td>{exp.item_name || exp.custom_item_name || "N/A"}</td>
                  <td>{exp.vendor_name || "N/A"}</td>
                  <td>{parseFloat(exp.quantity).toFixed(2)}</td>
                  <td><span className="unit-badge">{exp.unit_display || exp.unit}</span></td>
                  <td>₹{parseFloat(exp.amount).toFixed(2)}</td>
                  <td>{exp.note || "-"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`${basePath}/expenses/raw-materials/edit/${exp.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(exp.id)}
                      >
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

export default RawMaterialList;