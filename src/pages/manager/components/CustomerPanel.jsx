import { useEffect, useRef, useState } from "react";
import {
  FaPhone, FaUser, FaMoneyBillWave, FaStickyNote,
  FaStar, FaShoppingBag, FaCheckCircle, FaTimesCircle, FaQrcode,
} from "react-icons/fa";
import { searchCustomer, updateWalkInCart } from "../../../service/walkInService";
import "./CSS/CustomerPanel.css";

export default function CustomerPanel({ selectedCart, refreshCart }) {
  const [customer, setCustomer] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const firstLoad = useRef(true);
  const customerExists = !!customer;

  useEffect(() => {
    if (!selectedCart) return;
    firstLoad.current = true;
    setCustomer(null);
    setCustomerPhone(selectedCart.customer_phone || "");
    setCustomerName(selectedCart.customer_name || "");
    setPaymentMethod(selectedCart.payment_method || "cash");
    setPaymentStatus(selectedCart.payment_status || "unpaid");
    setNotes(selectedCart.notes || "");
  }, [selectedCart]);

  function formatPhone(phone) {
    if (!phone) return "";
    phone = phone.replace(/\s|-/g, "");
    if (phone.startsWith("+91")) return phone;
    if (phone.startsWith("91")) return "+" + phone;
    return "+91" + phone;
  }

  async function lookupCustomer(phone) {
    if (!phone) return setCustomer(null);
    try {
      setSearching(true);
      const result = await searchCustomer(formatPhone(phone));
      if (result.found) {
        setCustomer(result);
        setCustomerName(result.name);
      } else setCustomer(null);
    } catch { setCustomer(null); }
    finally { setSearching(false); }
  }

  useEffect(() => {
    if (!selectedCart || customerPhone.length < 10) {
      setCustomer(null);
      return;
    }
    const timer = setTimeout(() => lookupCustomer(customerPhone), 500);
    return () => clearTimeout(timer);
  }, [customerPhone]);

  async function saveDraft() {
    if (!selectedCart) return;
    if (!customerPhone.trim() && !customerName.trim()) return;
    try {
      setSaving(true);
      await updateWalkInCart(selectedCart.id, {
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes,
      });
      if (refreshCart) await refreshCart();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  useEffect(() => {
    if (!selectedCart) return;
    if (firstLoad.current) { firstLoad.current = false; return; }
    const timer = setTimeout(saveDraft, 1200);
    return () => clearTimeout(timer);
  }, [customerPhone, customerName, paymentMethod, paymentStatus, notes]);

  return (
    <div className="customer-panel">
      <div className="customer-header">
        <h3>Customer Details</h3>
        <p>Walk-In Customer Information</p>
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <div className="input-box">
          <FaPhone />
          <input
            type="tel"
            placeholder="9876543210"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {searching && <div className="customer-loading">Searching customer...</div>}

      {!customerExists && customerPhone.length >= 10 && (
        <div className="badge-card new">
          <div className="badge-ic">+</div>
          <div>
            <strong>New Customer</strong>
            <small>Will be created after placing the order</small>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Customer Name</label>
        <div className="input-box">
          <FaUser />
          <input
            type="text"
            placeholder="Walk-In Customer"
            value={customerName}
            disabled={customerExists}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      {customerExists && (
        <>
          <div className="badge-card existing">
            <div className="badge-ic">✓</div>
            <div>
              <strong>Existing Customer</strong>
              <small>Found in database</small>
            </div>
          </div>
          <div className="customer-stats">
            <div className="stat-card">
              <FaStar />
              <div><strong>{customer?.trust_score ?? "-"}</strong><span>Trust</span></div>
            </div>
            <div className="stat-card">
              <FaShoppingBag />
              <div><strong>{customer?.total_orders ?? "-"}</strong><span>Orders</span></div>
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Payment Method</label>
        <div className="payment-list">
          <button
            type="button"
            className={paymentMethod === "cash" ? "payment-btn active" : "payment-btn"}
            onClick={() => setPaymentMethod("cash")}
          >
            <FaMoneyBillWave /> Cash
          </button>
          <button
            type="button"
            className={paymentMethod === "upi" ? "payment-btn active" : "payment-btn"}
            onClick={() => setPaymentMethod("upi")}
          >
            <FaQrcode /> UPI
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Payment Status</label>
        <div className="payment-list">
          <button
            type="button"
            className={paymentStatus === "paid" ? "payment-btn active paid" : "payment-btn"}
            onClick={() => setPaymentStatus("paid")}
          >
            <FaCheckCircle /> Paid
          </button>
          <button
            type="button"
            className={paymentStatus === "unpaid" ? "payment-btn active unpaid" : "payment-btn"}
            onClick={() => setPaymentStatus("unpaid")}
          >
            <FaTimesCircle /> Unpaid
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <div className="textarea-box">
          <FaStickyNote />
          <textarea
            rows="3"
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className={`payment-preview ${paymentStatus}`}>
        {paymentStatus === "paid" ? <FaCheckCircle /> : <FaTimesCircle />}
        {paymentStatus === "paid" ? "Payment Received" : "Payment Pending"}
      </div>

      <div className="customer-footer">
        {saving ? "Saving Draft..." : "✓ Draft Saved"}
      </div>
    </div>
  );
}