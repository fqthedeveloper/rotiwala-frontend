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
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaShoppingCart size={70} className="text-secondary mb-3" />

            <h3>Your Cart Is Empty</h3>

            <p className="text-muted">Add items from menu</p>

            <Link to="/menu" className="btn btn-warning">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="fw-bold mb-0">Shopping Cart</h2>

        <button onClick={handleClearCart} className="btn btn-danger">
          <FaTrash className="me-2" />
          Clear Cart
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          {cart.items.map((item) => (
            <div key={item.id} className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                  <div className="text-center text-md-start w-100">
                    <h5 className="fw-bold">{item.item_name}</h5>

                    <p className="text-muted mb-0">Price: ₹{item.item_price}</p>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      minWidth: "150px",
                    }}
                  >
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => decreaseQty(item)}
                    >
                      <FaMinus />
                    </button>

                    <div className="px-4 fw-bold">{item.quantity}</div>

                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => increaseQty(item)}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <div
                    className="fw-bold fs-5"
                    style={{
                      minWidth: "80px",
                    }}
                  >
                    ₹{item.total_price}
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={() => removeItem(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold">Order Summary</h4>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <span>Total Items</span>

                <strong>{totalItems}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Total Amount</span>

                <strong>₹{cart.total_amount}</strong>
              </div>

              <hr />

              <button
                className="btn btn-warning w-100 mb-3"
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

              <Link to="/menu" className="btn btn-outline-secondary w-100">
                <FaArrowLeft className="me-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
