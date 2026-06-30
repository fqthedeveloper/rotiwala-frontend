import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaPhone,
  FaClock,
  FaRupeeSign,
  FaTimes,
} from "react-icons/fa";

import {
  getWalkInCarts,
  createWalkInCart,
} from "../../../service/walkInService";

import "./CSS/DraftCartSidebar.css";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

export default function DraftCartSidebar({
  selectedCartId,
  setSelectedCartId,
  refreshKey,
  onDraftCreated,
}) {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [carts, setCarts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* ============ LOAD ============ */
  async function loadDrafts() {
    try {
      setLoading(true);
      const response = await getWalkInCarts();
      setCarts(response || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, [refreshKey]);

  /* ============ CREATE ============ */
  async function createDraft() {
    try {
      setCreating(true);
      const draft = await createWalkInCart({
        customer_name: "",
        customer_phone: "",
        payment_method: "cash",
        notes: "",
      });

      await loadDrafts();
      setSelectedCartId(draft.id);
      onDraftCreated?.(draft);

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Draft Created",
        timer: 1200,
        position: "top-end",
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "Unable to create draft.", "error");
    } finally {
      setCreating(false);
    }
  }

  /* ============ FILTER ============ */
  const visibleDrafts = useMemo(() => {
    let list = [...carts];

    if (filter !== "all") {
      list = list.filter((cart) => cart.status === filter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (cart) =>
          (cart.customer_name || "").toLowerCase().includes(q) ||
          (cart.customer_phone || "").includes(q) ||
          (cart.cart_number || "").toLowerCase().includes(q),
      );
    }

    return list.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
    );
  }, [carts, search, filter]);

  /* ============ HELPERS ============ */
  const formatTime = (time) =>
    !time
      ? ""
      : new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

  const money = (value) => Number(value || 0).toFixed(2);

  /* ============ COUNT BY STATUS ============ */
  const statusCount = useMemo(() => {
    const map = { all: carts.length };
    STATUS_TABS.slice(1).forEach((t) => {
      map[t.key] = carts.filter((c) => c.status === t.key).length;
    });
    return map;
  }, [carts]);

  /* ============ RENDER ============ */
  return (
    <div className="draft-sidebar">
      {/* ===== HEADER ===== */}
      <div className="draft-header">
        <div className="draft-header-text">
          <h3>Draft Orders</h3>
          <span>{visibleDrafts.length} Active</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="new-draft-btn"
          onClick={createDraft}
          disabled={creating}
        >
          <FaPlus />
          <span>{creating ? "Creating..." : "New"}</span>
        </motion.button>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="draft-search">
        <FaSearch />
        <input
          type="text"
          placeholder="Search customer, phone, cart #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="draft-filter">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={filter === tab.key ? "active" : ""}
            onClick={() => setFilter(tab.key)}
          >
            <span>{tab.label}</span>
            <em>{statusCount[tab.key] ?? 0}</em>
          </button>
        ))}
      </div>

      {/* ===== LIST ===== */}
      <div className="draft-list">
        {loading && (
          <div className="draft-loading">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="draft-skeleton" />
            ))}
          </div>
        )}

        {!loading && visibleDrafts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="draft-empty"
          >
            <FaShoppingCart />
            <h4>No Draft Orders</h4>
            <p>Click "New" to create a fresh walk-in order.</p>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading &&
            visibleDrafts.map((cart) => {
              const active = cart.id === selectedCartId;
              const name = cart.customer_name || "Walk-In Customer";
              const initial = name.substring(0, 1).toUpperCase();

              return (
                <motion.div
                  key={cart.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  className={`draft-card ${active ? "active" : ""}`}
                  onClick={() => setSelectedCartId(cart.id)}
                >
                  <div className="draft-avatar">{initial}</div>

                  <div className="draft-content">
                    <div className="draft-top-row">
                      <h5>{name}</h5>
                      <div className={`draft-status ${cart.status}`}>
                        {cart.status}
                      </div>
                    </div>

                    <div className="draft-meta">
                      <div className="draft-row">
                        <FaPhone />
                        <span>{cart.customer_phone || "No Phone"}</span>
                      </div>
                      <div className="draft-row">
                        <FaShoppingCart />
                        <span>{cart.total_items} Items</span>
                      </div>
                    </div>

                    <div className="draft-bottom-row">
                      <div className="draft-price">
                        <FaRupeeSign />
                        {money(cart.total_amount)}
                      </div>
                      <div className="draft-time">
                        <FaClock />
                        <span>{formatTime(cart.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}