import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaPlus, FaMinus, FaTrash, FaShoppingCart,
  FaCheckCircle, FaSpinner,
} from "react-icons/fa";

import {
  getWalkInCart, updateCartItem, deleteCartItem, placeWalkInCart,
} from "../../../service/walkInService";

import "./CSS/CartPanel.css";

export default function CartPanel({ selectedCart, refreshDrafts, onOrderPlaced }) {
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cart, setCart] = useState(null);

  async function loadCart() {
    if (!selectedCart) return setCart(null);
    try {
      setLoading(true);
      const data = await getWalkInCart(selectedCart.id);
      setCart(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCart(); }, [selectedCart]);

  async function changeQuantity(item, qty) {
    if (qty < 0) return;
    try {
      setUpdating(true);
      await updateCartItem(item.id, qty);
      await loadCart();
      if (refreshDrafts) await refreshDrafts();
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  }

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
    } catch (e) { console.error(e); }
  }

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
      confirmButtonText: "Place",
    });
    if (!confirm.isConfirmed) return;

    try {
      setPlacing(true);
      const response = await placeWalkInCart(cart.id, cart.payment_status);
      if (!response.success) throw new Error(response.message || "Order could not be placed.");

      Swal.fire({
        icon: "success",
        title: response.message || "Order Created Successfully",
        timer: 1800,
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
          error.message || "Unable to place order.",
      });
    } finally {
      setPlacing(false);
    }
  }

  const totalItems = useMemo(
    () => cart?.items?.reduce((t, i) => t + i.quantity, 0) || 0,
    [cart]
  );
  const grandTotal = useMemo(() => Number(cart?.total_amount || 0), [cart]);

  return (
    <div className="cart-panel">
      <div className="cart-header">
        <div>
          <h3>Current Cart</h3>
          <span>{totalItems} Items</span>
        </div>
        <div className="cart-icon-wrap">
          <FaShoppingCart />
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
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
                transition={{ duration: 0.2 }}
                className="cart-item"
              >
                <div className="cart-image">
                  <img src={item.image || "/placeholder.png"} alt={item.item_name} />
                </div>
                <div className="cart-details">
                  <h5>{item.item_name}</h5>
                  <span className="cart-unit">₹{Number(item.item_price).toFixed(2)} each</span>
                </div>
                <div className="qty-box">
                  <button disabled={updating} onClick={() => changeQuantity(item, item.quantity - 1)}>
                    <FaMinus />
                  </button>
                  <strong>{item.quantity}</strong>
                  <button disabled={updating} onClick={() => changeQuantity(item, item.quantity + 1)}>
                    <FaPlus />
                  </button>
                </div>
                <div className="item-total">
                  <strong>₹{Number(item.total_price).toFixed(2)}</strong>
                  <button className="delete-btn" onClick={() => removeItem(item)}>
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
            <div className="summary-row total">
              <span>Grand Total</span>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>
          </div>
          <button className="place-order-btn" disabled={placing} onClick={placeOrder}>
            {placing ? (
              <><FaSpinner className="spin" /> Creating...</>
            ) : (
              <><FaCheckCircle /> Place Order</>
            )}
          </button>
        </>
      )}
    </div>
  );
}