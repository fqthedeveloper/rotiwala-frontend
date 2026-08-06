// src/components/Profile/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { changePassword } from '../../service/api';
import toast from 'react-hot-toast';
import '../../pages/Customer/CSS/Profile.css'; // custom styles

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: '#dc3545' });

  // ----- Password strength evaluator -----
  const evaluateStrength = (pwd) => {
    if (!pwd) {
      setStrength({ score: 0, label: 'Weak', color: '#dc3545' });
      return;
    }
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    let label, color;
    if (score <= 2) {
      label = 'Easy';
      color = '#dc3545'; // red
    } else if (score <= 3) {
      label = 'Normal';
      color = '#ffc107'; // yellow
    } else {
      label = 'Strong';
      color = '#28a745'; // green
    }
    setStrength({ score, label, color });
  };

  // Re‑evaluate strength when newPassword changes
  useEffect(() => {
    evaluateStrength(newPassword);
  }, [newPassword]);

  // ----- Form submission -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (newPassword.length < 8) {
      const msg = 'Password must be at least 8 characters';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(oldPassword || undefined, newPassword);
      // Response contains: { message: "Password updated successfully." }
      const successMsg = response.data.message || 'Password updated successfully';
      setSuccessMessage(successMsg);
      toast.success(successMsg);

      // Clear fields after a short delay
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
        setErrorMessage('');
      }, 2000);
    } catch (error) {
      let msg = 'Failed to update password';
      if (error.response?.data?.error) {
        msg = error.response.data.error;
        // If error is an array (validation errors), join them
        if (Array.isArray(msg)) msg = msg.join(', ');
      } else if (error.request) {
        msg = 'No response from server. Check your connection.';
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
  return (
    <form onSubmit={handleSubmit}>
      {/* Success message */}
      {successMessage && (
        <div className="alert alert-success py-2" role="alert">
          <strong>✅ Success!</strong> {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="alert alert-danger py-2" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold">
          Current Password <small className="text-muted">(leave blank if not set)</small>
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="form-control"
          placeholder="Enter current password (optional)"
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="form-control"
          required
          disabled={loading}
        />
        {/* Strength indicator */}
        {newPassword && (
          <div className="mt-2">
            <div className="d-flex align-items-center gap-2">
              <div style={{ flex: 1, height: '6px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <div
                  style={{
                    width: `${Math.min((strength.score / 5) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: strength.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: strength.color }}>
                {strength.label}
              </span>
            </div>
            <small className="text-muted">
              Use 8+ chars with uppercase, lowercase, number, and special character.
            </small>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-control"
          required
          disabled={loading}
        />
        {confirmPassword && newPassword && confirmPassword !== newPassword && (
          <small className="text-danger">Passwords do not match</small>
        )}
        {confirmPassword && newPassword && confirmPassword === newPassword && (
          <small className="text-success">Passwords match ✓</small>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-orange px-5"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

export default ChangePassword;