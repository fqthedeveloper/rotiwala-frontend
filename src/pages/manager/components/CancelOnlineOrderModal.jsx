import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaStore,
  FaUserTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import { cancelOnlineOrderByManager } from "../../../service/orderService";

const SHOP_REASONS = [
  "Item not available / Out of stock",
  "Kitchen closed / Equipment breakdown",
  "Delivery not serviceable in customer area",
  "Kitchen overloaded / Cannot fulfill order",
  "Other shop issue (specify below)",
];

const CUSTOMER_REASONS = [
  "Customer not answering calls / Phone unreachable",
  "Customer not coming to pickup (No-show)",
  "Customer refused delivery at doorstep",
  "Fake / prank / invalid order",
  "Other customer fault (specify below)",
];

export default function CancelOnlineOrderModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}) {
  const [faultType, setFaultType] = useState("shop"); // "shop" or "customer"
  const [selectedReason, setSelectedReason] = useState(SHOP_REASONS[0]);
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFaultType("shop");
      setSelectedReason(SHOP_REASONS[0]);
      setCustomDetails("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleFaultTypeChange = (type) => {
    setFaultType(type);
    setSelectedReason(type === "shop" ? SHOP_REASONS[0] : CUSTOMER_REASONS[0]);
  };

  const handleConfirm = async () => {
    let finalReason = selectedReason;
    if (selectedReason.includes("Other")) {
      if (!customDetails.trim()) {
        Swal.fire(
          "Details Required",
          "Please describe the specific reason for cancelling.",
          "warning"
        );
        return;
      }
      finalReason = customDetails.trim();
    } else if (customDetails.trim()) {
      finalReason = `${selectedReason} - ${customDetails.trim()}`;
    }

    try {
      setLoading(true);
      const res = await cancelOnlineOrderByManager(order.id, {
        reason: finalReason,
        fault_type: faultType,
        penalty_points: 15,
      });

      if (faultType === "customer") {
        Swal.fire({
          icon: "warning",
          title: "Order Cancelled & Customer Flagged",
          html: `<p>Order <b>#${order.order_number}</b> was cancelled.</p>
                 <p style="color:#dc2626; font-weight:700;">15 trust points deducted and customer has been flagged.</p>`,
          confirmButtonColor: "#dc2626",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          html: `<p>Order <b>#${order.order_number}</b> was cancelled due to restaurant/shop reason.</p>
                 <p style="color:#16a34a; font-weight:600;">Customer trust points were NOT deducted.</p>`,
          timer: 2200,
          showConfirmButton: false,
        });
      }

      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.error || "Failed to cancel online order",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const isShop = faultType === "shop";
  const activeReasons = isShop ? SHOP_REASONS : CUSTOMER_REASONS;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 10500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          animation: "fadeUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: isShop
              ? "linear-gradient(135deg, #ea580c, #c2410c)"
              : "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "background 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaBan style={{ fontSize: "20px" }} />
            <div>
              <h5 style={{ margin: 0, fontWeight: 800, fontSize: "1.15rem" }}>
                Cancel Online Order #{order.order_number}
              </h5>
              <small style={{ opacity: 0.9 }}>
                Customer: {order.customer_name || "Online Customer"} ({order.customer_phone || "-"})
              </small>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Step 1: Select Fault Type */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              1. Why is this order being cancelled?
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {/* Option: Shop Issue */}
              <div
                onClick={() => handleFaultTypeChange("shop")}
                style={{
                  border: isShop ? "2px solid #ea580c" : "1.5px solid #cbd5e1",
                  background: isShop ? "#fff7ed" : "#f8fafc",
                  borderRadius: "14px",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isShop ? "#ea580c" : "#64748b" }}>
                  <FaStore style={{ fontSize: "18px" }} />
                  <strong style={{ fontSize: "14px" }}>Shop / Kitchen Issue</strong>
                </div>
                <small style={{ color: "#64748b", fontSize: "11.5px" }}>
                  Item out of stock, kitchen issue, or cannot fulfill.
                </small>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#16a34a",
                    fontWeight: 700,
                    fontSize: "11px",
                    marginTop: "4px",
                  }}
                >
                  <FaCheckCircle /> NO Points Deducted
                </span>
              </div>

              {/* Option: Customer Fault */}
              <div
                onClick={() => handleFaultTypeChange("customer")}
                style={{
                  border: !isShop ? "2px solid #dc2626" : "1.5px solid #cbd5e1",
                  background: !isShop ? "#fef2f2" : "#f8fafc",
                  borderRadius: "14px",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: !isShop ? "#dc2626" : "#64748b" }}>
                  <FaUserTimes style={{ fontSize: "18px" }} />
                  <strong style={{ fontSize: "14px" }}>Customer Issue / No-Show</strong>
                </div>
                <small style={{ color: "#64748b", fontSize: "11.5px" }}>
                  Not answering calls, no-show for pickup, refused delivery.
                </small>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#dc2626",
                    fontWeight: 700,
                    fontSize: "11px",
                    marginTop: "4px",
                  }}
                >
                  <FaExclamationTriangle /> Deduct 15 pts & Add Flag
                </span>
              </div>
            </div>
          </div>

          {/* Policy Banner Alert */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: isShop ? "#ecfdf5" : "#fef2f2",
              border: isShop ? "1px solid #a7f3d0" : "1px solid #fecaca",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            {isShop ? (
              <>
                <FaCheckCircle style={{ color: "#16a34a", marginTop: "3px", flexShrink: 0 }} />
                <div style={{ fontSize: "12.5px", color: "#065f46" }}>
                  <strong>Protected Customer:</strong> Because this cancellation is due to restaurant unavailability, customer trust points will <b>remain 100% untouched</b> and no warning flag will be added.
                </div>
              </>
            ) : (
              <>
                <FaExclamationTriangle style={{ color: "#dc2626", marginTop: "3px", flexShrink: 0 }} />
                <div style={{ fontSize: "12.5px", color: "#991b1b" }}>
                  <strong>Account Penalty:</strong> <b>15 points</b> will be deducted from customer’s trust score, and customer will be <b>flagged with reason</b> so you and staff can see the warning next time.
                </div>
              </>
            )}
          </div>

          {/* Step 2: Choose Reason */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              2. Select Specific Reason:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeReasons.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: selectedReason === r ? (isShop ? "#ffedd5" : "#fee2e2") : "#f8fafc",
                    border: selectedReason === r ? (isShop ? "1.5px solid #ea580c" : "1.5px solid #dc2626") : "1px solid #e2e8f0",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: selectedReason === r ? 700 : 500,
                    color: "#1e293b",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    style={{ accentColor: isShop ? "#ea580c" : "#dc2626" }}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Optional / Required Detailed Notes */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              3. Additional Details / Note (Optional):
            </label>
            <textarea
              rows={2}
              placeholder={
                isShop
                  ? "e.g., Butter Roti finished, or delivery partner unavailable..."
                  : "e.g., Called 4 times over 30 mins with no answer, or customer did not arrive..."
              }
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontWeight: 600,
              fontSize: "13.5px",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Don't Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              background: isShop
                ? "linear-gradient(135deg, #ea580c, #c2410c)"
                : "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: isShop
                ? "0 4px 14px rgba(234, 88, 12, 0.35)"
                : "0 4px 14px rgba(220, 38, 38, 0.35)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <FaBan />
            {loading ? "Cancelling..." : isShop ? "Cancel Order (No Penalty)" : "Cancel & Flag Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
