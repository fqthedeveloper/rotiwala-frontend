import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaArrowRight } from "react-icons/fa";
import { getCart, updateCartItem, removeCartItem } from "../../service/cartService";
import { getShopsPublic } from "../../service/shopService";
import "./CartDrawer.css";
import logo from "/logo.png"; 

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getCartItemDetails = (item) => {
  const product =
    item.menu_item || item.menu_item_details || item.product || {};
  const quantity = Math.max(1, toAmount(item.quantity));
  const unitPrice = toAmount(
    item.item_price ?? item.price ?? product.base_price ?? product.price,
  );

  return {
    id: item.id,
    name: item.item_name || product.name || item.name || "Menu item",
    image:
      item.image_url ||
      item.item_image ||
      product.image_url ||
      product.image ||
      logo,
    quantity,
    unitPrice,
    total: toAmount(item.total_price ?? item.item_total) || unitPrice * quantity,
  };
};

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [shopRules, setShopRules] = useState(null);

  const fetchCart = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setCartData(null);
      return;
    }
    try {
      setLoading(true);
      const [data, shops] = await Promise.all([
        getCart(),
        getShopsPublic().catch(() => []),
      ]);
      setCartData(data);
      const selectedShopId = localStorage.getItem("selected_shop");
      const selectedShop = shops.find(
        (shop) => String(shop.id) === String(selectedShopId),
      ) || shops[0] || null;
      setShopRules(selectedShop);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const refreshTimer = window.setTimeout(fetchCart, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [isOpen]);

  const handleQuantity = async (itemId, newQty) => {
    if (updatingItemId === itemId) return;

    setUpdatingItemId(itemId);
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
    } finally {
      setUpdatingItemId(null);
    }
  };

  const rawItems = cartData?.items || cartData?.cart_items || [];
  const items = Array.isArray(rawItems) ? rawItems.map(getCartItemDetails) : [];
  const grandTotal = toAmount(
    cartData?.total_amount ??
      cartData?.total_price ??
      cartData?.grand_total ??
      items.reduce((acc, item) => acc + item.total, 0),
  );
  const deliveryFeeSetting = toAmount(shopRules?.delivery_fee);
  const freeDeliveryMinimum = toAmount(
    shopRules?.free_delivery_min_order ?? shopRules?.free_delivery_threshold,
  );
  const deliveryFee = freeDeliveryMinimum > 0 && grandTotal < freeDeliveryMinimum
    ? deliveryFeeSetting
    : 0;
  const freeDeliveryUnlocked = freeDeliveryMinimum > 0 && grandTotal >= freeDeliveryMinimum;
  const amountToFreeDelivery = Math.max(0, freeDeliveryMinimum - grandTotal);

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
          {loading ? (
            <div className="cart-loading-state" aria-live="polite">
              <span className="cart-loading-spinner" aria-hidden="true" />
              <p>Loading your cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🫓</div>
              <h4>Your Cart is Empty</h4>
              <p>Add fresh Afghani Rotis &amp; Tandoori Naans to satisfy your craving!</p>
            </div>
          ) : (
            items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => (e.target.src = "/food-placeholder.jpg")}
                  />
                  <div className="cart-item-details">
                    <h5>{item.name}</h5>
                    <span className="cart-item-unit-price">₹ {item.unitPrice} each</span>
                    <div className="cart-item-price">₹ {item.total}</div>
                  </div>
                  <div className={`cart-item-stepper ${updatingItemId === item.id ? "is-updating" : ""}`}>
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItemId === item.id}
                      aria-label={`Remove one ${item.name}`}
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItemId === item.id}
                      aria-label={`Add one ${item.name}`}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            {freeDeliveryUnlocked ? (
              <div className="free-delivery-unlocked" role="status">
                <FaShoppingCart className="free-delivery-cart-icon" aria-hidden="true" />
                Free delivery unlocked!
              </div>
            ) : freeDeliveryMinimum > 0 && deliveryFeeSetting > 0 ? (
              <div className="free-delivery-progress" role="status">
                Add ₹{amountToFreeDelivery.toFixed(0)} more for free delivery
              </div>
            ) : null}
            <div className="cart-bill-row">
              <span>Item Subtotal</span>
              <span>₹ {grandTotal}</span>
            </div>
            <div className="cart-bill-row">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? "delivery-free-value" : "delivery-charge-value"}>
                {deliveryFee > 0 ? `₹ ${deliveryFee}` : "FREE"}
              </span>
            </div>
            <div className="cart-bill-total">
              <span>To Pay</span>
              <span style={{ color: "#6d1322" }}>₹ {grandTotal + deliveryFee}</span>
            </div>
            <button
              className="cart-checkout-btn"
              onClick={() => {
                onClose();
                navigate("/checkout");
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
