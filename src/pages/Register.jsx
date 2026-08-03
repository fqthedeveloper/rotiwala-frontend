// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../service/api";
import "./CSS/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (number) => {
    let mobile = number.trim().replace(/\s+/g, "");
    if (/^\d{10}$/.test(mobile)) mobile = `+91${mobile}`;
    if (/^91\d{10}$/.test(mobile)) mobile = `+${mobile}`;
    return mobile;
  };

  useEffect(() => {
    document.title = "Register - Roti Wala";
  }, []);

  // ---------- WhatsApp OTP ----------
  const sendOTP = async () => {
    try {
      setLoading(true);
      setError("");
      if (!firstName.trim()) {
        setError("First name is required");
        setLoading(false);
        return;
      }
      if (!lastName.trim()) {
        setError("Last name is required");
        setLoading(false);
        return;
      }
      if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const mobile = formatPhoneNumber(phone);
      if (!/^\+\d{10,15}$/.test(mobile)) {
        setError("Please enter a valid mobile number");
        setLoading(false);
        return;
      }

      await api.post("/accounts/send-otp/", { phone: mobile });
      setPhone(mobile);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError("");
      if (!otp || otp.length < 6) {
        setError("Please enter a valid 6-digit OTP");
        setLoading(false);
        return;
      }

      const response = await api.post("/accounts/verify-otp/", {
        phone: phone,
        otp: otp,
        first_name: firstName,
        last_name: lastName,
        password: password,   // send password for new user
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user_id", response.data.user.id);

      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render (unchanged) ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Register and start ordering fresh rotis</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!otpSent ? (
          <>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="tel"
                className="form-control"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label className="form-check-label">Show Password</label>
            </div>
            <button className="btn btn-primary w-100" onClick={sendOTP} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-3">
              OTP sent on WhatsApp to the number:
              <br />
              <strong>{phone}</strong>
            </div>
            <div className="mb-3">
              <input
                type="text"
                maxLength="6"
                className="form-control text-center"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button className="btn btn-success w-100" onClick={verifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button className="btn btn-link mt-3" onClick={() => setOtpSent(false)}>
              Change Mobile Number
            </button>
          </>
        )}

        {/* reCAPTCHA container removed */}
        <div className="auth-footer mt-4">
          Already have an account?
          <Link to="/login" className="ms-2">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}