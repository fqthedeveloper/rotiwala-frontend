// src/pages/Login.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../service/api";
import "./CSS/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const otpRef = useRef(null);

  const [activeTab, setActiveTab] = useState("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const formatPhoneNumber = (number) => {
    let mobile = number.trim().replace(/\s+/g, "");
    if (/^\d{10}$/.test(mobile)) mobile = `+91${mobile}`;
    if (/^91\d{10}$/.test(mobile)) mobile = `+${mobile}`;
    return mobile;
  };

  const handleLoginSuccess = async (response) => {
    const user = response.data.user;
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    localStorage.setItem("user_id", user.id);
    if (user.shop_id) localStorage.setItem("selected_shop", user.shop_id);

    await saveFCMToken();
    window.dispatchEvent(new Event("authChanged"));

    if (user.role === "super_admin") navigate("/admin/dashboard");
    else if (user.role === "manager") navigate("/manager/dashboard");
    else navigate("/");
  };

  // ---------- WhatsApp OTP ----------
  const sendOTP = async () => {
    try {
      setLoading(true);
      setError("");
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
        // first_name/last_name not needed for login
      });
      await handleLoginSuccess(response);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Password Login ----------
  const loginWithPassword = async () => {
    try {
      setLoading(true);
      setError("");
      setPhoneError("");
      setPasswordError("");
      if (!phone.trim()) {
        setPhoneError("Phone number is required");
        setLoading(false);
        return;
      }
      if (!password.trim()) {
        setPasswordError("Password is required");
        setLoading(false);
        return;
      }
      const mobile = formatPhoneNumber(phone);
      const response = await api.post("/accounts/password-login/", {
        phone: mobile,
        password,
      });
      await handleLoginSuccess(response);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.field === "phone") setPhoneError(data.message);
      else if (data?.field === "password") setPasswordError(data.message);
      else if (err?.response?.status === 401 || err?.response?.status === 400)
        setPasswordError(data?.message || "Wrong phone number or password");
      else if (!err.response) setError("Network error — please check your connection");
      else setError(data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- FCM Token (uses firebase messaging only) ----------
  const saveFCMToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const { messaging, getToken } = await import("../service/firebase");
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      if (token) await api.post("/accounts/save-fcm-token/", { token });
    } catch (error) {
      console.error("FCM Error:", error);
    }
  };

  useEffect(() => {
    document.title = "Login - Roti Wala";
  }, []);

  useEffect(() => {
    if (otpSent && otpRef.current) {
      setTimeout(() => otpRef.current?.focus(), 100);
    }
  }, [otpSent]);

  // ---------- Render (unchanged) ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-4">
          <div className="d-flex gap-2">
            <button
              className={activeTab === "otp" ? "btn btn-primary flex-fill" : "btn btn-outline-secondary flex-fill"}
              onClick={() => setActiveTab("otp")}
            >
              OTP Login
            </button>
            <button
              className={activeTab === "password" ? "btn btn-primary flex-fill" : "btn btn-outline-secondary flex-fill"}
              onClick={() => setActiveTab("password")}
            >
              Password Login
            </button>
          </div>
        </div>

        {activeTab === "otp" ? (
          !otpSent ? (
            <>
              <div className="mb-3">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button className="btn btn-primary w-100" onClick={sendOTP} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="otp-phone">
                OTP sent on Whatsapp to The number:
                <br />
                <strong>{phone}</strong>
              </div>
              <div className="mb-3">
                <input
                  ref={otpRef}
                  type="text"
                  maxLength="6"
                  className="form-control otp-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button className="btn btn-success w-100" onClick={verifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button className="btn btn-link mt-3" onClick={() => setOtpSent(false)}>
                Change Number
              </button>
            </>
          )
        ) : (
          // Password tab – unchanged
          <>
            <div className="mb-3">
              <input
                type="tel"
                className={`form-control ${phoneError ? "is-invalid" : ""}`}
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError("");
                }}
              />
              {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
            </div>
            <div className="mb-3">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${passwordError ? "is-invalid" : ""}`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
              />
              {passwordError && <div className="invalid-feedback d-block">{passwordError}</div>}
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                id="showPassword"
              />
              <label className="form-check-label" htmlFor="showPassword">
                Show Password
              </label>
            </div>
            <button className="btn btn-primary w-100" onClick={loginWithPassword} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {/* reCAPTCHA container removed */}
        <div className="auth-footer">
          Don't have an account?
          <Link to="/register" className="ms-2">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}