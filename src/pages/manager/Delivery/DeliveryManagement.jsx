// frontend/src/pages/manager/DeliveryManagement.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTruck, FaUserCog, FaToggleOn, FaToggleOff, FaMoneyCheckAlt, FaStore } from 'react-icons/fa';
import { MdQrCodeScanner } from 'react-icons/md';
import Swal from 'sweetalert2';
import DeliveryBoyList from './DeliveryBoyList';
import DeliveryAssignment from './DeliveryAssignment';
import PaymentProofs from './PaymentProofs';
import UPISettings from './UPISettings';
import { updateDeliveryAssignmentMode, getShopById, getShops } from '../../../service/shopService';
import '../CSS/DeliveryBoy.css';

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('boys');

  const [autoAssign, setAutoAssign] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  const isAdmin = userRole === 'super_admin' || userRole === 'admin' || userRole === 'staff_admin';

  // Load shop settings & list of shops
  useEffect(() => {
    const loadShopSettings = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        const user = userStr ? JSON.parse(userStr) : {};
        const currentRole = role || user.role || '';
        setUserRole(currentRole);

        const adminUser = currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'staff_admin';

        if (adminUser) {
          const allShops = await getShops();
          const shopList = Array.isArray(allShops) ? allShops : (allShops?.results || []);
          setShops(shopList);

          if (shopList.length > 0) {
            const storedShopId = localStorage.getItem('selected_shop');
            const targetShop =
              shopList.find((s) => String(s.id) === String(storedShopId)) || shopList[0];
            setShopId(targetShop.id);
            setAutoAssign(targetShop.delivery_assignment_mode === 'auto');
          }
        } else {
          const directShopId = user.shop_id || user.shop?.id || user.shop;
          if (directShopId) {
            setShopId(directShopId);
            const shop = await getShopById(directShopId);
            if (shop) {
              setShops([shop]);
              setAutoAssign(shop.delivery_assignment_mode === 'auto');
            }
          } else {
            // Fallback: load shops
            const allShops = await getShops();
            const shopList = Array.isArray(allShops) ? allShops : (allShops?.results || []);
            setShops(shopList);
            if (shopList.length > 0) {
              setShopId(shopList[0].id);
              setAutoAssign(shopList[0].delivery_assignment_mode === 'auto');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load shop settings', error);
      } finally {
        setLoading(false);
      }
    };

    loadShopSettings();
  }, []);

  const handleSelectShop = async (newShopId) => {
    const numericId = Number(newShopId);
    setShopId(numericId);
    localStorage.setItem('selected_shop', numericId);

    const found = shops.find((s) => s.id === numericId);
    if (found) {
      setAutoAssign(found.delivery_assignment_mode === 'auto');
    } else {
      try {
        const fresh = await getShopById(numericId);
        if (fresh) {
          setAutoAssign(fresh.delivery_assignment_mode === 'auto');
        }
      } catch (e) {
        console.error('Failed to switch shop:', e);
      }
    }
  };

  const handleToggleAutoAssign = async () => {
    const effectiveShopId = shopId || (shops.length > 0 ? shops[0].id : null);
    if (!effectiveShopId) {
      Swal.fire('Error', 'Please select or create a shop first to configure auto-assignment.', 'warning');
      return;
    }

    const newMode = autoAssign ? 'manual' : 'auto';
    const targetShop = shops.find((s) => s.id === effectiveShopId);
    const shopName = targetShop?.name ? ` for ${targetShop.name}` : '';

    try {
      await updateDeliveryAssignmentMode(effectiveShopId, newMode);
      setAutoAssign(!autoAssign);
      setShops((prev) =>
        prev.map((s) => (s.id === effectiveShopId ? { ...s, delivery_assignment_mode: newMode } : s))
      );
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: `Auto-assignment ${newMode === 'auto' ? 'enabled' : 'disabled'}${shopName}`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Failed to update assignment mode:', error);
      Swal.fire('Error', 'Failed to update assignment mode', 'error');
    }
  };

  const currentShop = shops.find((s) => s.id === shopId) || shops[0];

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
      <div className="dm-header d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-10 p-2 rounded-circle icon-wrapper">
            <FaTruck size={24} className="text-warning" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 dm-title">Delivery Management</h2>
            <p className="text-muted mb-0 dm-subtitle">Manage delivery boys and assign orders</p>
          </div>
        </div>

        {/* Super Admin / Admin Shop Selector Dropdown */}
        {isAdmin && shops.length > 0 && (
          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm border ms-auto">
            <FaStore className="text-warning" />
            <span className="fw-bold text-dark small" style={{ whiteSpace: 'nowrap' }}>
              Select Shop:
            </span>
            <select
              className="form-select form-select-sm fw-bold text-dark"
              style={{ minWidth: '190px', borderColor: '#f59e0b', cursor: 'pointer' }}
              value={shopId || ''}
              onChange={(e) => handleSelectShop(e.target.value)}
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shop_code || `#${s.id}`})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Auto-Assignment Toggle Card */}
      <div className="card dm-card p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="dm-auto-info">
            <h6 className="mb-1 d-flex align-items-center gap-2">
              <FaTruck className="text-warning" />
              <span>Automatic Assignment</span>
              {currentShop && (
                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-1 small ms-1">
                  {currentShop.name}
                </span>
              )}
            </h6>
            <small className="text-muted d-block">
              When enabled, ready orders {currentShop ? `for ${currentShop.name}` : ''} will be automatically assigned to the best available delivery boy.
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
            {activeTab === 'boys' && (
              <DeliveryBoyList shopId={shopId} shops={shops} isSuperAdmin={isAdmin} />
            )}
            {activeTab === 'assign' && (
              <DeliveryAssignment autoAssignEnabled={autoAssign} shopId={shopId} />
            )}
            {activeTab === 'proofs' && <PaymentProofs shopId={shopId} />}
            {activeTab === 'upi' && <UPISettings initialShopId={shopId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryManagement;