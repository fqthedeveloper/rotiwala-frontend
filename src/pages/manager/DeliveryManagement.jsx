// frontend/src/pages/manager/DeliveryManagement.jsx

import React, { useState, useEffect } from 'react';
import { FaTruck, FaUserCog, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Swal from 'sweetalert2';
import DeliveryBoyList from '../../pages/manager/DeliveryBoyList';
import DeliveryAssignment from '../../pages/manager/DeliveryAssignment';
import { updateDeliveryAssignmentMode, getShopById } from '../../service/shopService';
import './CSS/DeliveryBoy.css';

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('boys');
  const [autoAssign, setAutoAssign] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load shop settings
  useEffect(() => {
    const loadShopSettings = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        
        let shop = null;
        if (user.role === 'manager' && user.shop_id) {
          shop = await getShopById(user.shop_id);
          setShopId(user.shop_id);
        } else if (user.role === 'super_admin') {
          // Super admin can select a shop or just default
          // You can add a shop selector here if needed
          setLoading(false);
          return;
        }

        if (shop) {
          setAutoAssign(shop.delivery_assignment_mode === 'auto');
        }
      } catch (error) {
        console.error('Failed to load shop settings', error);
      } finally {
        setLoading(false);
      }
    };

    loadShopSettings();
  }, []);

  const handleToggleAutoAssign = async () => {
    if (!shopId) {
      Swal.fire('Error', 'Shop ID not found. Please contact admin.', 'error');
      return;
    }
    const newMode = autoAssign ? 'manual' : 'auto';
    try {
      await updateDeliveryAssignmentMode(shopId, newMode);
      setAutoAssign(!autoAssign);
      Swal.fire(
        'Success',
        `Auto-assignment ${newMode === 'auto' ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      Swal.fire('Error', 'Failed to update assignment mode', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-management">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
          <FaTruck size={24} className="text-warning" />
        </div>
        <div>
          <h2 className="fw-bold mb-0">Delivery Management</h2>
          <p className="text-muted mb-0">Manage delivery boys and assign orders</p>
        </div>
      </div>

      {/* 🔥 Auto-Assignment Toggle */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h6 className="mb-0">
              <FaTruck className="me-2" />
              Automatic Assignment
            </h6>
            <small className="text-muted">
              When enabled, ready orders will be automatically assigned to the best available delivery boy.
            </small>
          </div>
          <button
            className={`btn ${autoAssign ? 'btn-success' : 'btn-secondary'} d-flex align-items-center gap-2`}
            onClick={handleToggleAutoAssign}
          >
            {autoAssign ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
            {autoAssign ? 'Auto-Assign ON' : 'Auto-Assign OFF'}
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'boys' ? 'active' : ''}`}
            onClick={() => setActiveTab('boys')}
          >
            <FaUserCog className="me-2" /> Delivery Boys
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            <FaTruck className="me-2" /> Assign Orders
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'boys' && <DeliveryBoyList />}
        {activeTab === 'assign' && <DeliveryAssignment autoAssignEnabled={autoAssign} />}
      </div>
    </div>
  );
};

export default DeliveryManagement;