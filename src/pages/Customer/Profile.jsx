// src/pages/Customer/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../service/api';
import ChangePassword from '../../components/Profile/ChangePassword';
import UpdatePhone from '../../components/Profile/UpdatePhone';
import toast from 'react-hot-toast';
import './CSS/profile.css'; // custom styles

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    // Basic client-side validation
    if (!formData.first_name.trim()) {
      const msg = 'First name is required';
      setErrorMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      const response = await api.put('/accounts/profile/', formData);
      // Update local state and context
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(updatedUser);

      const successMsg = response.data?.message || 'Profile updated successfully';
      setSuccessMessage(successMsg);
      toast.success(successMsg);

      // Clear success after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      let msg = 'Failed to update profile';
      if (error.response) {
        // Handle different error formats
        const data = error.response.data;
        if (data.message) {
          msg = data.message;
        } else if (data.error) {
          msg = data.error;
        } else if (data.errors) {
          // DRF field errors
          const fieldErrors = Object.values(data.errors).flat().join(', ');
          msg = fieldErrors || msg;
        } else if (data.detail) {
          msg = data.detail;
        }
        // If it's an object with field keys, we can also extract
        if (typeof data === 'object' && !data.message && !data.error) {
          const keys = Object.keys(data);
          if (keys.length) {
            const firstKey = keys[0];
            const firstError = data[firstKey];
            if (Array.isArray(firstError)) {
              msg = `${firstKey}: ${firstError.join(', ')}`;
            } else if (typeof firstError === 'string') {
              msg = `${firstKey}: ${firstError}`;
            }
          }
        }
      } else if (error.request) {
        msg = 'No response from server. Check your connection.';
      } else {
        msg = error.message || msg;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
          <svg width="28" height="28" fill="#e67e22" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h1 className="h3 mb-0 fw-bold text-dark">My Profile</h1>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs border-0 mb-4" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Edit Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            Change Phone
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="profile-card position-relative" style={{ minHeight: '320px' }}>
        <div className="fade-slide-in">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit}>
              {/* Global success message */}
              {successMessage && (
                <div className="alert alert-success py-2" role="alert">
                  <strong>✅ Success!</strong> {successMessage}
                </div>
              )}
              {/* Global error message */}
              {errorMessage && (
                <div className="alert alert-danger py-2" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="text"
                    value={user?.phone || ''}
                    disabled
                    className="form-control bg-light"
                  />
                  <small className="text-muted">Phone can only be changed via OTP verification.</small>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-orange px-5"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'password' && <ChangePassword />}

          {activeTab === 'phone' && <UpdatePhone currentPhone={user?.phone} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;