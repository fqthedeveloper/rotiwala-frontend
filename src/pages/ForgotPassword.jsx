// src/pages/ForgotPassword.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetOTP, verifyPasswordResetOTP } from '../service/api';
import toast from 'react-hot-toast';
import '../pages/CSS/forgot-password.css';

// Helper: normalize phone to E.164 format (+91...)
const normalizePhone = (input) => {
  // Remove all non-digit characters except leading '+'
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // If no '+', assume Indian number and add +91
  if (!cleaned.startsWith('+')) {
    // Remove any leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    // If exactly 10 digits, add +91
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = `+91${cleaned}`;
    } else {
      // If more digits but no '+', add '+'
      cleaned = `+${cleaned}`;
    }
  }
  return cleaned;
};

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('send'); // 'send' | 'verify' | 'success'
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Countdown timer for success step
  useEffect(() => {
    let timer;
    if (step === 'success' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 'success' && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [step, countdown, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Phone number is required');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone.startsWith('+91') || normalizedPhone.length < 12) {
      toast.error('Please enter a valid Indian phone number (10 digits)');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOTP(normalizedPhone);
      toast.success('OTP sent to your registered phone');
      setStep('verify');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('OTP and new password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone.startsWith('+91') || normalizedPhone.length < 12) {
      toast.error('Invalid phone number');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOTP(normalizedPhone, otp, newPassword);
      // Success → show success step with countdown
      setStep('success');
      setCountdown(5);
      toast.success('Password reset successful! Redirecting...');
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid OTP or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Render success step
  if (step === 'success') {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="reset-card fade-slide-in text-center">
                <div className="mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block">
                    <svg width="48" height="48" fill="#28a745" viewBox="0 0 16 16">
                      <path d="M13.485 1.431a1.5 1.5 0 0 1 2.12 2.12l-8 8a1.5 1.5 0 0 1-2.12 0l-4-4a1.5 1.5 0 0 1 2.12-2.12L6.5 8.38l6.985-6.949z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold text-dark">Password Reset Successful!</h3>
                <p className="text-muted mt-2">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <div className="mt-4">
                  <p className="text-secondary">Redirecting to login in <strong className="text-orange">{countdown}</strong> seconds...</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-orange w-100 mt-2"
                  >
                    Go to Login Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="reset-card fade-slide-in">
              <div className="text-center mb-4">
                <h2 className="h3 fw-bold text-dark">Reset Password</h2>
                <p className="text-muted small mt-2">
                  {step === 'send'
                    ? 'Enter your registered phone number to receive an OTP.'
                    : 'Enter the OTP and your new password.'}
                </p>
              </div>

              {step === 'send' ? (
                <form onSubmit={handleSendOTP}>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control form-control-lg"
                      placeholder="9999999999 or +919999999999"
                      required
                      autoFocus
                    />
                    <small className="text-muted">Enter 10-digit Indian number (default +91)</small>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-orange w-100 py-2"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label fw-semibold">
                      OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="form-control form-control-lg"
                      placeholder="Enter 6-digit OTP"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-control form-control-lg"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-control form-control-lg"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-orange flex-grow-1 py-2"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('send')}
                      className="btn btn-outline-secondary-custom flex-grow-1 py-2"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-4">
                <Link to="/login" className="text-orange-600 text-decoration-none fw-medium">
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;