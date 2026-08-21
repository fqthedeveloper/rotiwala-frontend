// frontend/src/pages/manager/DeliveryManagement.jsx

import React, { useState } from 'react';
import { FaTruck, FaUserCog } from 'react-icons/fa';
import DeliveryBoyList from '../../pages/manager/DeliveryBoyList';
import DeliveryAssignment from '../../pages/manager/DeliveryAssignment';
import './CSS/DeliveryBoy.css';

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('boys');

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
        {activeTab === 'assign' && <DeliveryAssignment />}
      </div>
    </div>
  );
};

export default DeliveryManagement;