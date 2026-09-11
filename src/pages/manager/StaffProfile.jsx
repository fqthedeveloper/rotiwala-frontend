import React, { useState, useEffect } from "react";
import { getStaffSelfProfile, updateStaffSelfProfile } from "../../service/staffService";
import { changePassword } from "../../service/api";
import toast from "react-hot-toast";
import {
  FaUserCircle,
  FaPhoneAlt,
  FaStore,
  FaKey,
  FaShieldAlt,
  FaCalendarAlt,
  FaSave,
  FaCheck,
  FaUtensils,
} from "react-icons/fa";
import "./CSS/StaffProfile.css";

const StaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "#ef4444" });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getStaffSelfProfile();
      setProfile(data);
      setFullName(data.full_name || "");
    } catch (err) {
      console.warn("Using fallback local profile", err);
      // Fallback from localStorage
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          setProfile({
            full_name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username,
            phone: u.phone,
            shop_name: u.shop_name || "Assigned Shop",
            username: u.username,
          });
          setFullName(`${u.first_name || ""} ${u.last_name || ""}`.trim());
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Password strength
  useEffect(() => {
    if (!newPassword) {
      setStrength({ score: 0, label: "Too Short", color: "#94a3b8" });
      return;
    }
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) s++;

    if (s <= 2) setStrength({ score: s, label: "Weak", color: "#ef4444" });
    else if (s <= 3) setStrength({ score: s, label: "Moderate", color: "#f59e0b" });
    else setStrength({ score: s, label: "Strong", color: "#22c55e" });
  }, [newPassword]);

  // Update profile name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateStaffSelfProfile({ full_name: fullName.trim() });
      toast.success("Profile name updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile name.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      toast.success(res.data?.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to change password. Make sure old password is correct.";
      toast.error(typeof msg === "object" ? Object.values(msg).flat().join(", ") : msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-profile-loading">
        <div className="spinner-border text-warning" role="status"></div>
        <p>Loading staff profile...</p>
      </div>
    );
  }

  const roleTitle =
    localStorage.getItem("role") === "preparing_staff"
      ? "Kitchen Preparing Staff"
      : "Shop Manager";

  return (
    <div className="staff-profile-page">
      {/* Profile Header Card */}
      <div className="staff-profile-banner">
        <div className="profile-banner-avatar">
          <FaUserCircle />
        </div>
        <div className="profile-banner-info">
          <h2>{profile?.full_name || profile?.phone || "Staff Member"}</h2>
          <div className="profile-meta-pills">
            <span className="profile-role-pill">
              <FaUtensils className="me-1" /> {roleTitle}
            </span>
            <span className="profile-shop-pill">
              <FaStore className="me-1" /> {profile?.shop_name || "Assigned Shop"}
            </span>
          </div>
        </div>
      </div>

      <div className="staff-profile-grid">
        {/* Left Column: Profile Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h4>
              <FaShieldAlt className="me-2 text-warning" /> Account Details
            </h4>
          </div>
          <div className="profile-card-body">
            <div className="profile-detail-row">
              <span className="detail-label">
                <FaPhoneAlt className="me-2 text-muted" /> Login Mobile Phone:
              </span>
              <strong className="detail-value">{profile?.phone || profile?.username}</strong>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <FaStore className="me-2 text-muted" /> Assigned Shop:
              </span>
              <strong className="detail-value">{profile?.shop_name || "Central Kitchen"}</strong>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <FaCalendarAlt className="me-2 text-muted" /> Account Status:
              </span>
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                <FaCheck className="me-1" /> Active
              </span>
            </div>

            <hr className="my-4" />

            <form onSubmit={handleUpdateName}>
              <label className="form-label fw-bold">Display Full Name</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-warning fw-bold px-4"
                  disabled={updatingProfile}
                >
                  <FaSave className="me-1" /> {updatingProfile ? "Saving..." : "Save Name"}
                </button>
              </div>
              <small className="text-muted mt-1 d-block">
                This name appears on the kitchen order board when taking actions.
              </small>
            </form>
          </div>
        </div>

        {/* Right Column: Change Password */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h4>
              <FaKey className="me-2 text-warning" /> Change Password
            </h4>
          </div>
          <div className="profile-card-body">
            <p className="text-muted small mb-3">
              Change your password to keep your kitchen account secure. You will need your old password to set a new one.
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Current (Old) Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {newPassword && (
                  <div className="password-strength-bar mt-2">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                    <span className="strength-text" style={{ color: strength.color }}>
                      Strength: {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold py-2"
                disabled={changingPassword}
              >
                <FaKey className="me-2" />
                {changingPassword ? "Updating Password..." : "Change My Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
