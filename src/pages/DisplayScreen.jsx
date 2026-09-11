import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getDisplayScreenTokens } from "../service/orderService";
import {
  FaClock,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaMotorcycle,
  FaWalking,
  FaCheckCircle,
  FaUtensils,
  FaBoxOpen,
  FaUser,
  FaTruck,
  FaBell,
  FaCircle,
} from "react-icons/fa";
import "./CSS/DisplayScreen.css";

const DisplayScreen = () => {
  const { shopId: paramShopId } = useParams();
  const [searchParams] = useSearchParams();
  const queryShopId = searchParams.get("shop_id");

  const shopId = paramShopId || queryShopId || localStorage.getItem("selected_shop") || 1;

  const [shopInfo, setShopInfo] = useState({ name: "Roti Wala", shop_code: "" });
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [outForDeliveryOrders, setOutForDeliveryOrders] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);
  const [orderCounts, setOrderCounts] = useState({
    total_preparing: 0,
    total_ready: 0,
    total_out_for_delivery: 0,
    walkin_ready: 0,
    delivery_ready: 0,
  });

  // Filter tab: "all", "walkin", "delivery"
  const [activeFilter, setActiveFilter] = useState("all");

  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const knownReadyRef = useRef(new Set());
  const initialLoadRef = useRef(false);
  const audioCtxRef = useRef(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Chime synthesizer for Ready orders
  const playReadyChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High harmonious chime chord: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1567.9Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.7);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.5, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.9);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(1567.9, now + 0.24);
      gain3.gain.setValueAtTime(0.25, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 1.1);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }, [soundEnabled]);

  // Screen Flash effect
  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 700);
  }, []);

  // Fetch token & order data
  const loadData = useCallback(async () => {
    try {
      const data = await getDisplayScreenTokens(shopId);
      if (data) {
        if (data.shop_name) {
          setShopInfo({ name: data.shop_name, shop_code: data.shop_code || "" });
        }
        setPreparingOrders(data.preparing || []);

        const currentReady = data.ready || [];
        setReadyOrders(currentReady);
        setOutForDeliveryOrders(data.out_for_delivery || []);
        setRecentCompleted(data.recent_completed || []);
        if (data.counts) {
          setOrderCounts(data.counts);
        }

        // Detect new ready orders to trigger chime and flash
        let hasNewReady = false;
        currentReady.forEach((item) => {
          const key = `${item.order_id}-${item.token_number}`;
          if (initialLoadRef.current && !knownReadyRef.current.has(key)) {
            hasNewReady = true;
          }
        });

        knownReadyRef.current = new Set(
          currentReady.map((i) => `${i.order_id}-${i.token_number}`)
        );

        if (hasNewReady) {
          playReadyChime();
          triggerFlash();
        }

        initialLoadRef.current = true;
      }
    } catch (err) {
      console.warn("Failed to fetch display tokens:", err);
    }
  }, [shopId, playReadyChime, triggerFlash]);

  // Initial fetch and 5s polling fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Live WebSocket connection
  useEffect(() => {
    const wsBase =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:8000`;
    const cleanWsBase = wsBase.endsWith("/") ? wsBase.slice(0, -1) : wsBase;
    const wsUrl = `${cleanWsBase}/ws/display/${shopId}/`;

    let ws = null;
    let reconnectTimer = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "display_refresh" || data.type === "display_update") {
              loadData();
            } else {
              loadData();
            }
          } catch (e) {
            loadData();
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws?.close();
        };
      } catch (e) {
        setWsConnected(false);
        reconnectTimer = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [shopId, loadData]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Sound toggle with initial AudioContext unlock
  const toggleSound = () => {
    if (!soundEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      setSoundEnabled(true);
      playReadyChime();
    } else {
      setSoundEnabled(false);
    }
  };

  // Filtered lists based on active tab
  const filteredPreparing = useMemo(() => {
    if (activeFilter === "walkin") return preparingOrders.filter((o) => !o.is_delivery);
    if (activeFilter === "delivery") return preparingOrders.filter((o) => o.is_delivery);
    return preparingOrders;
  }, [preparingOrders, activeFilter]);

  const filteredReady = useMemo(() => {
    if (activeFilter === "walkin") return readyOrders.filter((o) => !o.is_delivery);
    if (activeFilter === "delivery") return readyOrders.filter((o) => o.is_delivery);
    return readyOrders;
  }, [readyOrders, activeFilter]);

  const filteredOutForDelivery = useMemo(() => {
    if (activeFilter === "walkin") return [];
    return outForDeliveryOrders;
  }, [outForDeliveryOrders, activeFilter]);

  return (
    <div className="display-screen-container">
      {/* Visual Flash Overlay for Ready Orders */}
      <div className={`flash-screen-overlay ${isFlashing ? "visible" : ""}`} />

      {/* Screen Header Bar */}
      <header className="display-header">
        <div className="display-brand">
          <div className="brand-logo-icon">🍽️</div>
          <div>
            <h1 className="brand-title">{shopInfo.name}</h1>
            <div className="brand-sub">
              {shopInfo.shop_code && <span className="shop-code-pill">{shopInfo.shop_code}</span>}
              <span className={`sync-status-badge ${wsConnected ? "online" : "polling"}`}>
                <FaCircle className="status-indicator-dot" />
                {wsConnected ? "LIVE REAL-TIME SYNC" : "AUTO-REFRESHING"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="display-filter-tabs">
          <button
            className={`filter-tab-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            ⭐ All Orders
            <span className="filter-count-badge">
              {preparingOrders.length + readyOrders.length}
            </span>
          </button>
          <button
            className={`filter-tab-btn ${activeFilter === "walkin" ? "active" : ""}`}
            onClick={() => setActiveFilter("walkin")}
          >
            <FaWalking className="me-1" /> Walk-In
            <span className="filter-count-badge">
              {preparingOrders.filter((o) => !o.is_delivery).length +
                readyOrders.filter((o) => !o.is_delivery).length}
            </span>
          </button>
          <button
            className={`filter-tab-btn ${activeFilter === "delivery" ? "active" : ""}`}
            onClick={() => setActiveFilter("delivery")}
          >
            <FaMotorcycle className="me-1" /> Delivery
            <span className="filter-count-badge">
              {preparingOrders.filter((o) => o.is_delivery).length +
                readyOrders.filter((o) => o.is_delivery).length +
                outForDeliveryOrders.length}
            </span>
          </button>
        </div>

        {/* Action Controls & Clock */}
        <div className="display-meta">
          <div className="display-clock">
            <FaClock className="me-2 text-info" />
            {currentTime}
          </div>
          <button
            className={`btn-display-control ${soundEnabled ? "active" : ""}`}
            onClick={toggleSound}
            title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            <span className="control-btn-text">{soundEnabled ? "Chime On" : "Chime Off"}</span>
          </button>
          <button className="btn-display-control" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
            <span className="control-btn-text">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Main Order Pipeline Columns */}
      <main className="display-main-grid">
        {/* ================= COLUMN 1: PREPARING ================= */}
        <section className="display-column col-preparing">
          <div className="column-header-banner prep-header">
            <div className="d-flex align-items-center gap-2">
              <span className="header-icon-wrapper prep-icon">
                <FaUtensils />
              </span>
              <div>
                <h2 className="column-title">Preparing in Kitchen</h2>
                <p className="column-desc">Orders currently being baked &amp; prepared</p>
              </div>
            </div>
            <div className="count-circle prep-count">{filteredPreparing.length}</div>
          </div>

          <div className="order-cards-scroll-area">
            {filteredPreparing.length === 0 ? (
              <div className="empty-order-card">
                <div className="empty-icon-glyph">🥣</div>
                <div className="empty-heading">No Orders Preparing</div>
                <p className="empty-sub">All current orders have been prepared.</p>
              </div>
            ) : (
              <div className="order-cards-grid">
                {filteredPreparing.map((order) => (
                  <div
                    key={order.order_id || order.token_number}
                    className="order-card prep-order-card animate-card"
                  >
                    {/* Top Badges */}
                    <div className="order-card-header">
                      <span
                        className={`type-tag ${
                          order.is_delivery ? "tag-delivery" : "tag-walkin"
                        }`}
                      >
                        {order.is_delivery ? (
                          <>
                            <FaMotorcycle className="me-1" /> Delivery
                          </>
                        ) : (
                          <>
                            <FaWalking className="me-1" /> Walk-In
                          </>
                        )}
                      </span>

                      {order.estimated_minutes && (
                        <span className="est-time-tag">
                          ⏱️ ~{order.estimated_minutes} min
                        </span>
                      )}
                    </div>

                    {/* Main Token or Order ID */}
                    <div className="order-id-display prep-num">
                      #{order.token_number}
                    </div>

                    {/* Customer & Details */}
                    <div className="order-card-footer">
                      <div className="customer-info-line">
                        <FaUser className="me-1 text-muted small" />
                        <span className="customer-name-text">
                          {order.customer_name || "Customer"}
                        </span>
                      </div>

                      {order.is_delivery && (
                        <div className="driver-status-badge">
                          {order.driver_name ? (
                            <span className="driver-assigned">
                              <FaMotorcycle className="me-1" /> Rider: {order.driver_name}
                            </span>
                          ) : (
                            <span className="driver-pending">
                              <FaTruck className="me-1" /> Auto-assigning rider...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="card-animated-progress prep-bar">
                      <div className="progress-bar-moving" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= COLUMN 2: READY FOR HANDOVER ================= */}
        <section className="display-column col-ready">
          <div className="column-header-banner ready-header">
            <div className="d-flex align-items-center gap-2">
              <span className="header-icon-wrapper ready-icon">
                <FaBell className="bell-ring-anim" />
              </span>
              <div>
                <h2 className="column-title">Ready for Handover &amp; Pickup</h2>
                <p className="column-desc">Hot &amp; packed! Please collect at counter</p>
              </div>
            </div>
            <div className="count-circle ready-count">{filteredReady.length}</div>
          </div>

          <div className="order-cards-scroll-area">
            {filteredReady.length === 0 ? (
              <div className="empty-order-card">
                <div className="empty-icon-glyph">🔔</div>
                <div className="empty-heading">No Orders Ready</div>
                <p className="empty-sub">Orders will appear here as soon as they are ready.</p>
              </div>
            ) : (
              <div className="order-cards-grid">
                {filteredReady.map((order) => (
                  <div
                    key={order.order_id || order.token_number}
                    className="order-card ready-order-card animate-card glow-ready"
                  >
                    {/* Top Badges */}
                    <div className="order-card-header">
                      <span
                        className={`type-tag ${
                          order.is_delivery ? "tag-delivery" : "tag-walkin"
                        }`}
                      >
                        {order.is_delivery ? (
                          <>
                            <FaMotorcycle className="me-1" /> Rider Pickup
                          </>
                        ) : (
                          <>
                            <FaWalking className="me-1" /> Counter Pickup
                          </>
                        )}
                      </span>

                      <span className="ready-status-pill">
                        <FaCheckCircle className="me-1" /> READY NOW!
                      </span>
                    </div>

                    {/* Main Token or Order ID */}
                    <div className="order-id-display ready-num">
                      #{order.token_number}
                    </div>

                    {/* Customer & Rider Info */}
                    <div className="order-card-footer">
                      <div className="customer-info-line">
                        <FaUser className="me-1 text-muted small" />
                        <span className="customer-name-text">
                          {order.customer_name || "Customer"}
                        </span>
                      </div>

                      {order.is_delivery && (
                        <div className="driver-status-badge">
                          {order.driver_name ? (
                            <span className="driver-assigned ready">
                              <FaMotorcycle className="me-1" /> Rider: {order.driver_name}
                            </span>
                          ) : (
                            <span className="driver-pending">
                              <FaBoxOpen className="me-1" /> Waiting for Rider Pickup
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="card-animated-progress ready-bar" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= OPTIONAL COLUMN 3 / OUT FOR DELIVERY ================= */}
        {activeFilter !== "walkin" && outForDeliveryOrders.length > 0 && (
          <section className="display-column col-out-delivery">
            <div className="column-header-banner out-header">
              <div className="d-flex align-items-center gap-2">
                <span className="header-icon-wrapper out-icon">
                  <FaMotorcycle />
                </span>
                <div>
                  <h2 className="column-title">Out for Delivery</h2>
                  <p className="column-desc">On the road with our delivery riders</p>
                </div>
              </div>
              <div className="count-circle out-count">{outForDeliveryOrders.length}</div>
            </div>

            <div className="order-cards-scroll-area">
              <div className="order-cards-grid">
                {outForDeliveryOrders.map((order) => (
                  <div
                    key={order.order_id || order.token_number}
                    className="order-card out-order-card animate-card"
                  >
                    <div className="order-card-header">
                      <span className="type-tag tag-delivery">
                        <FaMotorcycle className="me-1" /> On Road
                      </span>
                      <span className="out-time-tag">🚀 Dispatched</span>
                    </div>

                    <div className="order-id-display out-num">
                      #{order.token_number}
                    </div>

                    <div className="order-card-footer">
                      <div className="customer-info-line">
                        <span className="customer-name-text">
                          {order.customer_name || "Delivery Customer"}
                        </span>
                      </div>
                      <div className="driver-status-badge">
                        <span className="driver-assigned out">
                          <FaMotorcycle className="me-1" /> Rider: {order.driver_name || "Speedy Rider"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Screen Footer: Recently Delivered & Counter Collections */}
      <footer className="display-footer">
        <div className="footer-label-col">
          <FaCheckCircle className="text-success me-2" />
          <span>Recently Handed Over:</span>
        </div>
        <div className="recent-chips-marquee">
          {recentCompleted.length === 0 ? (
            <span className="recent-empty-tag">No recently completed orders yet</span>
          ) : (
            recentCompleted.map((item) => (
              <div
                key={item.order_id || item.token_number}
                className={`recent-order-pill ${
                  item.is_delivery ? "pill-delivery" : "pill-walkin"
                }`}
              >
                <span className="recent-num">#{item.token_number}</span>
                <span className="recent-type">
                  {item.is_delivery ? "🛵 Delivery" : "🚶 Walk-In"}
                </span>
                {item.customer_name && (
                  <span className="recent-cust">({item.customer_name})</span>
                )}
              </div>
            ))
          )}
        </div>
      </footer>
    </div>
  );
};

export default DisplayScreen;
