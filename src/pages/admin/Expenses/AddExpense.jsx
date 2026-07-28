import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import {
  getExpenseCategories,
  getExpenseMasterItems,
  createExpense,
} from "../../../service/expenseServices";

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [shops, setShops] = useState([]);

  const [formData, setFormData] = useState({
    shop_id: "",
    category_id: "",
    expense_date: new Date().toISOString().split("T")[0],
    notes: "",
    items: [
      {
        master_item: "",
        custom_item_name: "",
        quantity: 1,
        amount: 0,
        note: "",
      },
    ],
  });

  // Fetch categories & shops on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getExpenseCategories();
        setCategories(categoriesData);
        // Fetch shops – you need an endpoint like /api/shops/
        // const shopsData = await getShops();
        // setShops(shopsData);
        setShops([{ id: 1, name: "Main Shop" }, { id: 2, name: "Branch 1" }]);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load categories.");
      }
    };
    fetchData();
  }, []);

  // Fetch master items when category changes
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({ ...prev, category_id: categoryId, items: [] }));
    if (categoryId) {
      try {
        const items = await getExpenseMasterItems(categoryId);
        setMasterItems(items);
        setFormData((prev) => ({
          ...prev,
          items: [
            {
              master_item: "",
              custom_item_name: "",
              quantity: 1,
              amount: 0,
              note: "",
            },
          ],
        }));
      } catch (err) {
        console.error("Error fetching master items:", err);
        setMasterItems([]);
      }
    } else {
      setMasterItems([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          master_item: "",
          custom_item_name: "",
          quantity: 1,
          amount: 0,
          note: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      setError("At least one item is required.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
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
    if (!formData.category_id) {
      setError("Please select a category.");
      setLoading(false);
      return;
    }
    const hasEmptyAmount = formData.items.some(
      (item) => !item.amount || item.amount <= 0
    );
    if (hasEmptyAmount) {
      setError("Each item must have a valid amount.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        shop_id: formData.shop_id,
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          master_item: item.master_item || null,
          custom_item_name: item.custom_item_name || "",
          quantity: item.quantity || 1,
          amount: item.amount,
          note: item.note || "",
        })),
      };
      await createExpense(payload);
      setSuccess(true);
      setTimeout(() => {
        setFormData({
          shop_id: "",
          category_id: "",
          expense_date: new Date().toISOString().split("T")[0],
          notes: "",
          items: [
            {
              master_item: "",
              custom_item_name: "",
              quantity: 1,
              amount: 0,
              note: "",
            },
          ],
        });
        setSuccess(false);
        navigate("/admin/expenses");
      }, 2000);
    } catch (err) {
      console.error("Error creating expense:", err);
      setError(err.response?.data?.error || "Failed to create expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-page">
      <style>{`
        .add-expense-page {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
          color: #e8f0fe;
          background: #0f172a;
          min-height: 100vh;
        }
        .page-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #f0f9ff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .expense-form {
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
          border-color: #3b82f6;
        }
        .item-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 0.5fr;
          gap: 12px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 10px;
          align-items: end;
        }
        .item-row label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .item-row input,
        .item-row select {
          padding: 6px 8px;
          font-size: 13px;
        }
        .add-item-btn {
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          border: 1px dashed #3b82f6;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s;
        }
        .add-item-btn:hover {
          background: rgba(59,130,246,0.3);
        }
        .remove-btn {
          background: rgba(239,68,68,0.2);
          color: #f87171;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .remove-btn:hover {
          background: rgba(239,68,68,0.3);
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
        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-primary:disabled {
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
        .btn-success {
          background: #10b981;
          color: #fff;
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
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <h1 className="page-title">💰 Add New Expense</h1>

      <form className="expense-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Expense saved successfully! ✅</div>}

        <div className="form-group">
          <label>Shop</label>
          <select
            name="shop_id"
            value={formData.shop_id}
            onChange={handleInputChange}
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
          <label>Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Expense Date</label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Expense Items</label>
          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <div>
                <label>Master Item</label>
                <select
                  value={item.master_item}
                  onChange={(e) =>
                    handleItemChange(index, "master_item", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {masterItems.map((mi) => (
                    <option key={mi.id} value={mi.id}>
                      {mi.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Custom Name</label>
                <input
                  type="text"
                  value={item.custom_item_name}
                  onChange={(e) =>
                    handleItemChange(index, "custom_item_name", e.target.value)
                  }
                  placeholder="or custom"
                />
              </div>
              <div>
                <label>Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeItem(index)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addItem}>
            <FaPlus /> Add Item
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/expenses")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;