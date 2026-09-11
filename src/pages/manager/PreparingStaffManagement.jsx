import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPreparingStaff,
  createPreparingStaff,
  updatePreparingStaff,
  toggleStaffStatus,
  deletePreparingStaff,
} from "../../service/staffService";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaSearch,
  FaKey,
  FaTrash,
  FaCheckCircle,
  FaBan,
  FaUsers,
  FaUtensils,
  FaPhoneAlt,
  FaShieldAlt,
  FaStore,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./CSS/PreparingStaffManagement.css";

const PreparingStaffManagement = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getPreparingStaff();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load preparing staff members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.includes(searchTerm) ||
        staff.username?.includes(searchTerm);

      if (!matchesSearch) return false;

      if (statusFilter === "active") return staff.is_active;
      if (statusFilter === "inactive") return !staff.is_active;
      return true;
    });
  }, [staffList, searchTerm, statusFilter]);

  // Handle Add Staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Phone number and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      await createPreparingStaff({
        full_name: fullName.trim(),
        phone: phone.trim(),
        password: password,
        monthly_salary: monthlySalary || 0,
      });

      toast.success("Kitchen preparing staff member added successfully!");
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setPassword("");
      setMonthlySalary("");
      fetchStaff();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Failed to add preparing staff member. Check phone number.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (staff) => {
    const nextStatus = !staff.is_active;
    const actionText = nextStatus ? "Activate" : "Deactivate";

    const result = await Swal.fire({
      title: `${actionText} Staff Member?`,
      text: nextStatus
        ? `${staff.full_name || staff.phone} will be able to log in and manage kitchen orders.`
        : `${staff.full_name || staff.phone} will be disabled and cannot log in.`,
      icon: nextStatus ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus ? "#22c55e" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${actionText}!`,
    });

    if (result.isConfirmed) {
      try {
        await toggleStaffStatus(staff.id, nextStatus);
        toast.success(`Staff member ${actionText.toLowerCase()}d successfully.`);
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, is_active: nextStatus } : s))
        );
      } catch (err) {
        toast.error(`Failed to ${actionText.toLowerCase()} staff member.`);
      }
    }
  };

  // Handle Reset Password
  const handleOpenPasswordModal = (staff) => {
    setSelectedStaff(staff);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setResettingPassword(true);
    try {
      await updatePreparingStaff(selectedStaff.id, {
        password: newPassword,
      });

      toast.success(`Password updated for ${selectedStaff.full_name || selectedStaff.phone}`);
      setShowPasswordModal(false);
      setSelectedStaff(null);
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to update password.");
    } finally {
      setResettingPassword(false);
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (staff) => {
    const result = await Swal.fire({
      title: "Delete Preparing Staff?",
      text: `Are you sure you want to permanently delete ${staff.full_name || staff.phone}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Account",
    });

    if (result.isConfirmed) {
      try {
        await deletePreparingStaff(staff.id);
        toast.success("Staff member deleted successfully.");
        setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      } catch (err) {
        toast.error("Failed to delete staff member.");
      }
    }
  };

  const totalCount = staffList.length;
  const activeCount = staffList.filter((s) => s.is_active).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="staff-management-container">
      {/* Page Header */}
      <div className="staff-header-banner">
        <div className="staff-header-info">
          <h2>
            <FaUtensils className="me-2 text-warning" /> Kitchen &amp; Preparing Staff Team
          </h2>
          <p>
            Add multiple preparing staff members for your kitchen. Staff members can log in, view live orders, prepare rotis, and hand over orders to customers or delivery riders.
          </p>
        </div>
        <button
          className="btn btn-warning btn-add-staff"
          onClick={() => setShowAddModal(true)}
        >
          <FaUserPlus className="me-2" /> Add Preparing Staff
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="staff-stats-row">
        <div className="staff-stat-card">
          <div className="stat-icon-circle blue">
            <FaUsers />
          </div>
          <div className="stat-text">
            <h3>{totalCount}</h3>
            <span>Total Kitchen Staff</span>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="stat-icon-circle green">
            <FaCheckCircle />
          </div>
          <div className="stat-text">
            <h3>{activeCount}</h3>
            <span>Active &amp; Working</span>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="stat-icon-circle red">
            <FaBan />
          </div>
          <div className="stat-text">
            <h3>{inactiveCount}</h3>
            <span>Deactivated</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="staff-controls-bar">
        <div className="staff-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="staff-filter-tabs">
          <button
            className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active ({activeCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "inactive" ? "active" : ""}`}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Staff Table / Cards */}
      {loading ? (
        <div className="staff-loading-state">
          <div className="spinner-border text-warning" role="status"></div>
          <p>Loading kitchen staff team...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="staff-empty-state">
          <FaUtensils className="empty-icon" />
          <h4>No preparing staff found</h4>
          <p>
            {searchTerm || statusFilter !== "all"
              ? "No staff members match your search filter."
              : "You haven't added any preparing staff yet. Click 'Add Preparing Staff' above to create accounts for your kitchen team."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              className="btn btn-warning mt-3"
              onClick={() => setShowAddModal(true)}
            >
              <FaUserPlus className="me-2" /> Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="staff-table-card">
          <div className="table-responsive">
            <table className="table staff-table align-middle">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Phone (Login Username)</th>
                  <th>Monthly Salary</th>
                  <th>Assigned Shop</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="staff-avatar-circle">
                          {staff.full_name
                            ? staff.full_name.charAt(0).toUpperCase()
                            : "S"}
                        </div>
                        <div>
                          <div className="staff-name-text">
                            {staff.full_name || "Kitchen Staff"}
                          </div>
                          <div className="staff-sub-role">
                            <FaShieldAlt className="me-1" /> Preparing Staff
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="staff-phone-badge">
                        <FaPhoneAlt className="me-2" />
                        <strong>{staff.phone || staff.username}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="staff-salary-badge">
                        ₹{parseFloat(staff.monthly_salary || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <span className="staff-shop-tag">
                        <FaStore className="me-1" />
                        {staff.shop_name || "Assigned Shop"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          staff.is_active ? "status-active" : "status-inactive"
                        }`}
                      >
                        <span
                          className={`status-dot ${
                            staff.is_active ? "dot-active" : "dot-inactive"
                          }`}
                        />
                        {staff.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        {/* Toggle Active / Deactive */}
                        <button
                          className={`btn-action-status ${
                            staff.is_active ? "deactivate" : "activate"
                          }`}
                          onClick={() => handleToggleStatus(staff)}
                          title={
                            staff.is_active
                              ? "Deactivate staff member"
                              : "Activate staff member"
                          }
                        >
                          {staff.is_active ? (
                            <>
                              <FaBan className="me-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="me-1" /> Activate
                            </>
                          )}
                        </button>

                        {/* Salary & Payroll */}
                        <button
                          className="btn-action-util salary"
                          onClick={() =>
                            navigate(
                              `/manager/staff/salary/add?staff=${
                                staff.expense_staff_id || ""
                              }`
                            )
                          }
                          title="Add Salary Payment / View Records"
                        >
                          <FaMoneyBillWave />
                        </button>

                        {/* Reset Password */}
                        <button
                          className="btn-action-util password"
                          onClick={() => handleOpenPasswordModal(staff)}
                          title="Reset Password"
                        >
                          <FaKey />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn-action-util delete"
                          onClick={() => handleDeleteStaff(staff)}
                          title="Delete Staff Member"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="modal-header-custom">
              <h5 className="modal-title">
                <FaUserPlus className="me-2 text-warning" /> Add Kitchen Preparing Staff
              </h5>
              <button
                type="button"
                className="btn-close-custom"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="modal-body-custom">
                <p className="text-muted small mb-3">
                  This user will be registered with the <strong>Preparing Staff</strong> role and assigned to your shop. They will use their phone number and password to log in.
                </p>

                <div className="mb-3">
                  <label className="form-label-custom">Full Name</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">
                    Mobile Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control-custom"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <div className="form-text-custom">
                    Staff will use this number as their login username.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">
                    Login Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control-custom"
                    placeholder="Create initial login password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <div className="form-text-custom">
                    Minimum 6 characters. Staff can change their password anytime in their profile.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control-custom"
                    placeholder="e.g. 15000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    min="0"
                  />
                  <div className="form-text-custom">
                    Optional. Automatically syncs with Salary & Payroll management.
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={submitting}
                >
                  {submitting ? "Adding Staff..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && selectedStaff && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="modal-header-custom">
              <h5 className="modal-title">
                <FaKey className="me-2 text-warning" /> Reset Password: {selectedStaff.full_name || selectedStaff.phone}
              </h5>
              <button
                type="button"
                className="btn-close-custom"
                onClick={() => setShowPasswordModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body-custom">
                <p className="text-muted small mb-3">
                  Set a new password for staff member <strong>{selectedStaff.phone}</strong>.
                </p>

                <div className="mb-3">
                  <label className="form-label-custom">New Password</label>
                  <input
                    type="password"
                    className="form-control-custom"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <div className="form-text-custom">
                    Must be at least 6 characters.
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparingStaffManagement;
