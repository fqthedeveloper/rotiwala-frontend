import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
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
  updateExpense,   // ✅ added – implement in expenseServices
  updateMaintenance, // ✅ added – implement in expenseServices
} from "../../../service/expenseServices";

const SuperAdminExpenses = () => {
  const navigate = useNavigate(); // ✅

  // ---------- State ----------
  const [expenses, setExpenses] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [categories, setCategories] = useState([]);
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
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchMaintenance();
    fetchReport();
  }, [fetchCategories, fetchExpenses, fetchMaintenance, fetchReport]);

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
      {/* Styles (same as before – keep your styles) */}
      <style>{`/* ... your existing styles ... */`}</style>

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
              ₹{Number(reportData.total_expenses).toFixed(2)}
            </div>
          </div>
          {reportData.by_category && reportData.by_category.length > 0 && (
            <div className="stat-card">
              <div className="label">Top Category</div>
              <div className="value" style={{ fontSize: "18px" }}>
                {reportData.by_category[0].category__name} <br />
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                  ₹{Number(reportData.by_category[0].total).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <div className="stat-card">
            <div className="label">Maintenance Count</div>
            <div className="value">{maintenanceList.length}</div>
          </div>
        </div>
      )}

      {/* ---------- Filter Bar ---------- */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
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
          className="btn"
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
              <th>Date</th>
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
                  <td>{format(new Date(exp.expense_date), "dd/MM/yy")}</td>
                  <td>{exp.shop?.name || "N/A"}</td>
                  <td>{exp.category?.name || "N/A"}</td>
                  <td>₹{Number(exp.total_amount).toFixed(2)}</td>
                  <td>{exp.notes || "-"}</td>
                  <td>
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
      <div style={{ marginTop: "40px" }}>
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
                  <td>{item.title}</td>
                  <td>{item.shop?.name || "N/A"}</td>
                  <td>₹{Number(item.amount).toFixed(2)}</td>
                  <td>{format(new Date(item.maintenance_date), "dd/MM/yy")}</td>
                  <td>
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