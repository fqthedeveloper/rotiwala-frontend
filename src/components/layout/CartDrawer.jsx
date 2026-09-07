import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaArrowRight } from "react-icons/fa";
import { getCart, updateCartItem, removeCartItem } from "../../service/cartService";
import "./CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setCartData(null);
      return;
    }
    try {
      setLoading(true);
      const data = await getCart();
      setCartData(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [isOpen]);

  const handleQuantity = async (itemId, newQty) => {
    try {
      if (newQty <= 0) {
        await removeCartItem(itemId);
      } else {
        await updateCartItem(itemId, newQty);
      }
      window.dispatchEvent(new Event("cartUpdated"));
      fetchCart();
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const items = cartData?.items || cartData?.cart_items || [];
  const grandTotal = cartData?.total_price || cartData?.grand_total || items.reduce((acc, it) => acc + (it.price || it.menu_item?.price || 0) * it.quantity, 0);

  return (
    <div className={`cart-drawer-overlay ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h3>
            <FaShoppingCart /> Your Order Cart
          </h3>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Close cart">
            <FaTimes />
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🫓</div>
              <h4>Your Cart is Empty</h4>
              <p>Add fresh Afghani Rotis &amp; Tandoori Naans to satisfy your craving!</p>
            </div>
          ) : (
            items.map((item) => {
              const itemObj = item.menu_item || item;
              const price = item.price || itemObj.price || itemObj.base_price || 0;
              return (
                <div className="cart-item" key={item.id}>
                  <img
                    src={itemObj.image_url || "/food-placeholder.jpg"}
                    alt={itemObj.name}
                    className="cart-item-img"
                    onError={(e) => (e.target.src = "/food-placeholder.jpg")}
                  />
                  <div className="cart-item-details">
                    <h5>{itemObj.name}</h5>
                    <div className="cart-item-price">₹ {price * item.quantity}</div>
                  </div>
                  <div className="cart-item-stepper">
                    <button onClick={() => handleQuantity(item.id, item.quantity - 1)}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.id, item.quantity + 1)}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-bill-row">
              <span>Item Subtotal</span>
              <span>₹ {grandTotal}</span>
            </div>
            <div className="cart-bill-row">
              <span>Delivery Fee</span>
              <span style={{ color: "#2e7d32", fontWeight: 700 }}>FREE</span>
            </div>
            <div className="cart-bill-total">
              <span>To Pay</span>
              <span style={{ color: "#6d1322" }}>₹ {grandTotal}</span>
            </div>
            <button
              className="cart-checkout-btn"
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              Proceed to Checkout <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
