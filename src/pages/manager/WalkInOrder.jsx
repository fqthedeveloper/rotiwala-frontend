import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { FaBell, FaShoppingCart } from "react-icons/fa";

import {
  getWalkInCarts,
  getWalkInCart,
  createWalkInCart,
} from "../../service/walkInService";

import MenuPanel from "./components/MenuPanel";
import CartPanel from "./components/CartPanel";
import CustomerSelector from "./components/CustomerSelector";

import "./CSS/WalkInOrder.css";

const BaseURL = import.meta.env.VITE_WS_URL;

export default function WalkInOrder() {
  // ---- state ----
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const reconnectRef = useRef(true);
  const reconnectTimerRef = useRef(null);

  // ---- load carts ----
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
      if (!selectedCartId || !list.some((c) => c.id === selectedCartId)) {
        setSelectedCartId(list[0].id);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Unable to load customers." });
    } finally {
      setLoading(false);
    }
  }, [selectedCartId]);

  // ---- load single cart ----
  const loadSelectedCart = useCallback(async (id) => {
    if (!id) return;
    try {
      const cart = await getWalkInCart(id);
      setSelectedCart(cart);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // ---- create new customer ----
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
      Swal.fire({ toast: true, position: "top-end", timer: 1800, showConfirmButton: false, icon: "success", title: "New Customer Created" });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Unable to create customer." });
    }
  };

  // ---- socket ----
  const connectSocket = useCallback(() => {
    if (!BaseURL) return;
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${BaseURL}/ws/manager/orders/`);
      socketRef.current = ws;

      ws.onopen = () => setSocketConnected(true);
      ws.onclose = () => {
        setSocketConnected(false);
        if (!reconnectRef.current) return;
        reconnectTimerRef.current = setTimeout(() => {
          if (reconnectRef.current) connectSocket();
        }, 5000);
      };
      ws.onerror = () => setSocketConnected(false);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_order" || data.type === "order_update") {
            loadCarts();
            if (selectedCartId) loadSelectedCart(selectedCartId);
          }
        } catch {}
      };
    } catch (error) {
      console.error(error);
    }
  }, [loadCarts, loadSelectedCart, selectedCartId]);

  // ---- effects ----
  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  useEffect(() => {
    if (selectedCartId) loadSelectedCart(selectedCartId);
  }, [selectedCartId, loadSelectedCart]);

  useEffect(() => {
    reconnectRef.current = true;
    connectSocket();
    const timer = setInterval(loadCarts, 15000);
    return () => {
      reconnectRef.current = false;
      clearInterval(timer);
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
    // eslint-disable-next-line
  }, []);

  // ---- totals ----
  const totalItems = useMemo(() => {
    if (!selectedCart) return 0;
    return selectedCart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedCart]);

  // ---- render ----
  return (
    <div className="walkin-page">
      {/* header */}
      <header className="walkin-header">
        <div className="header-left">
          <h1>Walk‑In POS</h1>
          <div className={`socket-status ${socketConnected ? "online" : "offline"}`}>
            <FaBell />
            <span>{socketConnected ? "LIVE" : "OFFLINE"}</span>
          </div>
        </div>
      </header>

      {/* customer selector */}
      <CustomerSelector
        carts={carts}
        selectedCartId={selectedCartId}
        setSelectedCartId={setSelectedCartId}
        onCreateNew={createCustomerCart}
        loading={loading}
      />

      {/* main scrollable content */}
      <div className="walkin-content">
        {/* menu section */}
        <section className="menu-section">
          <MenuPanel
            selectedCart={selectedCart}
            refreshCart={() => loadSelectedCart(selectedCartId)}
          />
        </section>

        {/* cart + customer info section */}
        <section className="cart-section">
          <CartPanel
            selectedCart={selectedCart}
            refreshDrafts={loadCarts}
            onOrderPlaced={loadCarts}
          />
        </section>
      </div>
    </div>
  );
}