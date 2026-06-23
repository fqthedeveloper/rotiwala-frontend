import { useEffect, useState } from "react";

import Swal from "sweetalert2";

import { getCart } from "../../service/cartService";

import { placeOrder } from "../../service/orderService";

import api from "../../service/api";

import { useNavigate } from "react-router-dom";
import "./CSS/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(null);

  const [shops, setShops] = useState([]);

  const [shopId, setShopId] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

  const [pickupByOtherPerson, setPickupByOtherPerson] = useState(false);

  const [pickupPersonName, setPickupPersonName] = useState("");

  const [pickupPersonPhone, setPickupPersonPhone] = useState("");

  const [selectedShop, setSelectedShop] = useState(null);

  const [estimatedMinutes, setEstimatedMinutes] = useState(10);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cartData = await getCart();

      setCart(cartData);

      const res = await api.get("/shops/public/");

      setShops(res.data);
    } catch {
      Swal.fire("Error", "Unable to load checkout", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!shopId) {
      Swal.fire("Select Shop", "Please select shop", "warning");

      return;
    }

    if (pickupByOtherPerson && !pickupPersonName.trim()) {
      Swal.fire("Pickup Person", "Enter pickup person name", "warning");

      return;
    }

    if (pickupByOtherPerson && !pickupPersonPhone.trim()) {
      Swal.fire("Pickup Person", "Enter pickup person phone number", "warning");

      return;
    }

    setPlacingOrder(true);

    try {
      const response = await placeOrder({
        shop_id: shopId,

        payment_method: paymentMethod,

        notes,

        pickup_by_other_person: pickupByOtherPerson,

        pickup_person_name: pickupByOtherPerson ? pickupPersonName : "",

        pickup_person_phone: pickupByOtherPerson ? pickupPersonPhone : "",
      });

      await Swal.fire({
        title: "🎉 Order Placed Successfully",

        html: `

      <div style="padding:10px">

        <h4>Order No</h4>

        <h2 style="color:#f7c600">
          ${response.order_number}
        </h2>

        <p>
          Estimated Ready In
        </p>

        <h3>
          ${response.estimated_minutes}
          Minutes
        </h3>

      </div>

      `,

        icon: "success",

        confirmButtonText: "Track Order",

        confirmButtonColor: "#f7c600",
      });

      navigate("/my-orders");
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "Failed", "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            <div className="checkout-card">
              <div className="checkout-header">
                <h2>Checkout</h2>

                <p>Complete your order and pickup details</p>
              </div>

              <div className="card-body p-4 p-md-5">
                <div className="estimate-box">
                  <h6>Estimated Preparation Time</h6>

                  <h2>{estimatedMinutes} Minutes</h2>

                  <p>Freshly prepared after order confirmation</p>
                </div>

                <h5 className="section-title">Select Shop</h5>

                <select
                  className="form-select checkout-input"
                  value={shopId}
                  onChange={(e) => {
                    setShopId(e.target.value);

                    const shop = shops.find(
                      (s) => s.id === Number(e.target.value),
                    );

                    setSelectedShop(shop);
                  }}
                >
                  <option value="">Select Shop</option>

                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>

                {selectedShop && (
                  <div className="customer-card mt-4">
                    <h5>Shop Details</h5>

                    <div className="customer-info">
                      <div>
                        <strong>Shop Name</strong>

                        <span>{selectedShop.name}</span>
                      </div>

                      <div>
                        <strong>Phone</strong>

                        <span>{selectedShop.phone}</span>
                      </div>

                      <div>
                        <strong>Address</strong>

                        <span>{selectedShop.address}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pickup-card mt-4">
                  <h5>Pickup Information</h5>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="otherPickup"
                      className="form-check-input"
                      checked={pickupByOtherPerson}
                      onChange={(e) => setPickupByOtherPerson(e.target.checked)}
                    />

                    <label
                      htmlFor="otherPickup"
                      className="form-check-label fw-bold"
                    >
                      Some other person will collect
                    </label>
                  </div>

                  {pickupByOtherPerson && (
                    <div className="mt-4">
                      <input
                        type="text"
                        className="form-control checkout-input mb-3"
                        placeholder="Pickup Person Name"
                        value={pickupPersonName}
                        onChange={(e) => setPickupPersonName(e.target.value)}
                      />

                      <input
                        type="tel"
                        className="form-control checkout-input"
                        placeholder="Pickup Person Phone Number"
                        value={pickupPersonPhone}
                        onChange={(e) => setPickupPersonPhone(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <h5 className="section-title">Payment Method</h5>

                <div className="payment-grid">
                  <div
                    className={
                      paymentMethod === "cash"
                        ? "payment-card active"
                        : "payment-card"
                    }
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <h6>Cash On Pickup</h6>

                    <small>Pay when collecting</small>
                  </div>

                  <div
                    className={
                      paymentMethod === "upi"
                        ? "payment-card active"
                        : "payment-card"
                    }
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <h6>UPI At Shop</h6>

                    <small>Scan & pay at counter</small>
                  </div>
                </div>

                <h5 className="section-title">Notes</h5>

                <textarea
                  rows="3"
                  className="form-control checkout-textarea"
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <h5 className="section-title mt-4">Cart Items</h5>

                {cart?.items?.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div>
                      <div className="checkout-item-name">{item.item_name}</div>

                      <div className="checkout-item-qty">
                        Qty : {item.quantity}
                      </div>
                    </div>

                    <div className="checkout-item-price">
                      ₹{item.total_price}
                    </div>
                  </div>
                ))}

                <div className="checkout-summary">
                  <div className="checkout-total">
                    <h4>Total Amount</h4>

                    <h3>₹{cart?.total_amount}</h3>
                  </div>
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
