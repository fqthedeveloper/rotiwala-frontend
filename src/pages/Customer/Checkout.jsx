import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCart } from "../../service/cartService";
import { placeOrder } from "../../service/orderService";
import api from "../../service/api";
import "./CSS/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [redirectToCart, setRedirectToCart] = useState(false);

  const [cart, setCart] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [pickupByOtherPerson, setPickupByOtherPerson] = useState(false);
  const [pickupPersonName, setPickupPersonName] = useState("");
  const [pickupPersonPhone, setPickupPersonPhone] = useState("");

  const [estimatedMinutes, setEstimatedMinutes] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [pickupType, setPickupType] = useState("instant");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  useEffect(() => {
    document.title = "Check Out - Roti Wala";
    loadData();
  }, []);

  /* ============================================
     Haversine Formula — Distance between two
     latitude/longitude points in kilometers
     ============================================ */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestShop = (userLat, userLng, shopsList) => {
    if (!shopsList || shopsList.length === 0) return null;

    const shopsWithCoords = shopsList.filter(
      (s) => s.latitude != null && s.longitude != null
    );

    if (shopsWithCoords.length === 0) {
      return shopsList[0]; // fallback: no coords available
    }

    let nearest = shopsWithCoords[0];
    let minDist = calculateDistance(
      userLat,
      userLng,
      nearest.latitude,
      nearest.longitude
    );

    for (let i = 1; i < shopsWithCoords.length; i++) {
      const dist = calculateDistance(
        userLat,
        userLng,
        shopsWithCoords[i].latitude,
        shopsWithCoords[i].longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = shopsWithCoords[i];
      }
    }
    return nearest;
  };

  const autoSelectShop = (shopsData) => {
    if (!shopsData || shopsData.length === 0) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const nearest = findNearestShop(userLat, userLng, shopsData);

          if (nearest) {
            setShopId(String(nearest.id));
            setSelectedShop(nearest);
          }
        },
        (error) => {
          // Location denied / unavailable → select first shop
          console.warn("Geolocation denied or failed:", error.message);
          const first = shopsData[0];
          setShopId(String(first.id));
          setSelectedShop(first);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      // No geolocation support → select first shop
      const first = shopsData[0];
      setShopId(String(first.id));
      setSelectedShop(first);
    }
  };

  const loadData = async () => {
    try {
      const cartData = await getCart();

      /* ============================================
         GUARD: Empty cart → redirect to /cart
         ============================================ */
      if (
        !cartData ||
        !cartData.items ||
        cartData.items.length === 0 ||
        cartData.total_amount === 0
      ) {
        setRedirectToCart(true);
        return;
      }

      setCart(cartData);

      const res = await api.get("/shops/public/");
      const shopsData = res.data || [];
      setShops(shopsData);

      // Auto-select nearest shop
      autoSelectShop(shopsData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unable to load checkout", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!shopId) {
      Swal.fire("Select Shop", "Please select a shop", "warning");
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

    if (pickupType === "scheduled" && (!pickupDate || !pickupTime)) {
      Swal.fire(
        "Schedule Required",
        "Please select both pickup date and time",
        "warning"
      );
      return;
    }

    setPlacingOrder(true);

    try {
      const payload = {
        shop_id: shopId,
        payment_method: paymentMethod,
        notes: notes,
        pickup_by_other_person: pickupByOtherPerson,
        pickup_person_name: pickupByOtherPerson ? pickupPersonName : "",
        pickup_person_phone: pickupByOtherPerson ? pickupPersonPhone : "",
        pickup_type: pickupType,
        pickup_date: pickupType === "scheduled" ? pickupDate : null,
        pickup_time: pickupType === "scheduled" ? pickupTime : null,
      };

      const response = await placeOrder(payload);

      await Swal.fire({
        title: "🎉 Order Placed Successfully",
        html: `
          <div style="padding:10px">
            <h4>Order No</h4>
            <h2 style="color:#f7c600">
              ${response.order_number}
            </h2>
            <p>Estimated Ready In</p>
            <h3>${response.estimated_minutes} Minutes</h3>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Track Order",
        confirmButtonColor: "#f7c600",
      });

      navigate("/my-orders");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.error || "Failed to place order",
        "error"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ============================================
     Redirect if cart is empty
     ============================================ */
  if (redirectToCart) {
    return <Navigate to="/cart" replace />;
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container py-5 text-center">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text mt-3">Preparing your checkout...</p>
          </div>
        </div>
      </div>
    );
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
                      (s) => s.id === Number(e.target.value)
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

                  <div className="pickup-time-card mt-4">
                    <h5 className="mb-3">Pickup Time</h5>

                    <div
                      className={
                        pickupType === "instant"
                          ? "pickup-option active"
                          : "pickup-option"
                      }
                      onClick={() => setPickupType("instant")}
                    >
                      <input
                        type="radio"
                        checked={pickupType === "instant"}
                        readOnly
                      />
                      <div>
                        <h6 className="mb-1">Prepare Immediately</h6>
                        <small className="text-muted">
                          Your order will be prepared as soon as the shop
                          accepts it.
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        pickupType === "scheduled"
                          ? "pickup-option active mt-3"
                          : "pickup-option mt-3"
                      }
                      onClick={() => setPickupType("scheduled")}
                    >
                      <input
                        type="radio"
                        checked={pickupType === "scheduled"}
                        readOnly
                      />
                      <div className="w-100">
                        <h6 className="mb-1">Schedule Pickup</h6>
                        <small className="text-muted">
                          Choose a pickup date and time.
                        </small>

                        {pickupType === "scheduled" && (
                          <div className="row mt-3">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Pickup Date</label>
                              <input
                                type="date"
                                className="form-control checkout-input"
                                value={pickupDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setPickupDate(e.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Pickup Time</label>
                              <input
                                type="time"
                                className="form-control checkout-input"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>₹{cart?.total_amount}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Taxes</span>
                    <span>₹0</span>
                  </div>
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