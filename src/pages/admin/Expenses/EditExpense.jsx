// frontend/src/pages/admin/Expenses/EditExpense.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import {
  getExpenseCategories,
  getExpenseMasterItems,
  getExpenseDetail,
  updateExpense,
} from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";
import { useAuth } from "../../../context/AuthContext";

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [shops, setShops] = useState([]);

  const managerShopId = user?.shop_id || user?.shop?.id || user?.shop || "";

  const [formData, setFormData] = useState({
    shop_id: "",
    category_id: "",
    expense_date: new Date().toISOString().split("T")[0],
    // ❌ notes removed
    items: [
      {
        master_item: "",
        custom_item_name: "",
        amount: 0,
        note: "", // ✅ per‑item note
      },
    ],
  });

  useEffect(() => {
    document.title = "Edit Expense | Roti Wala";

    const getValueId = (value) => {
      if (!value) return "";
      if (typeof value === "object") {
        return value.id || value._id || "";
      }
      return value;
    };

    const getItems = (expenseData) => {
      const rawItems =
        expenseData.items ||
        expenseData.expense_items ||
        expenseData.expense_items_list ||
        [];

      return rawItems.map((item) => ({
        master_item:
          getValueId(item.master_item) || getValueId(item.master_item_id) || "",
        custom_item_name:
          item.custom_item_name || item.custom_item || "",
        // ❌ quantity removed
        amount: item.amount ?? item.cost ?? 0,
        note: item.note ?? item.remarks ?? "",
      }));
    };

    const fetchData = async () => {
      try {
        const [categoriesData, shopsData, expenseData] = await Promise.all([
          getExpenseCategories(),
          getShops(),
          getExpenseDetail(id),
        ]);

        setCategories(categoriesData);
        setShops(shopsData);

        const categoryId =
          getValueId(expenseData.category_id || expenseData.category);
        const shopId = getValueId(expenseData.shop_id || expenseData.shop);
        const items = getItems(expenseData);
        const finalShopId =
          user?.role !== "super_admin" && managerShopId ? managerShopId : shopId;

        setFormData({
          shop_id: finalShopId,
          category_id: categoryId,
          expense_date: expenseData.expense_date
            ? expenseData.expense_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          // ❌ notes removed
          items:
            items.length > 0
              ? items
              : [
                  {
                    master_item: "",
                    custom_item_name: "",
                    amount: 0,
                    note: "",
                  },
                ],
        });

        if (categoryId) {
          const fetchedItems = await getExpenseMasterItems(categoryId);
          setMasterItems(fetchedItems);
        }
      } catch (err) {
        console.error("Error loading expense details:", err);
        setError("Failed to load expense details.");
      }
    };

    fetchData();
  }, [id, user]);

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
        shop: formData.shop_id,
        category: formData.category_id,
        shop_id: formData.shop_id,
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        // ❌ notes removed – no header notes
        items: formData.items.map((item) => ({
          master_item: item.master_item || null,
          custom_item_name: item.custom_item_name || "",
          // ❌ quantity removed
          amount: item.amount,
          note: item.note || "",
        })),
      };

      await updateExpense(id, payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/admin/expenses");
      }, 1500);
    } catch (err) {
      console.error("Error updating expense:", err);
      setError(err.response?.data?.error || "Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-page">
      <style>{`
        .add-expense-page {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          color: #0c0c0c;
          background: #ffffff;
          min-height: 100vh;
        }
        .page-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #000000 !important;
          background: linear-gradient(135deg, #000000, #292929);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .expense-form {
          background: rgb(253, 252, 252);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(10, 10, 10, 0.71);
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
          color: #0c0c0c;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.14);
          border-radius: 8px;
          color: #0c0c0c;
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
          grid-template-columns: 1.8fr 1.8fr 1.2fr 1.2fr 0.5fr;
          gap: 10px;
          background: #f8fafc;
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 10px;
          align-items: end;
        }
        .item-row label {
          font-size: 12px;
          color: #0c0c0c;
          margin-bottom: 2px;
        }
        .item-row input,
        .item-row select {
          padding: 6px 8px;
          font-size: 13px;
        }
        .add-item-btn {
          background: rgba(59,130,246,0.2);
          color: #1d4ed8;
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
          color: #b91c1c;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 6px;
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
          background: #e2e8f0;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.16);
        }
        .btn-secondary:hover {
          background: #cbd5e1;
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
        @media (max-width: 992px) {
          .item-row {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .item-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1 className="page-title">✏️ Edit Expense</h1>

      <form className="expense-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Expense updated successfully! ✅</div>}

        <div className="form-group">
          <label>Shop</label>
          <select
            name="shop_id"
            value={formData.shop_id}
            onChange={handleInputChange}
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

        {/* ❌ Header notes removed */}

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
              {/* ✅ Per‑item note – placed before delete button */}
              <div>
                <label>Note</label>
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) =>
                    handleItemChange(index, "note", e.target.value)
                  }
                  placeholder="Optional note"
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
            {loading ? "Updating..." : "Update Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpense;