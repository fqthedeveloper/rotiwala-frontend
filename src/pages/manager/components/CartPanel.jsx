import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaCheckCircle,
  FaSpinner,
  FaTag,
} from "react-icons/fa";

import {
  getWalkInCart,
  updateCartItem,
  deleteCartItem,
  placeWalkInCart,
  updateWalkInCart,
  searchCustomer,
  getActiveDiscounts,
} from "../../../service/walkInService";
import api from "../../../service/api";

import "./CSS/CartPanel.css";

const QUICK_QUANTITIES = [1, 2, 3, 5, 10];

export default function CartPanel({
  selectedCart,
  refreshDrafts,
  onOrderPlaced,
}) {
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cart, setCart] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [customerFound, setCustomerFound] = useState(false);
  const [customerTrust, setCustomerTrust] = useState(null);
  const [customerOrders, setCustomerOrders] = useState(0);
  const [notes, setNotes] = useState("");

  // ---- discount state ----
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  // ---- discount preview state ----
  const [discountPreview, setDiscountPreview] = useState(null);

  // load cart and sync customer fields
  async function loadCart() {
  if (!selectedCart) {
    setCart(null);
    return;
  }

  try {
    setLoading(false);

    const data = await getWalkInCart(selectedCart.id);

    setCart((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(data)) {
        return prev;
      }
      return data;
    });

    setCustomerName(data.customer_name || "");

    const phone = (data.customer_phone || "")
      .replace("+91", "")
      .replace(/^91/, "");

    setCustomerPhone(phone);

    setPaymentMethod(data.payment_method || "cash");
    setPaymentStatus(data.payment_status || "unpaid");
    setNotes(data.notes || "");

    let shopId = null;

    if (data.shop_id) {
      shopId = data.shop_id;
    } else if (data.shop) {
      if (typeof data.shop === "object") {
        shopId = data.shop.id;
      } else {
        shopId = data.shop;
      }
    }

    if (discounts.length === 0) {
      loadDiscounts(shopId);
    }
  } catch (error) {
    console.error(error);
  }
}

  // ---- load active discounts ----
  const loadDiscounts = async (shopId) => {
    setLoadingDiscounts(true);
    try {
      let data;
      if (shopId) {
        data = await getActiveDiscounts(shopId);
      } else {
        const response = await api.get("/discounts/?is_active=true");
        data = response.data;
      }
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load discounts", e);
      setDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [selectedCart]);

  // ---- preview discount when selected ----
  useEffect(() => {
    if (selectedDiscountId && cart) {
      const selectedDiscount = discounts.find(d => d.id === Number(selectedDiscountId));
      if (selectedDiscount) {
        // Calculate discount preview
        const total = cart.total_amount || 0;
        let discountAmount = 0;
        if (selectedDiscount.discount_type === "percentage") {
          discountAmount = (total * selectedDiscount.value) / 100;
        } else {
          discountAmount = Math.min(selectedDiscount.value, total);
        }
        if (selectedDiscount.maximum_discount_amount) {
          discountAmount = Math.min(discountAmount, selectedDiscount.maximum_discount_amount);
        }
        setDiscountPreview({
          amount: Math.round(discountAmount * 100) / 100,
          name: selectedDiscount.name,
          type: selectedDiscount.discount_type,
        });
      } else {
        setDiscountPreview(null);
      }
    } else {
      setDiscountPreview(null);
    }
  }, [selectedDiscountId, discounts, cart]);

  // update customer info (auto‑save on change)
  const updateCustomer = useCallback(
    async (field, value, reload = false) => {
      if (!cart) return;
      try {
        await updateWalkInCart(cart.id, { [field]: value });
        if (reload) {
          await loadCart();
        }
      } catch (error) {
        console.error("Update failed", error);
      }
    },
    [cart],
  );

  // quantity updates
  async function changeQuantity(item, qty) {
    if (qty < 0) return;
    try {
      setUpdating(true);
      await updateCartItem(item.id, qty);
      await loadCart();
      if (refreshDrafts) await refreshDrafts();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  const handleCustomQty = (item, e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      changeQuantity(item, val);
    }
  };

  async function removeItem(item) {
    const confirm = await Swal.fire({
      title: "Remove Item?",
      text: item.item_name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteCartItem(item.id);
      loadCart();
      refreshDrafts?.();
    } catch (e) {
      console.error(e);
    }
  }

  // ---- place order with discount ----
  async function placeOrder() {
    if (!cart) return;
    if (cart.items.length === 0) {
      Swal.fire("Cart Empty", "Add items first.", "warning");
      return;
    }
    const confirm = await Swal.fire({
      title: "Place Order?",
      text: "Confirm walk-in order.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Place Order",
    });
    if (!confirm.isConfirmed) return;

    try {
      setPlacing(true);
      const payload = {
        payment_status: paymentStatus,
      };
      if (selectedDiscountId) {
        payload.discount_id = selectedDiscountId;
      }

      const response = await placeWalkInCart(cart.id, payload);
      if (!response.success)
        throw new Error(response.message || "Order could not be placed.");

      Swal.fire({
        icon: "success",
        title: response.message || "Order Created Successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      await loadCart();
      if (refreshDrafts) await refreshDrafts();
      if (onOrderPlaced) await onOrderPlaced();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Unable to place order.",
      });
    } finally {
      setPlacing(false);
    }
  }

  async function handlePhoneSearch(phone) {
    if (phone.length !== 10) {
      setCustomerFound(false);
      setCustomerTrust(null);
      setCustomerOrders(0);
      return;
    }
    try {
      const data = await searchCustomer(phone);
      if (data.found) {
        setCustomerFound(true);
        setCustomerName(data.name);
        setCustomerTrust(data.trust_score);
        setCustomerOrders(data.total_orders);
      } else {
        setCustomerFound(false);
        setCustomerTrust(null);
        setCustomerOrders(0);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const totalItems = useMemo(
    () => cart?.items?.reduce((t, i) => t + i.quantity, 0) || 0,
    [cart],
  );

  const grandTotal = useMemo(() => Number(cart?.total_amount || 0), [cart]);

  // Calculate final total with discount preview
  const finalTotal = useMemo(() => {
    if (discountPreview && discountPreview.amount > 0) {
      return Math.max(0, grandTotal - discountPreview.amount);
    }
    return grandTotal;
  }, [grandTotal, discountPreview]);

  return (
    <div className="cart-panel">
      <div className="cart-header">
        <div>
          <h3>🛒 Current Cart</h3>
          <span>{totalItems} Items</span>
        </div>
      </div>

      {loading && (
        <div className="cart-loading">
          <FaSpinner className="spin" />
          <p>Loading Cart...</p>
        </div>
      )}

      {!loading && cart?.items?.length === 0 && (
        <div className="cart-empty">
          <FaShoppingCart />
          <h4>Cart is Empty</h4>
          <p>Select menu items to start an order.</p>
        </div>
      )}

      {!loading && cart?.items?.length > 0 && (
        <div className="cart-items">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.25 }}
                className="cart-item"
              >

                <div className="cart-details">
                  <h5>{item.item_name}</h5>
                  <span className="cart-unit">
                    ₹{Number(item.item_price).toFixed(2)} each
                  </span>
                </div>

                <div className="qty-quick-buttons">
                  {QUICK_QUANTITIES.map((qty) => (
                    <button
                      key={qty}
                      className={`qty-btn ${item.quantity === qty ? "active" : ""}`}
                      onClick={() => changeQuantity(item, qty)}
                      disabled={updating}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                <div className="qty-controls">
                  <div className="qty-box">
                    <button
                      disabled={updating}
                      onClick={() => changeQuantity(item, item.quantity - 1)}
                    >
                      <FaMinus />
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      disabled={updating}
                      onClick={() => changeQuantity(item, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="custom-qty">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleCustomQty(item, e)}
                      disabled={updating}
                    />
                  </div>
                </div>

                <div className="item-total">
                  <strong>₹{Number(item.total_price).toFixed(2)}</strong>
                  <button
                    className="delete-btn"
                    onClick={() => removeItem(item)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {cart?.items?.length > 0 && (
        <>
          <div className="cart-summary">
            <div className="summary-row">
              <span>Items</span>
              <strong>{totalItems}</strong>
            </div>
            {/* Show discount preview if selected */}
            {discountPreview && discountPreview.amount > 0 && (
              <div className="summary-row discount-row-summary">
                <span className="text-success">Discount ({discountPreview.name})</span>
                <strong className="text-success">-₹{discountPreview.amount.toFixed(2)}</strong>
              </div>
            )}
            <div className="summary-row total">
              <span>Grand Total</span>
              <strong>₹{finalTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* ---- CUSTOMER INFO FORM (auto‑save) ---- */}
          <div className="customer-info">
            <h4>Customer Details</h4>
            <div className="form-row">
              <label>Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  updateCustomer("customer_name", e.target.value);
                }}
                placeholder="Customer name"
              />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input
                type="text"
                value={customerPhone}
                maxLength={10}
                placeholder="Phone number"
                onChange={(e) => {
                  const phone = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setCustomerPhone(phone);
                  if (phone.length === 10) {
                    handlePhoneSearch(phone);
                  }
                }}
                onBlur={() => {
                  if (customerPhone.length === 10) {
                    updateCustomer("customer_phone", customerPhone, false);
                  }
                }}
              />
            </div>
            {customerPhone.length === 10 && customerFound && (
              <div className="customer-found">
                <strong>{customerName}</strong>
                <br />
                Orders : {customerOrders}
                <br />
                Trust Score : {customerTrust}
              </div>
            )}
            <div className="form-row">
              <label>Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  updateCustomer("payment_method", e.target.value);
                }}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div className="form-row">
              <label>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => {
                  setPaymentStatus(e.target.value);
                  updateCustomer("payment_status", e.target.value);
                }}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* ---- DISCOUNT SELECTION ---- */}
            <div className="form-row discount-row">
              <label>
                <FaTag className="discount-icon" /> Apply Discount
              </label>
              {loadingDiscounts ? (
                <span className="text-muted">Loading discounts...</span>
              ) : discounts.length === 0 ? (
                <div className="no-discounts">
                  <span className="text-muted">No active discounts</span>
                  <small className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                    Create discounts in the admin panel (Discounts section)
                  </small>
                </div>
              ) : (
                <select
                  value={selectedDiscountId || ""}
                  onChange={(e) => setSelectedDiscountId(e.target.value || null)}
                >
                  <option value="">None</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} –{" "}
                      {d.discount_type === "percentage"
                        ? `${d.value}%`
                        : `₹${d.value}`}
                      {d.minimum_order_amount > 0
                        ? ` (min ₹${d.minimum_order_amount})`
                        : ""}
                    </option>
                  ))}
                </select>
              )}
              {discountPreview && discountPreview.amount > 0 && (
                <div className="discount-info">
                  ✅ {discountPreview.name} will save ₹{discountPreview.amount.toFixed(2)}
                </div>
              )}
            </div>

            <div className="form-row">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  updateCustomer("notes", e.target.value);
                }}
                rows="2"
                placeholder="Special instructions..."
              />
            </div>
          </div>

          <button
            className="place-order-btn"
            disabled={placing}
            onClick={placeOrder}
          >
            {placing ? (
              <>
                <FaSpinner className="spin" /> Creating...
              </>
            ) : (
              <>
                <FaCheckCircle /> Place Order
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}