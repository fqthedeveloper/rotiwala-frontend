// frontend/src/pages/admin/Expenses/AdminExpenses.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { format } from "date-fns";
import {
  getExpenseCategories,
  getExpenses,
  deleteExpense,
  getExpenseReport,
  getMaintenanceList,
  deleteMaintenance,
} from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";

const SuperAdminExpenses = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    shop: "",
    start_date: "",
    end_date: "",
    search: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // ---------- Fetch Data ----------
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize, ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] === null || params[k] === undefined)
          delete params[k];
      });
      const response = await getExpenses(params);
      setExpenses(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const fetchMaintenance = useCallback(async () => {
    try {
      const response = await getMaintenanceList({ page: 1, page_size: 20 });
      setMaintenanceList(response.results || []);
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    }
  }, []);

  const fetchShops = useCallback(async () => {
    try {
      const data = await getShops();
      setShops(data || []);
    } catch (err) {
      console.error("Error fetching shops:", err);
    }
  }, []);

  const shopMap = useMemo(
    () => shops.reduce((map, shop) => ({ ...map, [shop.id]: shop.name }), {}),
    [shops]
  );

  const getShopName = (record) => {
    if (!record) return "N/A";
    if (typeof record === "object" && record?.name) return record.name;
    return shopMap[record] || "N/A";
  };

  const totalExpenseAmount = useMemo(() => {
    const apiTotal = reportData?.total_expenses;
    if (apiTotal !== null && apiTotal !== undefined) {
      return Number(apiTotal);
    }
    return expenses.reduce((sum, expense) => sum + Number(expense.total_amount || 0), 0);
  }, [reportData, expenses]);

  const isSameDay = (dateString) => {
    if (!dateString) return false;
    const recordDate = new Date(dateString);
    const today = new Date();
    return (
      recordDate.getFullYear() === today.getFullYear() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getDate() === today.getDate()
    );
  };

  // ✅ FIX: use entry_datetime instead of expense_date
  const todaysExpenseCount = useMemo(
    () => expenses.filter((exp) => isSameDay(exp.entry_datetime)).length,
    [expenses]
  );

  const todaysMaintenanceCount = useMemo(
    () => maintenanceList.filter((item) => isSameDay(item.maintenance_date)).length,
    [maintenanceList]
  );

  const fetchReport = useCallback(async () => {
    try {
      const data = await getExpenseReport({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        shop_id: filters.shop || undefined,
      });
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setReportData(null);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchMaintenance();
    fetchShops();
    fetchReport();
  }, [fetchCategories, fetchExpenses, fetchMaintenance, fetchReport, fetchShops]);

  // ---------- Delete Handlers ----------
  const handleDeleteExpense = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
      fetchExpenses();
      fetchReport();
    }
  };

  const handleDeleteMaintenance = async (id) => {
    if (window.confirm("Delete this maintenance record?")) {
      await deleteMaintenance(id);
      fetchMaintenance();
    }
  };

  // ---------- Render ----------
  return (
    <div className="superadmin-expenses">
      <style>{`
        .superadmin-expenses {
          padding: 24px;
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
          color: #0f172a;
        }
        .page-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .page-header h1 {
          margin: 0;
          font-size: clamp(1.9rem, 2.6vw, 2.8rem);
          letter-spacing: -0.02em;
          color: #111827;
        }
        .btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .superadmin-expenses .btn {
          min-height: 44px;
          border: none;
          border-radius: 12px;
          padding: 0 16px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .superadmin-expenses .btn:hover {
          transform: translateY(-1px);
        }
        .superadmin-expenses .btn-success {
          background: #14b8a6;
          box-shadow: 0 16px 30px rgba(20, 184, 166, 0.18);
        }
        .superadmin-expenses .btn-warning {
          background: #f59e0b;
          box-shadow: 0 16px 30px rgba(245, 158, 11, 0.18);
        }
        .superadmin-expenses .btn-primary {
          background: #3b82f6;
          box-shadow: 0 16px 30px rgba(59, 130, 246, 0.18);
        }
        .superadmin-expenses .btn-danger {
          background: #ef4444;
        }
        .superadmin-expenses .btn-clear {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.12);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }
        .stat-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
        }
        .stat-card .label {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 10px;
        }
        .stat-card .value {
          color: #0f172a;
          font-size: 2rem;
          font-weight: 700;
        }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          padding: 18px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
          margin-bottom: 24px;
          align-items: center;
        }
        .filter-bar .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 220px;
          min-width: 220px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          padding: 10px 14px;
        }
        .filter-bar .filter-group svg {
          color: #64748b;
          min-width: 20px;
        }
        .filter-bar input,
        .filter-bar select,
        .filter-bar .btn-clear {
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          padding: 12px 14px;
          font-size: 0.95rem;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .filter-bar input:focus,
        .filter-bar select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }
        .filter-bar input::placeholder {
          color: #94a3b8;
        }
        .filter-bar select {
          min-width: 180px;
          flex: 1 1 170px;
        }
        .filter-bar button.btn-clear {
          flex: 0 0 auto;
        }
        .table-wrapper {
          overflow-x: auto;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
        }
        table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }
        thead {
          background: #f8fafc;
        }
        th,
        td {
          padding: 18px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          color: #334155;
        }
        th {
          font-size: 0.95rem;
          font-weight: 700;
        }
        td {
          font-size: 0.95rem;
        }
        tr:hover td {
          background: rgba(14, 165, 233, 0.05);
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          flex-wrap: wrap;
        }
        .pagination .info {
          color: #475569;
          font-size: 0.95rem;
        }
        .pagination button {
          min-width: 100px;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #0f172a;
          color: #ffffff;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        .pagination button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .pagination button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .maintenance-section {
          margin-top: 40px;
        }
        .maintenance-section h2 {
          margin-bottom: 18px;
          color: #1e293b;
        }
        .maintenance-section .table-wrapper {
          margin-top: 10px;
        }
        @media (max-width: 992px) {
          .stat-cards {
            grid-template-columns: repeat(2, minmax(180px, 1fr));
          }
          .filter-bar {
            padding: 16px;
          }
          .filter-bar .filter-group,
          .filter-bar input,
          .filter-bar select,
          .filter-bar button {
            min-width: 0;
            width: 100%;
          }
          .filter-bar .filter-group {
            flex-wrap: wrap;
          }
        }
        @media (max-width: 700px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-group {
            justify-content: flex-start;
          }
          table {
            min-width: 100%;
          }
          th,
          td {
            padding: 14px 12px;
          }
        }
        @media (max-width: 560px) {
          .page-header {
            gap: 12px;
          }
          .stat-cards {
            grid-template-columns: 1fr;
          }
          .filter-bar {
            gap: 12px;
          }
          .filter-bar .filter-group,
          .filter-bar select,
          .filter-bar input,
          .filter-bar button {
            width: 100%;
          }
          .pagination {
            flex-direction: column;
            align-items: stretch;
          }
          .pagination button {
            width: 100%;
          }
          table,
          thead,
          tbody,
          th,
          td,
          tr {
            display: block;
          }
          thead {
            display: none;
          }
          tr {
            margin-bottom: 16px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          }
          td {
            display: flex;
            justify-content: space-between;
            padding: 12px 14px;
            border: none;
          }
          td::before {
            content: attr(data-label);
            display: block;
            width: 45%;
            color: #475569;
            font-weight: 600;
          }
          td[data-label="Actions"] {
            justify-content: flex-end;
          }
        }
      `}</style>

      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1>💰 Expense Management</h1>
        <div className="btn-group">
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/expenses/add")}
          >
            <FaPlus /> Add Expense
          </button>
          <button
            className="btn btn-warning"
            onClick={() => navigate("/admin/maintenance/add")}
          >
            <FaPlus /> Add Maintenance
          </button>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      {reportData && (
        <div className="stat-cards">
          <div className="stat-card">
            <div className="label">Total Expenses</div>
            <div className="value">
              ₹{totalExpenseAmount.toFixed(2)}
            </div>
          </div>
          {reportData.by_category && reportData.by_category.length > 0 && (
            <div className="stat-card">
              <div className="label">Top Category</div>
              <div className="value" style={{ fontSize: "18px" }}>
                {reportData.by_category[0].category__name} <br />
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                  ₹{Number(reportData.by_category[0]?.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <div className="stat-card">
            <div className="label">Maintenance Count</div>
            <div className="value">{maintenanceList.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Today&apos;s Expenses</div>
            <div className="value">{todaysExpenseCount}</div>
          </div>
          <div className="stat-card">
            <div className="label">Today&apos;s Maintenances</div>
            <div className="value">{todaysMaintenanceCount}</div>
          </div>
        </div>
      )}

      {/* ---------- Filter Bar ---------- */}
      <div className="filter-bar">
        <div className="filter-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.shop}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, shop: e.target.value }))
          }
        >
          <option value="">All Shops</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, start_date: e.target.value }))
          }
        />
        <span style={{ color: "#64748b" }}>to</span>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, end_date: e.target.value }))
          }
        />
        <button
          className="btn btn-clear"
          onClick={() =>
            setFilters({
              category: "",
              shop: "",
              start_date: "",
              end_date: "",
              search: "",
            })
          }
        >
          <FaTimes /> Clear
        </button>
      </div>

      {/* ---------- Expense Table ---------- */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Shop</th>
              <th>Category</th>
              <th>Total</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  Loading...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  {/* ✅ FIX: use entry_datetime with null check */}
                  <td data-label="Date & Time">
                    {exp.entry_datetime
                      ? format(new Date(exp.entry_datetime), "dd/MM/yy HH:mm")
                      : "N/A"}
                  </td>
                  <td data-label="Shop">{getShopName(exp.shop || exp.shop_id)}</td>
                  <td data-label="Category">{exp.category?.name || "N/A"}</td>
                  <td data-label="Total">₹{Number(exp.total_amount).toFixed(2)}</td>
                  <td data-label="Notes">{exp.notes || "-"}</td>
                  <td data-label="Actions">
                    <button
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", marginRight: "6px" }}
                      onClick={() => navigate(`/admin/expenses/edit/${exp.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 10px" }}
                      onClick={() => handleDeleteExpense(exp.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Pagination ---------- */}
      <div className="pagination">
        <div className="info">
          Showing {expenses.length} of {totalCount} expenses
        </div>
        <div>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span style={{ padding: "0 12px" }}>
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>

      {/* ---------- Maintenance Section ---------- */}
      <div className="maintenance-section">
        <h2>🔧 Maintenance Expenses</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Shop</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.map((item) => (
                <tr key={item.id}>
                  <td data-label="Title">{item.title}</td>
                  <td data-label="Shop">{getShopName(item.shop || item.shop_id)}</td>
                  <td data-label="Amount">₹{Number(item.amount).toFixed(2)}</td>
                  <td data-label="Date">
                    {item.maintenance_date
                      ? format(new Date(item.maintenance_date), "dd/MM/yy")
                      : "N/A"}
                  </td>
                  <td data-label="Actions">
                    <button
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", marginRight: "6px" }}
                      onClick={() =>
                        navigate(`/admin/maintenance/edit/${item.id}`)
                      }
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 10px" }}
                      onClick={() => handleDeleteMaintenance(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminExpenses;