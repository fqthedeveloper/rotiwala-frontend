// src/components/Profile/UpdatePhone.jsx
import React, { useState } from 'react';
import { sendPhoneUpdateOTP, verifyPhoneUpdateOTP } from '../../service/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Normalize phone to E.164 format (+91...)
const normalizePhone = (input) => {
  if (!input) return '';
  let cleaned = input.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/^0+/, '');
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = `+91${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  return cleaned;
};

const UpdatePhone = ({ currentPhone }) => {
  const { user, updateUser } = useAuth();
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('send'); // 'send' | 'verify' | 'success'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ----- Send OTP -----
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const rawPhone = newPhone.trim();
    if (!rawPhone) {
      const msg = 'Please enter a new phone number';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const normalized = normalizePhone(rawPhone);
    if (!normalized.startsWith('+91') || normalized.length < 12) {
      const msg = 'Please enter a valid Indian phone number (10 digits)';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const normalizedCurrent = normalizePhone(currentPhone || '');
    if (normalized === normalizedCurrent) {
      const msg = 'New phone number must be different from current';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // All checks passed
    setLoading(true);
    try {
      await sendPhoneUpdateOTP(normalized);
      toast.success(`OTP sent to ${normalized}`);
      setStep('verify');
      setNewPhone(normalized); // store normalized for verification
      setErrorMessage('');
    } catch (error) {
      let msg = 'Failed to send OTP';
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.request) {
        msg = 'No response from server. Check your connection.';
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ----- Verify OTP -----
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp) {
      const msg = 'Please enter the OTP';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const normalized = newPhone.startsWith('+') ? newPhone : normalizePhone(newPhone);
    if (!normalized.startsWith('+91') || normalized.length < 12) {
      const msg = 'Invalid phone number';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneUpdateOTP(normalized, otp);

      // Update user context and local storage
      const updatedUser = { ...user, phone: normalized };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(updatedUser);

      // Show success
      const successMsg = `Phone number updated to ${normalized}`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);

      // Reset state to send step after a delay (so user sees success)
      setStep('success');
      setTimeout(() => {
        setStep('send');
        setNewPhone('');
        setOtp('');
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      let msg = 'Invalid OTP';
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
  return (
    <div>
      {/* Success message (if any) */}
      {successMessage && (
        <div className="alert alert-success py-2 mb-3" role="alert">
          <strong>✅ Success!</strong> {successMessage}
        </div>
      )}

      {step === 'send' ? (
        // ---- SEND OTP FORM ----
        <form onSubmit={handleSendOTP}>
          <div className="mb-3">
            <label className="form-label fw-semibold">New Phone Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="form-control"
              placeholder="9999999999 or +919999999999"
              required
              disabled={loading}
            />
            <small className="text-muted">
              Enter 10‑digit Indian number (default +91)
            </small>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-orange px-5"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : step === 'verify' ? (
        // ---- VERIFY OTP FORM ----
        <form onSubmit={handleVerifyOTP}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              OTP sent to <strong>{newPhone}</strong>
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-control"
              placeholder="Enter 6‑digit OTP"
              required
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="d-flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-green px-5"
            >
              {loading ? 'Verifying...' : 'Verify & Update'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('send');
                setErrorMessage('');
                setOtp('');
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              Back
            </button>
          </div>
        </form>
      ) : (
        // ---- SUCCESS STATE (shown briefly before reset) ----
        <div className="text-center py-4">
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>🎉</span>
          </div>
          <h5 className="text-success">Phone number updated successfully!</h5>
          <p className="text-muted">Redirecting back in a moment...</p>
        </div>
      )}
    </div>
  );
};

export default UpdatePhone;