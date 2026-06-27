import { useEffect, useRef, useState } from "react";

import {
  FaPhone,
  FaUser,
  FaMoneyBillWave,
  FaStickyNote,
  FaStar,
  FaShoppingBag,
} from "react-icons/fa";

import {
  searchCustomer,
  updateWalkInCart,
} from "../../../service/walkInService";

import "./CSS/CustomerPanel.css";

export default function CustomerPanel({
  selectedCart,

  refreshCart,
}) {
  const [customer, setCustomer] = useState(null);

  const [customerPhone, setCustomerPhone] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const [searching, setSearching] = useState(false);

  const customerExists = !!customer;

  const firstLoad = useRef(true);
  useEffect(() => {
    if (!selectedCart) return;

    firstLoad.current = true;

    setCustomer(null);

    setCustomerPhone(selectedCart.customer_phone || "");

    setCustomerName(selectedCart.customer_name || "");

    setPaymentMethod(selectedCart.payment_method || "cash");

    setNotes(selectedCart.notes || "");
  }, [selectedCart]);
  function formatPhone(phone) {
    if (!phone) return "";

    phone = phone

      .replace(/\s/g, "")

      .replace(/-/g, "");

    if (phone.startsWith("+91")) {
      return phone;
    }

    if (phone.startsWith("91")) {
      return "+" + phone;
    }

    return "+91" + phone;
  }
  async function lookupCustomer(phone) {
    if (!phone) {
      setCustomer(null);

      return;
    }

    try {
      setSearching(true);

      const result = await searchCustomer(formatPhone(phone));

      if (result.found) {
        setCustomer(result);

        setCustomerName(result.name);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setSearching(false);
    }
  }
  useEffect(() => {
    if (!selectedCart || customerPhone.length < 10) {
      setCustomer(null);

      return;
    }

    const timer = setTimeout(() => {
      lookupCustomer(customerPhone);
    }, 500);

    return () => clearTimeout(timer);
  }, [customerPhone]);
  async function saveDraft() {
    if (!selectedCart) return;

    if (customerPhone.trim() === "" && customerName.trim() === "") {
      return;
    }

    try {
      setSaving(true);

      await updateWalkInCart(
        selectedCart.id,

        {
          customer_name: customerName,

          customer_phone: customerPhone,

          payment_method: paymentMethod,

          notes: notes,
        },
      );

      refreshCart();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!selectedCart) return;

    if (firstLoad.current) {
      firstLoad.current = false;

      return;
    }

    const timer = setTimeout(() => {
      saveDraft();
    }, 1200);

    return () => clearTimeout(timer);
  }, [customerPhone, customerName, paymentMethod, notes]);
  function changePayment(method) {
    setPaymentMethod(method);
  }
  const ExistingCustomer = () => (
    <div className="existing-customer">
      <div className="badge-icon">✓</div>

      <div>
        <strong>Existing Customer</strong>

        <small>Customer found in database</small>
      </div>
    </div>
  );
  const NewCustomer = () => (
    <div className="new-customer">
      <div className="badge-icon">+</div>

      <div>
        <strong>New Customer</strong>

        <small>Customer will be created after placing the order</small>
      </div>
    </div>
  );
  const CustomerStats = () => (
    <div className="customer-stats">
      <div className="stat-card">
        <FaStar />

        <div>
          <strong>{customer?.trust_score ?? "-"}</strong>

          <span>Trust</span>
        </div>
      </div>

      <div className="stat-card">
        <FaShoppingBag />

        <div>
          <strong>{customer?.total_orders ?? "-"}</strong>

          <span>Orders</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customer-panel">
      <div className="customer-header">
        <div>
          <h3>Customer Details</h3>

          <p>Walk-In Customer Information</p>
        </div>
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
      {searching && (
        <div className="customer-loading">Searching Customer...</div>
      )}
      {!customerExists && customerPhone.length >= 10 && <NewCustomer />}
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
      {customerExists && <CustomerStats />}
      <div className="form-group">
        <label>Payment Method</label>

        <div className="payment-list">
          <button
            type="button"
            className={
              paymentMethod === "cash" ? "payment-btn active" : "payment-btn"
            }
            onClick={() => changePayment("cash")}
          >
            <FaMoneyBillWave />
            Cash
          </button>

          <button
            type="button"
            className={
              paymentMethod === "upi" ? "payment-btn active" : "payment-btn"
            }
            onClick={() => changePayment("upi")}
          >
            <FaMoneyBillWave />
            UPI
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Notes</label>

        <div className="textarea-box">
          <FaStickyNote />

          <textarea
            rows="4"
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <div className="customer-footer">
        {saving ? <span>Saving Draft...</span> : <span>Draft Saved</span>}
      </div>
    </div>
  );
}
