// src/pages/manager/Expenses/ManagerExpenses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses, deleteExpense, getExpenseCategories, getMaintenanceList } from '../../../service/expenseServices';
import { useAuth } from '../../../context/AuthContext';
import { useLoading } from '../../../context/LoadingContext';
import { toast } from 'react-toastify';

const ManagerExpenses = () => {
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    expense_date: '',
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    page_size: 20,
  });

  const managerShopId = user?.shop_id || user?.shop?.id || user?.shop || "";

  const fetchData = async (page = 1) => {
    showLoading('Loading expenses...');
    try {
      const params = {
        ...filters,
        shop_id: managerShopId || undefined,
        page,
        page_size: pagination.page_size,
      };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      const [expRes, catRes] = await Promise.all([
        getExpenses(params),
        getExpenseCategories(),
      ]);
      setExpenses(expRes.results || []);
      setPagination({
        count: expRes.count || 0,
        next: expRes.next,
        previous: expRes.previous,
        page,
        page_size: pagination.page_size,
      });
      setCategories(catRes);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load expenses');
    } finally {
      hideLoading();
    }
  };

  const fetchMaintenance = async () => {
    if (!managerShopId) return;
    try {
      const params = {
        shop_id: managerShopId,
        page: 1,
        page_size: 20,
      };
      const response = await getMaintenanceList(params);
      setMaintenanceList(response.results || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load maintenance records');
    }
  };

  useEffect(() => {
    fetchData();
    fetchMaintenance();
    // eslint-disable-next-line
  }, [filters, managerShopId]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      fetchData(pagination.page);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  return (
    <div className="manager-expenses">
      <style>{`
        .manager-expenses {
          padding: 24px;
          max-width: 1180px;
          margin: 0 auto;
          min-height: 100vh;
          color: #111827;
        }

        .manager-expenses .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .manager-expenses .page-header h1 {
          font-size: 2rem;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .manager-expenses .page-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-end;
          width: 100%;
          max-width: 520px;
        }

        .manager-expenses .filters-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          background: #ffffff;
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          margin-bottom: 22px;
        }

        .manager-expenses .filters-bar select,
        .manager-expenses .filters-bar input,
        .manager-expenses .filters-bar button {
          min-width: 160px;
          flex: 1 1 180px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          padding: 12px 14px;
          font-size: 0.95rem;
          background: #f9fafb;
          color: #111827;
          transition: all 0.2s ease;
        }

        .manager-expenses .filters-bar select:focus,
        .manager-expenses .filters-bar input:focus,
        .manager-expenses .filters-bar button:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .manager-expenses .filters-bar button {
          max-width: 140px;
          background: #111827;
          color: #ffffff;
          border: none;
          cursor: pointer;
        }

        .manager-expenses .table-responsive {
          overflow-x: auto;
          border-radius: 18px;
          box-shadow: 0 25px 40px rgba(15, 23, 42, 0.08);
          background: #ffffff;
        }

        .manager-expenses .table-responsive table {
          width: 100%;
          min-width: 660px;
          border-collapse: collapse;
        }

        .manager-expenses .table-responsive th,
        .manager-expenses .table-responsive td {
          padding: 16px 14px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .manager-expenses .table-responsive thead {
          background: #f8fafc;
        }

        .manager-expenses .table-responsive tr:hover {
          background: #f8fafc;
        }

        .manager-expenses .table-responsive .btn-sm {
          min-width: 90px;
          font-size: 0.85rem;
          padding: 0.6rem 0.9rem;
        }

        .manager-expenses .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 18px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: rgba(248, 250, 252, 0.9);
          border-radius: 14px;
        }

        .manager-expenses .pagination button {
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          background: #111827;
          color: #ffffff;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .manager-expenses .pagination button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #1f2937;
        }

        .manager-expenses .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .manager-expenses .page-header {
            justify-content: space-between;
          }

          .manager-expenses .page-actions {
            justify-content: flex-start;
            width: 100%;
          }
        }

        @media (max-width: 900px) {
          .manager-expenses .filters-bar select,
          .manager-expenses .filters-bar input,
          .manager-expenses .filters-bar button {
            width: 100%;
            min-width: auto;
          }
        }

        @media (max-width: 780px) {
          .manager-expenses {
            padding: 20px 18px;
          }

          .manager-expenses .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .manager-expenses .page-actions {
            justify-content: stretch;
            width: 100%;
          }

          .manager-expenses .page-actions .btn {
            width: 100%;
            justify-content: center;
          }

          .manager-expenses .filters-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 14px;
          }

          .manager-expenses .filters-bar select,
          .manager-expenses .filters-bar input,
          .manager-expenses .filters-bar button {
            width: 100%;
            min-width: 0;
          }

          .manager-expenses .filters-bar button {
            max-width: 100%;
          }

          .manager-expenses .table-responsive table {
            min-width: 100%;
          }
        }

        @media (max-width: 620px) {
          .manager-expenses {
            padding: 16px;
          }

          .manager-expenses .page-header h1 {
            font-size: 1.6rem;
          }

          .manager-expenses .page-actions {
            gap: 10px;
          }

          .manager-expenses .filters-bar {
            padding: 14px;
          }

          .manager-expenses .table-responsive {
            overflow: hidden;
          }

          .manager-expenses .table-responsive table {
            display: block;
            width: 100%;
            border: none;
          }

          .manager-expenses .table-responsive thead {
            display: none;
          }

          .manager-expenses .table-responsive tr {
            display: block;
            margin-bottom: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 14px;
            background: #ffffff;
          }

          .manager-expenses .table-responsive td {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border: none;
            white-space: normal;
            text-align: left;
          }

          .manager-expenses .table-responsive td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #334155;
            flex: 0 0 35%;
            padding-right: 12px;
          }

          .manager-expenses .table-responsive td:last-child {
            padding-top: 12px;
          }

          .manager-expenses .pagination {
            flex-direction: column;
            align-items: stretch;
          }

          .manager-expenses .pagination button {
            width: 100%;
          }

          .manager-expenses .maintenance-section {
            margin-top: 24px;
          }

          .manager-expenses .maintenance-section .section-header {
            padding-bottom: 10px;
          }
        }
      `}</style>
      <div className="page-header">
        <h1>My Shop Expenses</h1>
        <div className="page-actions">
          <Link to="/manager/expenses/add" className="btn btn-primary">
            Add Expense
          </Link>
          <Link to="/manager/expenses/maintenance/add" className="btn btn-secondary">
            Add Maintenance
          </Link>
        </div>
      </div>

      {/* Filters (no shop filter) */}
      <div className="filters-bar">
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="date"
          name="expense_date"
          value={filters.expense_date}
          onChange={handleFilterChange}
        />
        <button className="btn btn-secondary" onClick={() => setFilters({ category: '', expense_date: '' })}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No expenses found</td></tr>
            ) : (
              expenses.map(exp => (
                <tr key={exp.id}>
                  <td data-label="ID">{exp.id}</td>
                  <td data-label="Category">{exp.category.name}</td>
                  <td data-label="Date">{exp.expense_date}</td>
                  <td data-label="Total">₹{exp.total_amount}</td>
                  <td data-label="Actions">
                    <Link to={`/manager/expenses/edit/${exp.id}`} className="btn btn-sm btn-primary">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Maintenance section */}
      <div className="maintenance-section">
        <div className="section-header">
          <h2>My Shop Maintenance</h2>
          <p>Records for maintenance work linked to your assigned shop.</p>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                maintenanceList.map((item) => (
                  <tr key={item.id}>
                    <td data-label="ID">{item.id}</td>
                    <td data-label="Title">{item.title || item.description || '—'}</td>
                    <td data-label="Date">{item.maintenance_date}</td>
                    <td data-label="Amount">₹{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.count > pagination.page_size && (
        <div className="pagination">
          <button
            disabled={!pagination.previous}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {Math.ceil(pagination.count / pagination.page_size)}</span>
          <button
            disabled={!pagination.next}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerExpenses;