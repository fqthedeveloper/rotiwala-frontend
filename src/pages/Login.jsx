import { useState, useRef, useEffect } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../service/firebase";

import api from "../service/api";

import { Link, useNavigate } from "react-router-dom";

import "./CSS/Register.css";

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

  const [error, setError] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);

  const formatPhoneNumber = (number) => {
    let mobile = number.trim();

    mobile = mobile.replace(/\s+/g, "");

    if (/^\d{10}$/.test(mobile)) {
      mobile = `+91${mobile}`;
    }

    if (/^91\d{10}$/.test(mobile)) {
      mobile = `+${mobile}`;
    }

    return mobile;
  };

  const handleLoginSuccess = (response) => {
    console.log("LOGIN RESPONSE:", response.data);

    const currentUser = response.data.user;

    localStorage.setItem("access", response.data.access);

    localStorage.setItem("refresh", response.data.refresh);

    localStorage.setItem("user", JSON.stringify(currentUser));

    localStorage.setItem("role", currentUser.role);

    localStorage.setItem("user_id", currentUser.id);

    console.log("ACCESS SAVED:", localStorage.getItem("access"));

    console.log("ROLE SAVED:", localStorage.getItem("role"));

    window.dispatchEvent(new Event("authChanged"));

    if (currentUser.role === "super_admin" || currentUser.role === "manager") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

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

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          },
        );
      }

      const result = await signInWithPhoneNumber(
        auth,
        mobile,
        window.recaptchaVerifier,
      );

      setConfirmationResult(result);

      setPhone(mobile);

      setOtpSent(true);

      setLoading(false);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to send OTP");

      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError("");

      if (!confirmationResult) {
        setError("OTP session expired");

        setLoading(false);

        return;
      }

      const result = await confirmationResult.confirm(otp);

      const firebaseToken = await result.user.getIdToken(true);

      const response = await api.post("/accounts/firebase-login/", {
        token: firebaseToken,
      });

      handleLoginSuccess(response);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.error || "Invalid OTP");

      setLoading(false);
    }
  };

  const loginWithPassword = async () => {
    try {
      setLoading(true);
      setError("");

      const mobile = formatPhoneNumber(phone);

      const response = await api.post("/accounts/password-login/", {
        phone: mobile,
        password: password,
      });

      handleLoginSuccess(response);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.error || "Invalid credentials");

      setLoading(false);
    }
  };

  useEffect(() => {
    if (otpSent && otpRef.current) {
      setTimeout(() => {
        otpRef.current?.focus();
      }, 100);
    }
  }, [otpSent]);

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
              className={
                activeTab === "otp"
                  ? "btn btn-primary flex-fill"
                  : "btn btn-outline-secondary flex-fill"
              }
              onClick={() => setActiveTab("otp")}
            >
              OTP Login
            </button>

            <button
              className={
                activeTab === "password"
                  ? "btn btn-primary flex-fill"
                  : "btn btn-outline-secondary flex-fill"
              }
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

              <button
                className="btn btn-primary w-100"
                onClick={sendOTP}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="otp-phone">
                OTP sent to
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

              <button
                className="btn btn-success w-100"
                onClick={verifyOTP}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                className="btn btn-link mt-3"
                onClick={() => setOtpSent(false)}
              >
                Change Number
              </button>
            </>
          )
        ) : (
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

            <div className="mb-3">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              className="btn btn-primary w-100"
              onClick={loginWithPassword}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        <div
          id="recaptcha-container"
          style={{
            marginTop: "10px",
          }}
        />

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
