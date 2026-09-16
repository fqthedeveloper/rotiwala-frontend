// frontend/src/pages/manager/DeliveryManagement.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTruck, FaUserCog, FaToggleOn, FaToggleOff, FaMoneyCheckAlt } from 'react-icons/fa';
import { MdQrCodeScanner } from 'react-icons/md';
import Swal from 'sweetalert2';
import DeliveryBoyList from './DeliveryBoyList';
import DeliveryAssignment from './DeliveryAssignment';
import PaymentProofs from './PaymentProofs';
import UPISettings from './UPISettings';
import { updateDeliveryAssignmentMode, getShopById } from '../../../service/shopService';
import '../CSS/DeliveryBoy.css';

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
      {/* Header Section */}
      <div className="dm-header d-flex align-items-center gap-3 mb-4 flex-wrap">
        <div className="bg-warning bg-opacity-10 p-2 rounded-circle icon-wrapper">
          <FaTruck size={24} className="text-warning" />
        </div>
        <div className="flex-grow-1">
          <h2 className="fw-bold mb-0 dm-title">Delivery Management</h2>
          <p className="text-muted mb-0 dm-subtitle">Manage delivery boys and assign orders</p>
        </div>
      </div>

      {/* Auto-Assignment Toggle */}
      <div className="card dm-card p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="dm-auto-info">
            <h6 className="mb-1">
              <FaTruck className="me-2 text-warning" />
              Automatic Assignment
            </h6>
            <small className="text-muted d-block">
              When enabled, ready orders will be automatically assigned to the best available delivery boy.
            </small>
          </div>
          <button
            className={`btn dm-toggle-btn ${autoAssign ? 'btn-success' : 'btn-secondary'} d-flex align-items-center gap-2 flex-shrink-0`}
            onClick={handleToggleAutoAssign}
          >
            {autoAssign ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
            {autoAssign ? 'Auto-Assign ON' : 'Auto-Assign OFF'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dm-tabs-wrapper">
        <ul className="nav nav-tabs dm-tabs flex-nowrap overflow-auto" style={{ whiteSpace: 'nowrap' }}>
          <li className="nav-item">
            <button
              className={`nav-link dm-tab-link ${activeTab === 'boys' ? 'active' : ''}`}
              onClick={() => setActiveTab('boys')}
            >
              <FaUserCog className="me-2" /> Delivery Boys
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link dm-tab-link ${activeTab === 'assign' ? 'active' : ''}`}
              onClick={() => setActiveTab('assign')}
            >
              <FaTruck className="me-2" /> Assign Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link dm-tab-link ${activeTab === 'proofs' ? 'active' : ''}`}
              onClick={() => setActiveTab('proofs')}
            >
              <FaMoneyCheckAlt className="me-2" /> Payment Proofs
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link dm-tab-link ${activeTab === 'upi' ? 'active' : ''}`}
              onClick={() => setActiveTab('upi')}
            >
              <MdQrCodeScanner className="me-2" size={16} /> UPI Settings
            </button>
          </li>
        </ul>
      </div>

      <div className="tab-content dm-tab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'boys' && <DeliveryBoyList />}
            {activeTab === 'assign' && <DeliveryAssignment autoAssignEnabled={autoAssign} />}
            {activeTab === 'proofs' && <PaymentProofs />}
            {activeTab === 'upi' && <UPISettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryManagement;