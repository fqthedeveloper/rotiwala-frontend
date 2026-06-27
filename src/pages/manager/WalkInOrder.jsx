import { useEffect, useState, useCallback, useRef } from "react";
import Swal from "sweetalert2";

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
import { header } from "framer-motion/client";

import {FaBell} from "react-icons/fa";

const BaseURL = "127.0.0.1:8000";


export default function WalkInOrder() {
  /*
    =====================================================
    MOBILE TAB
    =====================================================
    */

  const [mobileTab, setMobileTab] = useState("menu");

  /*
    =====================================================
    DATA
    =====================================================
    */

  const [loading, setLoading] = useState(true);

  const [carts, setCarts] = useState([]);

  const [selectedCartId, setSelectedCartId] = useState(null);

  const [selectedCart, setSelectedCart] = useState(null);

  const [socketConnected, setSocketConnected] = useState(false);
  
  const socketRef = useRef(null);
  
  /*
    =====================================================
    LOAD CART LIST
    =====================================================
    */

  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);

      let list = await getWalkInCarts();

      list = list || [];

      /*
            --------------------------------------------
            AUTO CREATE FIRST DRAFT
            --------------------------------------------
            */

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

      /*
            --------------------------------------------
            AUTO SELECT
            --------------------------------------------
            */

      if (!selectedCartId && list.length) {
        setSelectedCartId(list[0].id);
      }
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",

        title: "Error",

        text: "Unable to load Draft Customers.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCartId]);

  /*
    =====================================================
    LOAD SINGLE CART
    =====================================================
    */

  const loadSelectedCart = useCallback(async (id) => {
    if (!id) return;

    try {
      const cart = await getWalkInCart(id);

      setSelectedCart(cart);
    } catch (error) {
      console.log(error);
    }
  }, []);

  /*
    =====================================================
    CREATE CUSTOMER
    =====================================================
    */

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

  /*
    =====================================================
    FIRST LOAD & Socket Load
    =====================================================
    */

  useEffect(() => {
    loadCarts();
    
  }, [loadCarts]);

  /*
    =====================================================
    LOAD SELECTED
    =====================================================
    */

  useEffect(() => {
    if (selectedCartId) {
      loadSelectedCart(selectedCartId);
    }
  }, [selectedCartId, loadSelectedCart]);

  /*
    =====================================================
    AUTO REFRESH
    =====================================================
    */

  useEffect(() => {
    const timer = setInterval(() => {
      loadCarts();
    }, 10000);

    connectSocket();

    return () => clearInterval(timer);
  }, [loadCarts]);

// ===================
// Sockit code header
// ===================

const connectSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";

      socketRef.current = new WebSocket(
        `${protocol}://${BaseURL}/ws/manager/orders/`,
      );

      socketRef.current.onopen = () => {
        setSocketConnected(true);

        console.log("Manager WebSocket Connected");
      };

      socketRef.current.onclose = () => {
        setSocketConnected(false);

        setTimeout(() => {
          connectSocket();
        }, 5000);
      };

      socketRef.current.onerror = () => {
        setSocketConnected(false);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

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

          loadOrders();
        }

        if (data.type === "order_update") {
          loadOrders();
        }
      };
    } catch (error) {
      console.log(error);
    }
  };


  /*
    =====================================================
    RENDER
    =====================================================
    */



  return (
    <div className="walkin-page">
      {/* =======================================
                HEADER
            ======================================== */}

      <header className="walkin-header">
        <div>
          <h1>Walk-In POS</h1>

          <p>Restaurant Point of Sale</p>
        </div>

        <div
          className={`socket-status ${socketConnected ? "online" : "offline"}`}
        >
          <FaBell />

          {socketConnected ? "LIVE" : "OFFLINE"}
        </div>
      </header>

      {/* =======================================
                MAIN LAYOUT
            ======================================== */}

      <main className="walkin-layout">
        {/* ===============================
                    LEFT PANEL
                ================================ */}

        <aside
          className={`left-panel ${
            mobileTab !== "customers" ? "mobile-hide" : ""
          }`}
        >
          <DraftCustomers
            loading={loading}
            carts={carts}
            selectedCartId={selectedCartId}
            setSelectedCartId={setSelectedCartId}
            createCustomerCart={createCustomerCart}
          />
        </aside>

        {/* ===============================
                    CENTER PANEL
                ================================ */}

        <section
          className={`center-panel ${
            mobileTab !== "menu" ? "mobile-hide" : ""
          }`}
        >
          <MenuPanel
            selectedCart={selectedCart}
            refreshCart={() => loadSelectedCart(selectedCartId)}
          />
        </section>

        {/* ===============================
                    RIGHT PANEL
                ================================ */}

        <aside
          className={`right-panel ${mobileTab !== "cart" ? "mobile-hide" : ""}`}
        >
          <CustomerPanel
            selectedCart={selectedCart}
            refreshCart={() => loadSelectedCart(selectedCartId)}
          />

          <CartPanel
            selectedCart={selectedCart}
            refreshCart={() => loadSelectedCart(selectedCartId)}
          />
        </aside>
      </main>

      {/* =======================================
                MOBILE NAVIGATION
            ======================================== */}

      <MobileBottomNav active={mobileTab} setActive={setMobileTab} />
    </div>
  );
}
