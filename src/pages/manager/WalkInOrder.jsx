import { useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

import { motion } from "framer-motion";

import {
  FaSearch,
  FaUser,
  FaPhone,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaMoneyBillWave,
  FaQrcode,
  FaReceipt,
  FaRupeeSign,
} from "react-icons/fa";

import {
  getCategoriesByShop,
  getItemsByCategoryPublic,
} from "../../service/menuItemService";

import { createWalkInOrder, searchCustomer } from "../../service/walkInService";

import "./CSS/WalkInOrder.css";

export default function WalkInOrder() {
  const [loading, setLoading] = useState(false);

  const [customerLoading, setCustomerLoading] = useState(false);

  const [customerPhone, setCustomerPhone] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [existingCustomer, setExistingCustomer] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);

  const [shopId] = useState(localStorage.getItem("selected_shop"));

  useEffect(() => {
    document.title = "Walk-In POS";

    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadItems(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByShop(shopId);

      setCategories(data);

      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch {
      Swal.fire("Error", "Unable to load categories", "error");
    }
  };

  const loadItems = async (categoryId) => {
    try {
      const data = await getItemsByCategoryPublic(categoryId);

      setItems(data);
    } catch {
      Swal.fire("Error", "Unable to load menu items", "error");
    }
  };

  const handleCustomerSearch = async () => {
    if (!customerPhone) {
      return;
    }

    let phone = customerPhone.trim();

    if (!phone.startsWith("+91")) {
      phone = `+91${phone}`;
    }

    try {
      setCustomerLoading(true);

      const data = await searchCustomer(phone);

      if (data.found) {
        setExistingCustomer(data);

        setCustomerName(data.name);

        Swal.fire({
          icon: "success",

          title: "Customer Found",

          toast: true,

          timer: 1500,

          position: "top-end",

          showConfirmButton: false,
        });
      } else {
        setExistingCustomer(null);

        Swal.fire({
          icon: "info",

          title: "New Customer",

          toast: true,

          timer: 1500,

          position: "top-end",

          showConfirmButton: false,
        });
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  const addToCart = (item) => {
    const exists = cart.find((c) => c.id === item.id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.id === item.id
            ? {
                ...c,
                quantity: c.quantity + 1,
              }
            : c,
        ),
      );
    } else {
      setCart([
        ...cart,

        {
          ...item,

          quantity: 1,
        },
      ]);
    }
  };

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.base_price) * item.quantity,

      0,
    );
  }, [cart]);
  const placeOrder = async () => {
    if (!customerName) {
      Swal.fire("Customer Required", "Please enter customer name", "warning");

      return;
    }

    if (cart.length === 0) {
      Swal.fire("Cart Empty", "Please add items", "warning");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        shop_id: shopId,

        customer_name: customerName,

        customer_phone: customerPhone,

        payment_method: paymentMethod,

        items: cart.map((item) => ({
          item_id: item.id,

          quantity: item.quantity,
        })),
      };

      const response = await createWalkInOrder(payload);

      Swal.fire({
        icon: "success",

        title: "Order Created",

        html: `
            <h4>${response.order_number}</h4>
            <h3>₹${response.total_amount}</h3>
          `,
      });

      setCart([]);

      setCustomerName("");

      setCustomerPhone("");

      setExistingCustomer(null);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.error || "Unable to create order",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="walkin-page">
      <div className="container-fluid">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="walkin-header"
        >
          <div>
            <h2>
              <FaReceipt />
              Walk-In POS
            </h2>

            <p>Fast Billing & Order Creation</p>
          </div>

          <div className="order-preview">
            <span>Next Order</span>

            <h4>RT-XXXX</h4>
          </div>
        </motion.div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 customer-card">
              <div className="card-body">
                <h5>
                  <FaUser />
                  Customer
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Phone</label>

                    <div className="phone-search">
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="9876543210"
                      />

                      <button
                        onClick={handleCustomerSearch}
                        disabled={customerLoading}
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label>Customer Name</label>

                    <input
                      type="text"
                      className="form-control"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                {existingCustomer && (
                  <div className="customer-badge">
                    <div>👤 {existingCustomer.name}</div>

                    <div>📱 {existingCustomer.phone}</div>

                    <div>⭐ Trust: {existingCustomer.trust_score}</div>

                    <div>🧾 Orders: {existingCustomer.total_orders}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body">
                <div className="category-scroll">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`category-btn ${
                        selectedCategory === category.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                <div className="search-menu">
                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search Item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="row g-3 mt-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="col-md-4 col-sm-6">
                      <motion.div
                        whileHover={{
                          y: -5,
                        }}
                        className="menu-card"
                      >
                        <div className="menu-body">
                          <img
                            src={item.image || "/default-item.png"}
                            alt={item.name}
                          />
                          <h6>{item.name}</h6>

                          <p>₹{item.base_price}</p>

                          <button
                            className="btn btn-warning w-100"
                            onClick={() => addToCart(item)}
                          >
                            Add Item
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="cart-panel">
              <h5>
                <FaShoppingCart />
                Cart
              </h5>

              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>

                    <div>₹{item.base_price}</div>
                  </div>

                  <div className="qty-box">
                    <button onClick={() => decreaseQty(item.id)}>
                      <FaMinus />
                    </button>

                    <span>{item.quantity}</span>

                    <button onClick={() => increaseQty(item.id)}>
                      <FaPlus />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="empty-cart">
                  <FaShoppingCart />

                  <h5>Cart Empty</h5>

                  <p>Select items to start billing</p>
                </div>
              )}

              <div className="payment-box">
                <label>
                  <FaMoneyBillWave />
                  Cash
                </label>

                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />

                <label>
                  <FaQrcode />
                  UPI
                </label>

                <input
                  type="radio"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
              </div>

              <div className="cart-total">
                <span>Total</span>

                <h3>
                  <FaRupeeSign />

                  {total}
                </h3>
              </div>

              <button
                className="btn btn-success w-100 btn-lg"
                disabled={loading}
                onClick={placeOrder}
              >
                {loading ? "Creating..." : "Create Walk-In Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
