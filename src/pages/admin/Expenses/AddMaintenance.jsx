import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { createMaintenance } from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";
import { useAuth } from "../../../context/AuthContext";

const AddMaintenance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [shops, setShops] = useState([]);

  const [formData, setFormData] = useState({
    shop_id: "",
    title: "",
    description: "",
    amount: "",
    maintenance_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const managerShopId =
      user?.shop_id || user?.shop?.id || user?.shop || "";

    const fetchShops = async () => {
      try {
        const shopsData = await getShops();
        setShops(shopsData);
        if (user?.role !== "super_admin" && managerShopId) {
          setFormData((prev) => ({
            ...prev,
            shop_id: managerShopId,
          }));
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops.");
      }
    };
    fetchShops();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.shop_id) {
      setError("Please select a shop.");
      setLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required.");
      setLoading(false);
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }

    try {
      await createMaintenance(formData);
      setSuccess(true);
      setTimeout(() => {
        setFormData({
          shop_id:
            user?.role !== "super_admin"
              ? user?.shop_id || user?.shop?.id || user?.shop || ""
              : "",
          title: "",
          description: "",
          amount: "",
          maintenance_date: new Date().toISOString().split("T")[0],
        });
        setSuccess(false);
        navigate("/admin/expenses");
      }, 2000);
    } catch (err) {
      console.error("Error creating maintenance:", err);
      setError(err.response?.data?.error || "Failed to save maintenance record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-maintenance-page">
      <style>{`
        .add-maintenance-page {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
          color: #111827;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-title {
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          font-weight: 700;
          margin-bottom: 24px;
          color: #111827;
        }
        .maintenance-form {
          background: #ffffff;
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #0f172a;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-warning {
          background: #f59e0b;
          color: #ffffff;
        }
        .btn-warning:hover {
          background: #d97706;
        }
        .btn-warning:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.1);
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .success-message {
          background: #dcfce7;
          color: #15803d;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(16, 185, 129, 0.24);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .add-maintenance-page {
            padding: 16px;
          }
          .maintenance-form {
            padding: 20px;
          }
          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 560px) {
          .add-maintenance-page {
            padding: 12px;
          }
          .maintenance-form {
            padding: 18px;
          }
          .form-group input,
          .form-group select,
          .form-group textarea {
            font-size: 15px;
          }
        }
      `}</style>

      <h1 className="page-title">🔧 Add Maintenance Record</h1>

      <form className="maintenance-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Maintenance saved successfully! ✅</div>}

        <div className="form-group">
          <label>Shop</label>
          <select
            name="shop_id"
            value={formData.shop_id}
            onChange={handleChange}
            required
            disabled={user?.role !== "super_admin"}
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {user?.role !== "super_admin" && (
            <small style={{
              display: "block",
              marginTop: "8px",
              color: "#475569",
            }}>
              Your assigned shop is preselected and cannot be changed.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., AC Repair, Plumbing"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of maintenance work"
          />
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="maintenance_date"
            value={formData.maintenance_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/expenses")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-warning" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? "Saving..." : "Save Maintenance"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMaintenance;