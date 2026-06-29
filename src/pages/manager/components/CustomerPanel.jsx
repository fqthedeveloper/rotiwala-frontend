import { useEffect, useRef, useState } from "react";

import {
  FaPhone,
  FaUser,
  FaMoneyBillWave,
  FaStickyNote,
  FaStar,
  FaShoppingBag,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  searchCustomer,
  updateWalkInCart,
} from "../../../service/walkInService";

import "./CSS/CustomerPanel.css";

export default function CustomerPanel({ selectedCart, refreshCart }) {
  /*
  =========================================
  STATES
  =========================================
  */

  const [customer, setCustomer] = useState(null);

  const [customerPhone, setCustomerPhone] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");

  // NEW
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const [searching, setSearching] = useState(false);

  const customerExists = !!customer;

  const firstLoad = useRef(true);

  /*
  =========================================
  LOAD CART
  =========================================
  */

  useEffect(() => {
    if (!selectedCart) return;

    firstLoad.current = true;

    setCustomer(null);

    setCustomerPhone(selectedCart.customer_phone || "");

    setCustomerName(selectedCart.customer_name || "");

    setPaymentMethod(selectedCart.payment_method || "cash");

    // NEW
    setPaymentStatus(selectedCart.payment_status || "unpaid");

    setNotes(selectedCart.notes || "");
  }, [selectedCart]);

  /*
  =========================================
  FORMAT PHONE
  =========================================
  */

  function formatPhone(phone) {
    if (!phone) return "";

    phone = phone.replace(/\s/g, "").replace(/-/g, "");

    if (phone.startsWith("+91")) {
      return phone;
    }

    if (phone.startsWith("91")) {
      return "+" + phone;
    }

    return "+91" + phone;
  }

  /*
  =========================================
  SEARCH CUSTOMER
  =========================================
  */

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

  /*
  =========================================
  AUTO SEARCH
  =========================================
  */

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

  /*
  =========================================
  SAVE DRAFT
  =========================================
  */

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

          payment_status: paymentStatus,

          notes: notes,
        },
      );

      if (refreshCart) {
        await refreshCart();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================
  AUTO SAVE
  =========================================
  */

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
  }, [customerPhone, customerName, paymentMethod, paymentStatus, notes]);

  /*
  =========================================
  PAYMENT METHOD
  =========================================
  */

  function changePayment(method) {
    setPaymentMethod(method);
  }

  /*
  =========================================
  PAYMENT STATUS
  =========================================
  */

  function changePaymentStatus(status) {
    setPaymentStatus(status);
  }

  /*
  =========================================
  CUSTOMER BADGES
  =========================================
  */

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

  /*
  =========================================
  CUSTOMER STATS
  =========================================
  */

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

  /*
  =========================================
  RENDER
  =========================================
  */

  return (
    <div className="customer-panel">
      {/* =======================================
          HEADER
      ======================================== */}

      <div className="customer-header">
        <div>
          <h3>Customer Details</h3>

          <p>Walk-In Customer Information</p>
        </div>
      </div>

      {/* =======================================
          PHONE
      ======================================== */}

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

      {/* =======================================
          CUSTOMER NAME
      ======================================== */}

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

      {customerExists && <ExistingCustomer />}

      {customerExists && <CustomerStats />}

      {/* =======================================
          PAYMENT METHOD
      ======================================== */}

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

      {/* =======================================
          PAYMENT STATUS
      ======================================== */}

      <div className="form-group">
        <label>Payment Status</label>

        <div className="payment-list">
          <button
            type="button"
            className={
              paymentStatus === "paid"
                ? "payment-btn active paid"
                : "payment-btn"
            }
            onClick={() => changePaymentStatus("paid")}
          >
            <FaCheckCircle />
            Paid
          </button>

          <button
            type="button"
            className={
              paymentStatus === "unpaid"
                ? "payment-btn active unpaid"
                : "payment-btn"
            }
            onClick={() => changePaymentStatus("unpaid")}
          >
            <FaTimesCircle />
            Unpaid
          </button>
        </div>
      </div>

      {/* =======================================
          NOTES
      ======================================== */}

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

      {/* =======================================
          LIVE STATUS
      ======================================== */}

      <div className="customer-payment-preview">
        {paymentStatus === "paid" ? (
          <span className="payment-paid">
            <FaCheckCircle />
            Payment Received
          </span>
        ) : (
          <span className="payment-unpaid">
            <FaTimesCircle />
            Payment Pending
          </span>
        )}
      </div>

      {/* =======================================
          FOOTER
      ======================================== */}

      <div className="customer-footer">
        {saving ? <span>Saving Draft...</span> : <span>✓ Draft Saved</span>}
      </div>
    </div>
  );
}
