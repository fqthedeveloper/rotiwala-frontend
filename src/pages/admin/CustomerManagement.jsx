// src/pages/admin/Customers/CustomerManagement.js
import React, { useState, useEffect, useCallback } from "react";
import { useLoading } from "../../context/LoadingContext";
import { getCustomers, toggleBlockCustomer, createFlag, deleteFlag } from "../../service/customerService";
import "./CustomerManagement.css"; // custom styles (optional, similar to analytics)

const CustomerManagement = () => {
  const { showLoading, hideLoading } = useLoading();

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [filterFlagged, setFilterFlagged] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFlagReason, setNewFlagReason] = useState("");

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: searchTerm || undefined,
        is_active: filterActive || undefined,
        is_flagged: filterFlagged || undefined,
      };
      const res = await getCustomers(params);
      setCustomers(res.data.results || res.data);
      setPagination(prev => ({
        ...prev,
        total: res.data.count || res.data.length,
      }));
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, filterActive, filterFlagged]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleToggleBlock = async (customerId, currentActive) => {
    if (window.confirm(`Are you sure you want to ${currentActive ? 'block' : 'unblock'} this user?`)) {
      try {
        await toggleBlockCustomer(customerId, !currentActive);
        fetchCustomers(); // refresh list
      } catch (error) {
        console.error("Failed to toggle block", error);
      }
    }
  };

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
    setNewFlagReason("");
  };

  const handleAddFlag = async () => {
    if (!newFlagReason.trim()) return;
    try {
      await createFlag(selectedCustomer.id, newFlagReason);
      // Refresh customer details - we can re-fetch the list to update flags
      fetchCustomers();
      // Update selected customer flags locally (optional)
      const updated = await getCustomer(selectedCustomer.id);
      setSelectedCustomer(updated.data);
      setNewFlagReason("");
    } catch (error) {
      console.error("Failed to add flag", error);
    }
  };

  const handleRemoveFlag = async (flagId) => {
    if (window.confirm("Remove this flag?")) {
      try {
        await deleteFlag(selectedCustomer.id, flagId);
        fetchCustomers();
        const updated = await getCustomer(selectedCustomer.id);
        setSelectedCustomer(updated.data);
      } catch (error) {
        console.error("Failed to remove flag", error);
      }
    }
  };

  // Render
  return (
    <div className="customer-management-wrapper">
      <div className="container-fluid">
        <h1 className="display-6 fw-bold mb-4">👥 Customer Management</h1>

        {/* Filters */}
        <div className="glass-card p-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>
            <div className="col-md-3">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Blocked</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                value={filterFlagged}
                onChange={(e) => setFilterFlagged(e.target.value)}
                className="form-select"
              >
                <option value="">All Flags</option>
                <option value="true">Flagged</option>
                <option value="false">Not Flagged</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <button className="btn btn-outline-secondary" onClick={() => { setSearchTerm(""); setFilterActive(""); setFilterFlagged(""); setPagination(prev => ({ ...prev, page: 1 })); }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Trust Score</th>
                  <th>Orders</th>
                  <th>Flags</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center py-4">Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-4">No customers found.</td></tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td>{(pagination.page - 1) * pagination.pageSize + index + 1}</td>
                      <td>{customer.full_name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email || '-'}</td>
                      <td>
                        <span className={`badge ${customer.trust_score >= 70 ? 'bg-success' : customer.trust_score >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                          {customer.trust_score}
                        </span>
                      </td>
                      <td>{customer.total_orders}</td>
                      <td>
                        {customer.is_flagged ? (
                          <span className="badge bg-danger">{customer.flag_count}</span>
                        ) : (
                          <span className="badge bg-secondary">0</span>
                        )}
                      </td>
                      <td>
                        {customer.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Blocked</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openModal(customer)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className={`btn btn-sm ${customer.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleBlock(customer.id, customer.is_active)}
                        >
                          {customer.is_active ? <i className="bi bi-lock"></i> : <i className="bi bi-unlock"></i>}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted small">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
              </div>
              <div>
                <button
                  className="page-btn me-2"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  className="page-btn"
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for customer details & flag management */}
      {modalOpen && selectedCustomer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6"><strong>Name:</strong> {selectedCustomer.full_name}</div>
                  <div className="col-md-6"><strong>Phone:</strong> {selectedCustomer.phone}</div>
                  <div className="col-md-6"><strong>Email:</strong> {selectedCustomer.email || '-'}</div>
                  <div className="col-md-6"><strong>Trust Score:</strong> {selectedCustomer.trust_score}</div>
                  <div className="col-md-6"><strong>Total Orders:</strong> {selectedCustomer.total_orders}</div>
                  <div className="col-md-6"><strong>Completed:</strong> {selectedCustomer.total_completed_orders}</div>
                  <div className="col-md-6"><strong>Cancelled:</strong> {selectedCustomer.total_cancelled_orders}</div>
                  <div className="col-md-6"><strong>Rejected:</strong> {selectedCustomer.total_rejected_orders}</div>
                  <div className="col-md-6"><strong>Status:</strong> {selectedCustomer.is_active ? 'Active' : 'Blocked'}</div>
                </div>

                <hr />
                <h6>Flags</h6>
                {selectedCustomer.flags && selectedCustomer.flags.length > 0 ? (
                  <ul className="list-group mb-3">
                    {selectedCustomer.flags.map(flag => (
                      <li key={flag.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div>{flag.reason}</div>
                          <small className="text-muted">By {flag.flagged_by_name} on {new Date(flag.created_at).toLocaleDateString()}</small>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRemoveFlag(flag.id)}>
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No flags.</p>
                )}

                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Reason for flag..."
                    value={newFlagReason}
                    onChange={(e) => setNewFlagReason(e.target.value)}
                  />
                  <button className="btn btn-outline-primary" onClick={handleAddFlag} disabled={!newFlagReason.trim()}>
                    Add Flag
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;