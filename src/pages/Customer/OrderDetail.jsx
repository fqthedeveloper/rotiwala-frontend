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
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaDirections,
  FaExternalLinkAlt,
  FaMotorcycle,
  FaTicketAlt,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getOrderDetail,
  cancelOrder,
  downloadReceiptPDF,
  printReceipt,
  downloadReceiptText,
} from "../../service/orderService";
import useOrderSocket from "../../hooks/useOrderSocket";
import "./CSS/OrderDetail.css";

// Custom Leaflet DivIcons
const shopDivIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="background:#ea580c;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(234,88,12,0.45);border:2.5px solid #fff;">🏪</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const deliveryBoyDivIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="background:#0284c7;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(2,132,199,0.45);border:2.5px solid #fff;">🛵</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const customerDivIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="background:#16a34a;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(22,163,74,0.45);border:2.5px solid #fff;">📍</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function MapBoundsUpdater({ bounds, center, zoom }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (bounds && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } else if (center && center[0] && center[1]) {
        map.setView(center, zoom || 15);
      }
    } catch (e) {
      console.warn("Map update error:", e);
    }
  }, [bounds, center, zoom, map]);
  return null;
}

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
          <div className="header-title-wrap">
            <h2>Order #{order.order_number}</h2>
            {order.token_number && (
              <span className="token-pill">Token #{order.token_number}</span>
            )}
            <span className={`delivery-pill ${order.delivery_option === "delivery" ? "delivery" : "pickup"}`}>
              {order.delivery_option === "delivery" ? <FaTruck /> : <FaStore />}
              {order.delivery_option === "delivery" ? "Home Delivery" : "Shop Pickup"}
            </span>
          </div>
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
          {order.delivery_option === "delivery" && order.delivery_address && (
            <div>
              <strong>Delivery Address</strong>
              <p>{order.delivery_address}</p>
            </div>
          )}
          {order.delivery_fee !== undefined && Number(order.delivery_fee) > 0 && (
            <div>
              <strong>Delivery Fee</strong>
              <p>₹{order.delivery_fee}</p>
            </div>
          )}
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

        {/* Live Map Tracking: Delivery route or Shop pickup location */}
        <OrderTrackingMap order={order} />

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

function OrderTrackingMap({ order }) {
  if (!order || order.status === "rejected" || order.status === "cancelled") {
    return null;
  }

  const isDelivery = order.delivery_option === "delivery";
  const shop = order.shop_details || {};
  const deliveryBoy = order.delivery_details || null;

  // Fallback coords (default central location if 0 or null)
  const defaultShopCoords = [19.0760, 72.8777];

  const shopLat = shop.latitude ? Number(shop.latitude) : defaultShopCoords[0];
  const shopLng = shop.longitude ? Number(shop.longitude) : defaultShopCoords[1];

  const boyLat = deliveryBoy?.latitude ? Number(deliveryBoy.latitude) : null;
  const boyLng = deliveryBoy?.longitude ? Number(deliveryBoy.longitude) : null;

  const custLat = order.delivery_latitude ? Number(order.delivery_latitude) : null;
  const custLng = order.delivery_longitude ? Number(order.delivery_longitude) : null;

  // Build points for bounds & polyline
  const positions = [];
  if (shopLat && shopLng) positions.push([shopLat, shopLng]);
  if (boyLat && boyLng) positions.push([boyLat, boyLng]);
  if (custLat && custLng) positions.push([custLat, custLng]);

  // Center on delivery boy if available, else customer, else shop
  const mapCenter = (boyLat && boyLng)
    ? [boyLat, boyLng]
    : ((custLat && custLng) ? [custLat, custLng] : [shopLat, shopLng]);

  // Google Maps directions url for pickup or customer navigation
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`;

  return (
    <div className="order-map-container">
      <div className="order-map-header">
        <div className="order-map-header-title">
          {isDelivery ? (
            <>
              <span className="map-header-icon delivery"><FaTruck /></span>
              <div>
                <h5>Live Delivery Route & Tracking</h5>
                <span className="text-muted small">Live updates of restaurant, delivery partner, and destination</span>
              </div>
            </>
          ) : (
            <>
              <span className="map-header-icon pickup"><FaStore /></span>
              <div>
                <h5>Shop Pickup Location & Directions</h5>
                <span className="text-muted small">Navigate to the counter to collect your order</span>
              </div>
            </>
          )}
        </div>
        <span className={`map-delivery-tag ${isDelivery ? "delivery" : "pickup"}`}>
          {isDelivery ? "Home Delivery" : "Store Pickup"}
        </span>
      </div>

      {/* Interactive Map */}
      <div className="leaflet-map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={isDelivery && positions.length > 1 ? 13 : 15}
          scrollWheelZoom={false}
          className="order-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater
            bounds={positions.length > 1 ? positions : null}
            center={mapCenter}
            zoom={15}
          />

          {/* Shop Marker */}
          <Marker position={[shopLat, shopLng]} icon={shopDivIcon}>
            <Popup>
              <div className="map-popup-card">
                <h6>🏪 {shop.name || "Roti Wala"}</h6>
                <p>{shop.address || "Shop Address"}</p>
                {shop.phone && <p>📞 {shop.phone}</p>}
              </div>
            </Popup>
          </Marker>

          {/* Delivery Boy Marker (Only for delivery) */}
          {isDelivery && boyLat && boyLng && (
            <Marker position={[boyLat, boyLng]} icon={deliveryBoyDivIcon}>
              <Popup>
                <div className="map-popup-card">
                  <h6>🛵 Delivery Partner</h6>
                  <p>{deliveryBoy.delivery_boy_name || "Driver"}</p>
                  <p className="text-primary font-weight-bold">Status: {deliveryBoy.status || "Out for delivery"}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Customer Destination Marker (Only for delivery) */}
          {isDelivery && custLat && custLng && (
            <Marker position={[custLat, custLng]} icon={customerDivIcon}>
              <Popup>
                <div className="map-popup-card">
                  <h6>📍 Destination</h6>
                  <p>{order.delivery_address || "Delivery Address"}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route path connecting positions */}
          {isDelivery && positions.length > 1 && (
            <Polyline
              positions={positions}
              color="#0284c7"
              weight={4}
              opacity={0.8}
              dashArray="6, 8"
            />
          )}
        </MapContainer>
      </div>

      {/* Extra tracking or pickup cards */}
      {isDelivery ? (
        <div className="delivery-tracking-details">
          {deliveryBoy ? (
            <div className="driver-info-box">
              <div className="driver-avatar">🛵</div>
              <div className="driver-meta">
                <div className="driver-title-row">
                  <h6>{deliveryBoy.delivery_boy_name || "Delivery Partner Assigned"}</h6>
                  <span className="driver-status-badge">{deliveryBoy.status || "Assigned"}</span>
                </div>
                {deliveryBoy.delivery_boy_phone && (
                  <a
                    href={`tel:${deliveryBoy.delivery_boy_phone}`}
                    className="driver-phone-btn"
                  >
                    <FaPhone className="me-1" /> Call Rider ({deliveryBoy.delivery_boy_phone})
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="driver-pending-box">
              <div className="pending-icon-bubble"><FaMotorcycle /></div>
              <div>
                <strong>Awaiting Delivery Partner</strong>
                <p className="text-muted small mb-0">
                  Your meal is being freshly prepared in the kitchen. A delivery partner will be dispatched as soon as the order is ready!
                </p>
              </div>
            </div>
          )}

          {order.delivery_address && (
            <div className="delivery-dest-box">
              <div className="dest-icon-bubble"><FaMapMarkerAlt /></div>
              <div>
                <span className="dest-title">Delivering To</span>
                <p className="dest-text mb-0">{order.delivery_address}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pickup-location-details">
          {order.token_number && (
            <div className="token-pickup-banner">
              <div className="token-badge-icon"><FaTicketAlt /></div>
              <div className="token-badge-text">
                <span className="token-badge-title">YOUR PICKUP TOKEN NUMBER</span>
                <h2 className="token-badge-value">#{order.token_number}</h2>
                <p className="token-badge-sub mb-0">Show this token at the pickup counter when collecting your order.</p>
              </div>
            </div>
          )}

          <div className="shop-pickup-card">
            <div className="shop-card-main">
              <div className="shop-card-info">
                <h5>{shop.name || "Roti Wala Shop"}</h5>
                <p className="shop-address mb-2">{shop.address || "Branch Address"}</p>
                <div className="shop-quick-meta">
                  {shop.phone && (
                    <span className="quick-item">
                      <FaPhone className="me-1" /> <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                    </span>
                  )}
                  {(shop.opening_time || shop.closing_time) && (
                    <span className="quick-item">
                      <FaClock className="me-1" /> Hours: {shop.opening_time || "Morning"} - {shop.closing_time || "Night"}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-directions"
              >
                <FaDirections className="me-1" /> Open in Google Maps <FaExternalLinkAlt className="ms-1" style={{ fontSize: 11 }} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}