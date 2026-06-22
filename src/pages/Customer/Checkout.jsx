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

  const [pickupTime, setPickupTime] = useState("");

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

    if (!pickupTime) {
      Swal.fire("Pickup Time", "Select pickup time", "warning");

      return;
    }

 setPlacingOrder(true);

     try {
      const response = await placeOrder({
        shop_id: shopId,
        pickup_time: pickupTime,
        payment_method: paymentMethod,
        notes,
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
        Your order has been sent to the shop.
      </p>

      <p>
        You will receive updates when
        the shop accepts and prepares it.
      </p>
    </div>
  `,
        icon: "success",
        confirmButtonText: "Track Order",
        confirmButtonColor: "#f7c600",
        backdrop: true,
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
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow border-0">
            <div className="card-body">
              <h2 className="mb-4">Checkout</h2>

              <h5>Select Shop</h5>

              <select
                className="form-select mb-3"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">Select Shop</option>

                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>

              <h5>Pickup Time</h5>

              <input
                type="datetime-local"
                className="form-control mb-3"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />

              <h5>Payment Method</h5>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="form-check-input"
                  />

                  <label className="form-check-label">Cash On Pickup</label>
                </div>

                <div className="form-check">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="form-check-input"
                  />

                  <label className="form-check-label">UPI At Shop</label>
                </div>
              </div>

              <h5>Notes</h5>

              <textarea
                className="form-control mb-4"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <h5>Cart Items</h5>

              {cart?.items?.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between border-bottom py-2"
                >
                  <div>
                    {item.item_name} x {item.quantity}
                  </div>

                  <div>₹{item.total_price}</div>
                </div>
              ))}

              <div className="mt-3">
                <h4>Total : ₹{cart?.total_amount}</h4>
              </div>

              <button
                    className="btn btn-warning checkout-btn"
                    onClick={handleOrder}
                    disabled={placingOrder}
                    >

                    {placingOrder
                        ? "Placing Order..."
                        : "Place Order"}

                    </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
