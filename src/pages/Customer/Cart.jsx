// frontend/src/pages/Customer/Cart.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../service/cartService";
import "./CSS/Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load cart",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Cart - Roti Wala";
    loadCart();

    // Refresh cart when coming back from checkout
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const increaseQty = async (item) => {
    try {
      await updateCartItem(item.id, item.quantity + 1);
      window.dispatchEvent(new Event("cartUpdated"));
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const decreaseQty = async (item) => {
    try {
      if (item.quantity <= 1) {
        removeItem(item.id);
        return;
      }
      await updateCartItem(item.id, item.quantity - 1);
      window.dispatchEvent(new Event("cartUpdated"));
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (id) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: "Do you want to remove this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
    });
    if (!result.isConfirmed) return;
    try {
      await removeCartItem(id);
      window.dispatchEvent(new Event("cartUpdated"));
      Swal.fire({
        icon: "success",
        title: "Removed",
        timer: 1200,
        showConfirmButton: false,
      });
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Clear Cart?",
      text: "Remove all items?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear",
    });
    if (!result.isConfirmed) return;
    try {
      await clearCart();
      window.dispatchEvent(new Event("cartUpdated"));
      Swal.fire({
        icon: "success",
        title: "Cart Cleared",
        timer: 1200,
        showConfirmButton: false,
      });
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="empty-state-cart">
            <FaShoppingCart size={70} className="text-secondary mb-3" />
            <h3>Your Cart Is Empty</h3>
            <p className="text-muted">Add items from menu</p>
            <Link to="/menu" className="btn btn-warning">Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <h2 className="fw-bold mb-0">Shopping Cart</h2>
          <button onClick={handleClearCart} className="btn btn-outline-danger btn-sm">
            <FaTrash className="me-2" /> Clear Cart
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="item-row">
                    <div className="item-details">
                      <h5 className="item-name">{item.item_name}</h5>
                      <p className="item-price-text">Price: ₹{item.item_price}</p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        className="btn qty-btn"
                        onClick={() => decreaseQty(item)}
                        aria-label="Decrease quantity"
                      >
                        <FaMinus />
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        className="btn qty-btn"
                        onClick={() => increaseQty(item)}
                        aria-label="Increase quantity"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <div className="price-actions">
                      <span className="item-total">₹{item.total_price}</span>
                      <button
                        className="btn-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 col-lg-4">
            <div className="summary-card card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h4 className="fw-bold">Order Summary</h4>
                <hr />
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{cart.total_amount}</strong>
                </div>
                <hr />
                <button
                  className="btn-checkout"
                  onClick={() => {
                    if (!cart?.items?.length) {
                      Swal.fire({
                        icon: "warning",
                        title: "Cart Empty",
                        text: "Please add items first",
                      });
                      return;
                    }
                    navigate("/checkout");
                  }}
                >
                  Proceed To Checkout
                </button>
                <Link to="/menu" className="btn-continue mt-3">
                  <FaArrowLeft className="me-2" /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;