// frontend/src/pages/OrderDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaShoppingBag,
  FaBoxOpen,
  FaFilePdf,
  FaPrint,
  FaFileAlt,
} from "react-icons/fa";
import {
  getOrderDetail,
  cancelOrder,
  downloadReceiptPDF,
  printReceipt,
  downloadReceiptText,
} from "../../service/orderService";
import useOrderSocket from "../../hooks/useOrderSocket";
import "./CSS/OrderDetail.css";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [userRole, setUserRole] = useState("customer");
  const [selectedBillType, setSelectedBillType] = useState("standard");
  const [showBillOptions, setShowBillOptions] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrderDetail(id);
      setOrder(data);
      const role = localStorage.getItem("userRole") || "customer";
      setUserRole(role);
    } catch {
      Swal.fire("Error", "Unable to load order", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useOrderSocket(id, (data) => {
    setOrder((prev) => ({
      ...prev,
      status: data.status,
      payment_status: data.payment_status,
    }));
  });

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await cancelOrder(order.id);
      Swal.fire("Cancelled", "Order cancelled", "success");
      loadOrder();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.error || "Unable to cancel",
        "error"
      );
    }
  };

  // ----- PDF Download (available to everyone) -----
  const downloadPDF = async () => {
    try {
      await downloadReceiptPDF(order.id, selectedBillType);
      Swal.fire({
        icon: "success",
        title: "Download Started",
        text: "Your receipt is being downloaded",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to download PDF", "error");
    }
  };

  // ----- Print Receipt (manager only) -----
  const handlePrintReceipt = async () => {
    if (userRole !== "manager" && userRole !== "super_admin") {
      Swal.fire("Error", "Only managers can print receipts directly", "error");
      return;
    }
    try {
      const data = await printReceipt(order.id, { bill_type: selectedBillType });
      if (data.success) {
        const printWindow = window.open("", "_blank", "width=400,height=600");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Receipt</title>
                <style>
                  body { 
                    font-family: 'Courier New', monospace; 
                    white-space: pre; 
                    padding: 20px;
                    background: white;
                  }
                  @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <pre>${data.receipt_text}</pre>
                <button class="no-print" onclick="window.print()" style="
                  display: block;
                  margin: 20px auto;
                  padding: 10px 30px;
                  background: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  font-size: 16px;
                  cursor: pointer;
                ">
                  🖨️ Print
                </button>
                <script>
                  window.onload = function() {
                    setTimeout(() => window.print(), 500);
                  };
                <\/script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to print receipt", "error");
    }
  };

  // ----- Text Download (manager only) -----
  const handleDownloadText = async () => {
    if (userRole !== "manager" && userRole !== "super_admin") {
      Swal.fire("Error", "Only managers can download text receipts", "error");
      return;
    }
    try {
      await downloadReceiptText(order.id, selectedBillType);
      Swal.fire({
        icon: "success",
        title: "Download Started",
        text: "Text receipt is being downloaded",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to download text", "error");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  const statuses = ["pending", "accepted", "preparing", "ready", "collected"];
  const currentIndex = statuses.indexOf(order.status);
  const isCollected = order.status === "collected";

  return (
    <div className="order-detail-page container py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="order-card"
      >
        <div className="order-header">
          <h2>Order #{order.order_number}</h2>
          <div className="header-actions">
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="info-grid">
          <div>
            <strong>Amount</strong>
            {order.discount_amount > 0 ? (
              <>
                <p className="original-amount">₹{order.original_amount}</p>
                <p className="discount-line">
                  - ₹{order.discount_amount} ({order.discount_name || "Discount"})
                </p>
                <p className="final-amount">₹{order.total_amount}</p>
              </>
            ) : (
              <p>₹{order.total_amount}</p>
            )}
          </div>
          <div>
            <strong>Payment</strong>
            <p>{order.payment_method}</p>
          </div>
          <div>
            <strong>Payment Status</strong>
            <p>{order.payment_status}</p>
          </div>
          {order.pickup_by_other_person && (
            <div>
              <strong>Pickup Person</strong>
              <p>Name: {order.pickup_person_name || "N/A"}</p>
              <p>Contact: {order.pickup_person_phone || "N/A"}</p>
            </div>
          )}
        </div>

        <hr />

        <h4>Items</h4>
        {order.items.map((item) => (
          <motion.div
            key={item.id}
            className="item-row"
            whileHover={{ scale: 1.02 }}
          >
            <span>
              {item.quantity} x {item.item_name}
            </span>
            <span>₹{item.total_price}</span>
          </motion.div>
        ))}

        <hr />

        <h4>Live Tracking</h4>
        {order.status === "rejected" ? (
          <motion.div
            className="reject-box"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FaTimesCircle size={70} />
            <h3>Order Rejected</h3>
            <p>{order.rejection_reason}</p>
          </motion.div>
        ) : (
          <div className="timeline">
            <TimelineStep
              active={currentIndex >= 0}
              icon={<FaClock />}
              title="Pending"
            />
            <TimelineStep
              active={currentIndex >= 1}
              icon={<FaCheckCircle />}
              title="Accepted"
            />
            <TimelineStep
              active={currentIndex >= 2}
              icon={<FaShoppingBag />}
              title="Preparing"
            />
            <TimelineStep
              active={currentIndex >= 3}
              icon={<FaTruck />}
              title="Ready"
            />
            <TimelineStep
              active={currentIndex >= 4}
              icon={<FaBoxOpen />}
              title="Collected"
            />
          </div>
        )}

        {/* Receipt Actions */}
        <div className="receipt-actions-section">
          <h4>Receipt Actions</h4>
          <div className="action-buttons">
            <button
              className="btn btn-pdf"
              onClick={downloadPDF}
              disabled={!isCollected}
            >
              <FaFilePdf /> Download PDF
            </button>

            {(userRole === "manager" || userRole === "super_admin") && (
              <>
                <button
                  className="btn btn-print"
                  onClick={handlePrintReceipt}
                  disabled={!isCollected}
                >
                  <FaPrint /> Print Receipt
                </button>
                <button
                  className="btn btn-text"
                  onClick={handleDownloadText}
                  disabled={!isCollected}
                >
                  <FaFileAlt /> Download Text
                </button>
              </>
            )}
          </div>
          {!isCollected && (
            <p className="text-muted small mt-2">
              <FaClock /> Receipt will be available after order is collected
            </p>
          )}
        </div>

        {/* Action Buttons Bottom */}
        <div className="action-buttons-bottom">
          {["pending"].includes(order.status) && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel Order
            </button>
          )}
          <button
            className="btn btn-dark"
            onClick={() => navigate("/my-orders")}
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TimelineStep({ active, title, icon }) {
  return (
    <motion.div
      className={active ? "step active" : "step"}
      animate={active ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div>{icon}</div>
      <span>{title}</span>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}