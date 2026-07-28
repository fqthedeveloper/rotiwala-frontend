// src/pages/admin/CustomerManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../service/api';
import { toast } from 'react-toastify';
import { Search, User, Flag, X, Check, AlertTriangle } from 'lucide-react';
import './CSS/CustomerManagement.css';

const CustomerManagement = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); // full detail object
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // ID for flag modal
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterActive, setFilterActive] = useState(null);
  const [filterFlagged, setFilterFlagged] = useState(null);

  const isAdmin = user?.role === 'super_admin';
  const isManager = user?.role === 'manager';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterActive !== null) params.is_active = filterActive;
      if (filterFlagged !== null) params.is_flagged = filterFlagged;

      const response = await api.get('/accounts/customers/', { params });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, filterActive, filterFlagged]);

  const viewCustomer = async (customerId) => {
    try {
      const response = await api.get(`/accounts/customers/${customerId}/`);
      setSelectedCustomer(response.data);
      // Also keep the ID for consistency
      setSelectedCustomerId(customerId);
    } catch (error) {
      toast.error('Failed to load customer details');
    }
  };

  const toggleBlock = async (customerId, currentStatus) => {
    if (!isAdmin) {
      toast.error('Only admin can block/unblock');
      return;
    }
    try {
      await api.patch(`/accounts/customers/${customerId}/toggle-block/`, {
        is_active: !currentStatus,
      });
      toast.success(`Customer ${currentStatus ? 'blocked' : 'unblocked'}`);
      fetchCustomers();
      if (selectedCustomer?.user_id === customerId || selectedCustomer?.id === customerId) {
        setSelectedCustomer((prev) => ({
          ...prev,
          is_active: !currentStatus,
        }));
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const openFlagModal = (customer) => {
    // customer is the list item (has 'id') or detail object (has 'user_id')
    const id = customer.id || customer.user_id;
    if (!id) {
      toast.error('Customer ID not found');
      return;
    }
    setSelectedCustomerId(id);
    // Optionally fetch details to show customer name
    viewCustomer(id);
    setFlagReason('');
    setShowFlagModal(true);
  };

  const submitFlag = async () => {
    if (!flagReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    const customerId = selectedCustomerId || selectedCustomer?.id || selectedCustomer?.user_id;
    if (!customerId) {
      toast.error('Customer ID not found');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/accounts/customers/${customerId}/flag/`, {
        reason: flagReason,
      });
      toast.success('Flag added successfully');
      setShowFlagModal(false);
      fetchCustomers();
      // Refresh details if open
      if (selectedCustomer) {
        viewCustomer(customerId);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add flag');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFlag = async (flagId) => {
    if (!window.confirm('Are you sure you want to remove this flag?')) return;
    const customerId = selectedCustomer?.user_id || selectedCustomer?.id;
    if (!customerId) {
      toast.error('Customer ID not found');
      return;
    }
    try {
      await api.delete(`/accounts/customers/${customerId}/flag/${flagId}/`);
      toast.success('Flag removed');
      viewCustomer(customerId);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to remove flag');
    }
  };

  const renderFlags = () => {
    if (!selectedCustomer?.flags || selectedCustomer.flags.length === 0) {
      return <p className="text-gray-500 text-sm">No flags</p>;
    }
    return (
      <ul className="space-y-2">
        {selectedCustomer.flags.map((flag) => {
          const canDelete = isAdmin || (isManager && flag.flagged_by === user.id);
          return (
            <li key={flag.id} className="flex justify-between items-start bg-red-50 p-2 rounded border border-red-200">
              <div>
                <p className="text-sm font-medium">{flag.reason}</p>
                <p className="text-xs text-gray-500">
                  Flagged by: {flag.flagged_by_name || 'System'} on{' '}
                  {new Date(flag.created_at).toLocaleDateString()}
                </p>
              </div>
              {canDelete && (
                <button onClick={() => deleteFlag(flag.id)} className="text-red-600 hover:text-red-800">
                  <X size={16} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading && customers.length === 0) {
    return <div className="text-center py-10">Loading customers...</div>;
  }

  return (
    <div className="customer-management-page p-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          {(isAdmin || isManager) && (
            <p className="page-info">
              {isAdmin ? 'Admin view' : 'Manager view - your shop customers'}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-input">
          <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-regular"
          />
        </div>
        <select
          value={filterActive === null ? '' : filterActive.toString()}
          onChange={(e) => {
            const val = e.target.value;
            setFilterActive(val === '' ? null : val === 'true');
          }}
          className="filter-select input-regular"
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Blocked</option>
        </select>
        <select
          value={filterFlagged === null ? '' : filterFlagged.toString()}
          onChange={(e) => {
            const val = e.target.value;
            setFilterFlagged(val === '' ? null : val === 'true');
          }}
          className="filter-select input-regular"
        >
          <option value="">All flags</option>
          <option value="true">Flagged</option>
          <option value="false">Not flagged</option>
        </select>
        <button
          onClick={fetchCustomers}
          className="refresh-button btn btn-primary"
        >
          Refresh
        </button>
      </div>

      {/* Customer Table */}
      <div className="table-container responsive-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((cust) => (
              <tr key={cust.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{cust.full_name}</div>
                      <div className="text-sm text-gray-500">@{cust.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{cust.phone}</div>
                  <div className="text-sm text-gray-500">{cust.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cust.trust_score >= 80 ? 'bg-green-100 text-green-800' :
                      cust.trust_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {cust.trust_score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.total_orders}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cust.is_flagged ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <Flag size={14} className="mr-1" /> {cust.flag_count}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cust.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cust.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => viewCustomer(cust.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Details
                  </button>
                  {(isAdmin || isManager) && (
                    <button
                      onClick={() => openFlagModal(cust)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Flag
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => toggleBlock(cust.id, cust.is_active)}
                      className={`ml-3 ${cust.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {cust.is_active ? 'Block' : 'Unblock'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-panel detail-modal-panel smooth-transition">
            <div className="modal-header">
              <div>
                <h2>Customer Details</h2>
                <p className="modal-subtitle">Review customer info and flags</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="modal-close-button">
                <X size={24} />
              </button>
            </div>

            <div className="customer-detail-grid mb-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{selectedCustomer.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{selectedCustomer.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedCustomer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="font-medium">{selectedCustomer.trust_score ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="font-medium">{selectedCustomer.total_orders ?? '0'}</p>
              </div>
              <div className="col-span-full">
                <p className="text-sm text-gray-500">Completed / Cancelled / Rejected</p>
                <p className="font-medium">
                  {selectedCustomer.total_completed_orders ?? 0} / {selectedCustomer.total_cancelled_orders ?? 0} / {selectedCustomer.total_rejected_orders ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedCustomer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedCustomer.is_active ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>

            {/* Flags Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Flags</h3>
                  <p className="text-sm text-gray-500">Flag history for this customer</p>
                </div>
                {(isAdmin || isManager) && (
                  <button
                    onClick={() => openFlagModal(selectedCustomer)}
                    className="btn btn-primary"
                  >
                    + Add Flag
                  </button>
                )}
              </div>
              <div className="flag-list">{renderFlags()}</div>
            </div>

            {isAdmin && (
              <div className="modal-actions">
                <button
                  onClick={() => toggleBlock(selectedCustomer.user_id || selectedCustomer.id, selectedCustomer.is_active)}
                  className={`modal-primary-button ${selectedCustomer.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {selectedCustomer.is_active ? 'Block Customer' : 'Unblock Customer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="modal-overlay">
          <div className="modal-panel flag-modal-panel smooth-transition">
            <div className="modal-header">
              <div>
                <h3>Add Flag</h3>
                <p className="modal-subtitle">Flag this customer with a reason</p>
              </div>
              <button onClick={() => setShowFlagModal(false)} className="modal-close-button">
                <X size={24} />
              </button>
            </div>
            <p className="modal-subtitle mb-4">
              Customer: {selectedCustomer?.full_name || `ID: ${selectedCustomerId}`}
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Reason for flagging..."
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowFlagModal(false)}
                className="modal-secondary-button"
              >
                Cancel
              </button>
              <button
                onClick={submitFlag}
                disabled={submitting}
                className="modal-primary-button"
              >
                {submitting ? 'Submitting...' : 'Add Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;