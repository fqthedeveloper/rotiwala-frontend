import { useState } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../service/firebase";

import api from "../service/api";
import { useNavigate, Link } from "react-router-dom";

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

  const [confirmationResult, setConfirmationResult] = useState(null);

  const [error, setError] = useState("");

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

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              console.log("reCAPTCHA verified");
            },
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

      setError(err?.message || "Failed to send OTP");

      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError("");

      if (!confirmationResult) {
        setError("OTP session expired. Please resend OTP.");
        setLoading(false);
        return;
      }

      const result = await confirmationResult.confirm(otp);

      const firebaseToken = await result.user.getIdToken(true);

      const response = await api.post("/accounts/register/", {
        token: firebaseToken,
        first_name: firstName,
        last_name: lastName,
        password: password,
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

      setLoading(false);
    }
  };

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
            <div className="text-center mb-3">
              OTP sent to
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
              Change Mobile Number
            </button>
          </>
        )}

        <div
          id="recaptcha-container"
          style={{
            marginTop: "10px",
          }}
        />

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
