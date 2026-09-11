import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaUtensils,
  FaSave,
  FaUser,
  FaPhone,
  FaStickyNote,
} from "react-icons/fa";
import {
  updatePlacedOrder,
  addPlacedOrderItem,
  updatePlacedOrderItem,
  deletePlacedOrderItem,
} from "../../../service/orderService";
import { getPublicMenuItems } from "../../../service/menuItemService";

export default function EditWalkInOrderModal({
  isOpen,
  order,
  onClose,
  onOrderUpdated,
}) {
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [availableMenuItems, setAvailableMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setCustomerName(order.customer_name || "");
      setCustomerPhone(order.customer_phone || "");
      setNotes(order.notes || "");
      loadShopMenu(order.shop);
    }
  }, [order]);

  const loadShopMenu = async (shopId) => {
    try {
      setLoadingMenu(true);
      const data = await getPublicMenuItems({ shop_id: shopId });
      const menuList = Array.isArray(data) ? data : data?.items || [];
      setAvailableMenuItems(menuList.filter((m) => m.is_available !== false));
    } catch (err) {
      console.error("Failed to load shop menu items:", err);
    } finally {
      setLoadingMenu(false);
    }
  };

  if (!isOpen || !order) return null;

  const calculateTotal = () => {
    return items.reduce((acc, it) => acc + Number(it.total_price || 0), 0);
  };

  // Update item quantity
  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleDeleteItem(item);
      return;
    }

    try {
      const res = await updatePlacedOrderItem(item.id, newQty);
      if (res && res.order) {
        setItems(res.order.items || []);
        if (onOrderUpdated) onOrderUpdated(res.order);
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  quantity: newQty,
                  total_price: Number(it.item_price) * newQty,
                }
              : it
          )
        );
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to update quantity", "error");
    }
  };

  // Delete item from placed walk-in order
  const handleDeleteItem = async (item) => {
    if (items.length <= 1) {
      Swal.fire("Warning", "An order must have at least one item. If you want to cancel the entire order, use Cancel Order instead.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Remove Item?",
      text: `Remove "${item.item_name || 'item'}" from this order?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Remove",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deletePlacedOrderItem(item.id);
      if (res && res.order) {
        setItems(res.order.items || []);
        if (onOrderUpdated) onOrderUpdated(res.order);
      } else {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
      }
      Swal.fire({
        icon: "success",
        title: "Item Removed",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to remove item", "error");
    }
  };

  // Add a new item to placed walk-in order
  const handleAddItem = async () => {
    if (!selectedMenuItem) {
      Swal.fire("Please select an item", "Select a menu item from the list to add.", "info");
      return;
    }

    try {
      const res = await addPlacedOrderItem(order.id, selectedMenuItem, Number(addQty) || 1);
      if (res && res.order) {
        setItems(res.order.items || []);
        if (onOrderUpdated) onOrderUpdated(res.order);
      }
      setSelectedMenuItem("");
      setAddQty(1);
      Swal.fire({
        icon: "success",
        title: "Item Added",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to add item to order", "error");
    }
  };

  // Save customer details and notes
  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      const res = await updatePlacedOrder(order.id, {
        customer_name: customerName,
        customer_phone: customerPhone,
        notes,
      });

      if (res && res.order && onOrderUpdated) {
        onOrderUpdated(res.order);
      }

      Swal.fire({
        icon: "success",
        title: "Order Updated",
        text: "Walk-In order details updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to save details", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 10500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "modalFadeUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #430a15 0%, #6d1322 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #d4a437",
          }}
        >
          <div>
            <h5 style={{ margin: 0, fontWeight: "800", fontSize: "1.15rem" }}>
              ✏️ Edit Walk-In Order #{order.token_number || order.order_number}
            </h5>
            <small style={{ color: "#fcefd2" }}>
              Status: <strong style={{ textTransform: "uppercase" }}>{order.status}</strong> · Walk-In Order
            </small>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {/* Customer info */}
          <div
            style={{
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              marginBottom: "18px",
            }}
          >
            <div style={{ fontWeight: "700", marginBottom: "10px", fontSize: "0.85rem", color: "#475569" }}>
              CUSTOMER & NOTES
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                  <FaUser className="me-1" /> Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                  placeholder="e.g. Rahul"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                  <FaPhone className="me-1" /> Phone Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                <FaStickyNote className="me-1" /> Kitchen Notes / Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
                placeholder="e.g. Well done, extra crispy"
              />
            </div>
          </div>

          {/* Current Items */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: "700", marginBottom: "10px", fontSize: "0.85rem", color: "#475569" }}>
              ORDER ITEMS ({items.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>
                      {it.item_name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      ₹{it.item_price} each · <strong style={{ color: "#0f172a" }}>₹{it.total_price}</strong>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => handleQuantityChange(it, -1)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#f1f5f9",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                      title="Decrease quantity"
                    >
                      <FaMinus />
                    </button>
                    <span style={{ fontWeight: "800", minWidth: "24px", textAlign: "center", fontSize: "14px" }}>
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(it, 1)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#f1f5f9",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                      title="Increase quantity"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(it)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "6px",
                      }}
                      title="Remove item"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add extra item */}
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
            }}
          >
            <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "0.85rem", color: "#92400e" }}>
              <FaUtensils className="me-1" /> ADD MORE ITEMS TO THIS ORDER
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d97706",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="">-- Choose Menu Item to Add --</option>
                {availableMenuItems.map((mi) => (
                  <option key={mi.id} value={mi.id}>
                    {mi.name} — ₹{mi.base_price || mi.price}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="50"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                style={{
                  width: "70px",
                  padding: "9px 8px",
                  borderRadius: "8px",
                  border: "1px solid #d97706",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              />
              <button
                onClick={handleAddItem}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <FaPlus /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              Updated Total:
            </span>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#6d1322" }}>
              ₹{calculateTotal()}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDetails}
              disabled={saving}
              style={{
                padding: "10px 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
