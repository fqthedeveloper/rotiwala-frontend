import { useEffect, useState, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";
import { FaBell } from "react-icons/fa";

import DraftCustomers from "./components/DraftCustomers";
import MenuPanel from "./components/MenuPanel";
import CustomerPanel from "./components/CustomerPanel";
import CartPanel from "./components/CartPanel";
import MobileBottomNav from "./components/MobileBottomNav";

import {
  getWalkInCarts,
  getWalkInCart,
  createWalkInCart,
} from "../../service/walkInService";

import "./CSS/WalkInOrder.css";

const BaseURL = import.meta.env.VITE_WS_URL;

export default function WalkInOrder() {
  /* ============== STATE ============== */
  const [mobileTab, setMobileTab] = useState("menu");
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const reconnectRef = useRef(true);
  const reconnectTimerRef = useRef(null);

  /* ============== LOAD CARTS ============== */
  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      let list = (await getWalkInCarts()) || [];

      if (list.length === 0) {
        const cart = await createWalkInCart({
          customer_name: "Walk-In Customer",
          customer_phone: "",
          payment_method: "cash",
          notes: "",
        });
        list = [cart];
      }

      setCarts(list);
      setSelectedCartId((prev) => prev || list[0].id);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to load Draft Customers.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============== LOAD SINGLE CART ============== */
  const loadSelectedCart = useCallback(async (id) => {
    if (!id) return;
    try {
      const cart = await getWalkInCart(id);
      setSelectedCart(cart);
    } catch (error) {
      console.error(error);
    }
  }, []);

  /* ============== CREATE NEW CUSTOMER ============== */
  const createCustomerCart = async () => {
    try {
      const cart = await createWalkInCart({
        customer_name: "Walk-In Customer",
        customer_phone: "",
        payment_method: "cash",
        notes: "",
      });

      await loadCarts();
      setSelectedCartId(cart.id);

      Swal.fire({
        toast: true,
        position: "top-end",
        timer: 1800,
        showConfirmButton: false,
        icon: "success",
        title: "New Customer Created",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to create customer.",
      });
    }
  };

  /* ============== WEBSOCKET ============== */
  const connectSocket = useCallback(() => {
    if (!BaseURL) return;
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${BaseURL}/ws/manager/orders/`);
      socketRef.current = ws;

      ws.onopen = () => {
        setSocketConnected(true);
        console.log("Manager WebSocket Connected");
      };

      ws.onclose = () => {
        setSocketConnected(false);
        if (!reconnectRef.current) return;
        reconnectTimerRef.current = setTimeout(() => {
          if (reconnectRef.current) connectSocket();
        }, 5000);
      };

      ws.onerror = () => setSocketConnected(false);

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data.type === "new_order") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "🔥 New Order Received",
            text: `Order #${data.order_number}`,
            timer: 5000,
            showConfirmButton: false,
          });
          loadCarts();
          if (selectedCartId) loadSelectedCart(selectedCartId);
        }

        if (data.type === "order_update") {
          loadCarts();
          if (selectedCartId) loadSelectedCart(selectedCartId);
        }
      };
    } catch (error) {
      console.error(error);
    }
  }, [loadCarts, loadSelectedCart, selectedCartId]);

  /* ============== EFFECTS ============== */
  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  useEffect(() => {
    if (selectedCartId) loadSelectedCart(selectedCartId);
  }, [selectedCartId, loadSelectedCart]);

  useEffect(() => {
    reconnectRef.current = true;
    connectSocket();
    const timer = setInterval(loadCarts, 10000);

    return () => {
      reconnectRef.current = false;
      clearInterval(timer);
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${socketConnected ? "🟢 Online" : "🔴 Offline"} • Walk-In POS`;
  }, [socketConnected]);

  /* ============== RENDER ============== */
  return (
    <div className="walkin-page">
      {/* ============ HEADER ============ */}
      <motion.header
        className="walkin-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="walkin-header-text">
          <h1>Walk-In POS</h1>
          <p>Restaurant Point of Sale</p>
        </div>

        <div className={`socket-status ${socketConnected ? "online" : "offline"}`}>
          <FaBell />
          <span>{socketConnected ? "LIVE" : "OFFLINE"}</span>
        </div>
      </motion.header>

      {/* ============ LAYOUT ============ */}
      <main className="walkin-layout">
        <AnimatePresence mode="wait">
          <motion.aside
            key={`left-${mobileTab}`}
            className={`left-panel ${mobileTab !== "customers" ? "mobile-hide" : ""}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DraftCustomers
              loading={loading}
              carts={carts}
              selectedCartId={selectedCartId}
              setSelectedCartId={(id) => {
                setSelectedCartId(id);
                if (window.innerWidth < 993) setMobileTab("menu");
              }}
              createCustomerCart={createCustomerCart}
            />
          </motion.aside>

          <motion.section
            key={`center-${mobileTab}`}
            className={`center-panel ${mobileTab !== "menu" ? "mobile-hide" : ""}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MenuPanel
              selectedCart={selectedCart}
              refreshCart={() => loadSelectedCart(selectedCartId)}
            />
          </motion.section>

          <motion.aside
            key={`right-${mobileTab}`}
            className={`right-panel ${mobileTab !== "cart" ? "mobile-hide" : ""}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CustomerPanel
              selectedCart={selectedCart}
              refreshCart={() => loadSelectedCart(selectedCartId)}
            />
            <CartPanel
              selectedCart={selectedCart}
              refreshDrafts={loadCarts}
              onOrderPlaced={loadCarts}
            />
          </motion.aside>
        </AnimatePresence>
      </main>

      <MobileBottomNav active={mobileTab} setActive={setMobileTab} />
    </div>
  );
}