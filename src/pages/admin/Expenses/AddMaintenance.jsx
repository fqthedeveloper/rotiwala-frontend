import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { createMaintenance } from "../../../service/expenseServices";

const AddMaintenance = () => {
  const navigate = useNavigate();
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
    const fetchShops = async () => {
      try {
        // Replace with your actual getShops() API
        // const data = await getShops();
        // setShops(data);
        setShops([{ id: 1, name: "Main Shop" }, { id: 2, name: "Branch 1" }]);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops.");
      }
    };
    fetchShops();
  }, []);

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
          shop_id: "",
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
          max-width: 700px;
          margin: 0 auto;
          color: #e8f0fe;
          background: #0f172a;
          min-height: 100vh;
        }
        .page-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .maintenance-form {
          background: rgba(255,255,255,0.03);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
          color: #cbd5e1;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #e8f0fe;
          font-size: 14px;
          outline: none;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #f59e0b;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .btn {
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-warning {
          background: #f59e0b;
          color: #fff;
        }
        .btn-warning:hover {
          background: #d97706;
        }
        .btn-warning:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: #e8f0fe;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        .error-message {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .success-message {
          background: rgba(16,185,129,0.15);
          color: #34d399;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
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