// frontend/src/pages/admin/Expenses/AddRawMaterialExpense.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  FaPlus,
  FaTimes,
  FaSave,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getExpenseCategories,
  getExpenseMasterItems,
  getVendors,
  createVendor,
  createRawMaterialExpense,
  getRawMaterialExpense,
  updateRawMaterialExpense,
} from "../../../service/expenseServices";
import { getShops } from "../../../service/shopService";
import Swal from "sweetalert2";

const AddRawMaterialExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [shops, setShops] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rawItems, setRawItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [formData, setFormData] = useState({
    shop_id: isManager ? (user?.shop_id || user?.shop?.id || "") : "",
    expense_date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    items: [
      {
        item_id: "",
        custom_item_name: "",
        quantity: 1,
        unit: "KG",
        unit_price: 0,
        amount: 0,
        note: "",
      },
    ],
  });

  // Fetch shops, vendors, and raw material items
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Shops (if admin)
        if (!isManager) {
          const shopsData = await getShops();
          setShops(shopsData);
        }

        // 2. Vendors
        const vendorsData = await getVendors();
        setVendors(vendorsData);

        // 3. Get "Raw Materials" category and its items
        const categories = await getExpenseCategories();
        const rawCategory = categories.find(
          (cat) => cat.name.toLowerCase() === "raw materials" || cat.name.toLowerCase() === "raw material"
        );
        if (rawCategory) {
          const items = await getExpenseMasterItems(rawCategory.id);
          setRawItems(items);
        } else {
          // Fallback: try to fetch all items (if no category found)
          console.warn("Raw Materials category not found; fetching all items.");
          // We can still try to fetch all items by category 1 or just show empty
          setRawItems([]);
        }
        setLoadingItems(false);

        // 4. If editing, load the expense
        if (isEdit) {
          const expense = await getRawMaterialExpense(id);
          setFormData({
            shop_id: expense.shop,
            expense_date: expense.expense_date,
            vendor_id: expense.vendor || "",
            items: [
              {
                item_id: expense.item || "",
                custom_item_name: expense.custom_item_name || "",
                quantity: expense.quantity,
                unit: expense.unit,
                unit_price: expense.unit_price || 0,
                amount: expense.amount,
                note: expense.note || "",
              },
            ],
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load initial data.", "error");
      }
    };
    fetchData();
  }, [isManager, isEdit, id]);

  // Auto-calculate amount when quantity or unit_price changes for a specific item
  const handleItemChange = (index, field, value) => {
    const itemsCopy = [...formData.items];
    itemsCopy[index][field] = value;
    // If quantity or unit_price changed, recalc amount
    if (field === "quantity" || field === "unit_price") {
      const qty = parseFloat(itemsCopy[index].quantity) || 0;
      const price = parseFloat(itemsCopy[index].unit_price) || 0;
      itemsCopy[index].amount = qty * price;
    }
    setFormData((prev) => ({ ...prev, items: itemsCopy }));
  };

  const handleItemSelect = (index, itemId) => {
    const itemsCopy = [...formData.items];
    itemsCopy[index].item_id = itemId;
    if (itemId) {
      itemsCopy[index].custom_item_name = "";
    }
    setFormData((prev) => ({ ...prev, items: itemsCopy }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: "",
          custom_item_name: "",
          quantity: 1,
          unit: "KG",
          unit_price: 0,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Inline Add Vendor
  const handleAddVendor = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Vendor",
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Vendor Name" required>
        <input id="swal-input2" class="swal2-input" placeholder="Phone Number">
        <input id="swal-input3" class="swal2-input" placeholder="Address">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value;
        const phone = document.getElementById("swal-input2").value;
        const address = document.getElementById("swal-input3").value;
        if (!name) {
          Swal.showValidationMessage("Vendor name is required");
          return;
        }
        return { name, phone, address };
      },
    });

    if (formValues) {
      try {
        const newVendor = await createVendor({
          name: formValues.name,
          phone: formValues.phone,
          address: formValues.address,
          shop: formData.shop_id,
        });
        setVendors([...vendors, newVendor]);
        setFormData((prev) => ({ ...prev, vendor_id: newVendor.id }));
        Swal.fire("Success", "Vendor added successfully!", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to add vendor.", "error");
      }
    }
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
    if (!formData.vendor_id) {
      setError("Please select or add a vendor.");
      setLoading(false);
      return;
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.item_id && !item.custom_item_name.trim()) {
        setError(`Item ${i + 1}: please select a master item or enter custom name.`);
        setLoading(false);
        return;
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        setError(`Item ${i + 1}: quantity must be greater than 0.`);
        setLoading(false);
        return;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        setError(`Item ${i + 1}: amount must be greater than 0.`);
        setLoading(false);
        return;
      }
    }

    try {
      for (const item of formData.items) {
        const payload = {
          shop: formData.shop_id,
          vendor: formData.vendor_id,
          item: item.item_id || null,
          custom_item_name: item.custom_item_name || "",
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unit_price: parseFloat(item.unit_price) || 0,
          amount: parseFloat(item.amount),
          note: item.note || "",
          expense_date: formData.expense_date,
        };
        if (isEdit) {
          await updateRawMaterialExpense(id, payload);
        } else {
          await createRawMaterialExpense(payload);
        }
      }

      Swal.fire("Success", isEdit ? "Expense updated!" : "Expense added!", "success");
      setSuccess(true);
      setTimeout(() => navigate(isManager ? "/manager/expenses/raw-materials" : "/admin/expenses/raw-materials"), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to save expense.";
      setError(msg);
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const basePath = isManager ? "/manager" : "/admin";

  return (
    <div className="add-raw-material-page">
      <style>{`
        .add-raw-material-page {
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
          display: flex;
          align-items: center;
          gap: 12px;
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
        .form-group .inline-add {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .form-group .inline-add select {
          flex: 1;
        }
        .form-group .inline-add button {
          padding: 8px 12px;
          background: #e2e8f0;
          border: 1px solid rgba(15, 23, 42, 0.16);
          color: #0f172a;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .form-group .inline-add button:hover {
          background: #cbd5e1;
        }
        .item-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.4fr;
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
        @media (max-width: 1024px) {
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

      <h1 className="page-title">
        {isEdit ? "✏️ Edit Raw Material Expense" : "🛒 Add Raw Material Expense"}
      </h1>

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
            disabled={isManager || isEdit}
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {isManager && (
            <small style={{ display: "block", marginTop: "8px", color: "#475569" }}>
              Your assigned shop is preselected and cannot be changed.
            </small>
          )}
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
          <label>Vendor</label>
          <div className="inline-add">
            <select
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <button type="button" onClick={handleAddVendor}>
              <FaPlus /> Add New
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Expense Items</label>
          {loadingItems ? (
            <p style={{ color: "#94a3b8", padding: "10px" }}>Loading items...</p>
          ) : (
            <>
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div>
                    <label>Master Item</label>
                    <select
                      value={item.item_id}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                    >
                      <option value="">Select</option>
                      {rawItems.map((mi) => (
                        <option key={mi.id} value={mi.id}>{mi.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Custom Name</label>
                    <input
                      type="text"
                      value={item.custom_item_name}
                      onChange={(e) => handleItemChange(index, "custom_item_name", e.target.value)}
                      placeholder="or custom"
                      disabled={!!item.item_id}
                    />
                  </div>
                  <div>
                    <label>Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label>Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    >
                      <option value="KG">kg</option>
                      <option value="ML">ml</option>
                      <option value="PIECE">Piece</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Unit Price (₹)</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, "amount", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label>Note</label>
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => handleItemChange(index, "note", e.target.value)}
                      placeholder="Optional"
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
            </>
          )}
          <button type="button" className="add-item-btn" onClick={addItem}>
            <FaPlus /> Add Item
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`${basePath}/expenses/raw-materials`)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? "Saving..." : isEdit ? "Update Expense" : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRawMaterialExpense;