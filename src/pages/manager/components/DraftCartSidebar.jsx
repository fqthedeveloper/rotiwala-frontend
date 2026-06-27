import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import Swal from "sweetalert2";

import {
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaPhone,
  FaClock,
  FaRupeeSign,
  FaFilter,
} from "react-icons/fa";

import {
  getWalkInCarts,
  createWalkInCart,
} from "../../../service/walkInService";

import "./CSS/DraftCartSidebar.css";

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
  async function loadDrafts() {
    try {
      setLoading(true);

      const response = await getWalkInCarts();

      setCarts(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadDrafts();
  }, [refreshKey]);
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
      Swal.fire(
        "Error",

        "Unable to create draft.",

        "error",
      );
    } finally {
      setCreating(false);
    }
  }
  const visibleDrafts = useMemo(() => {
    let list = [...carts];

    if (filter !== "all") {
      list = list.filter((cart) => cart.status === filter);
    }

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();

      list = list.filter(
        (cart) =>
          (cart.customer_name || "")

            .toLowerCase()

            .includes(keyword) ||
          (cart.customer_phone || "").includes(keyword) ||
          (cart.cart_number || "")

            .toLowerCase()

            .includes(keyword),
      );
    }

    return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [carts, search, filter]);
  function formatTime(time) {
    if (!time) return "";

    return new Date(time).toLocaleTimeString(
      [],

      {
        hour: "2-digit",

        minute: "2-digit",
      },
    );
  }
  function money(value) {
    return Number(value || 0).toFixed(2);
  }

  return (
    <div className="draft-sidebar">
      <div className="draft-header">
        <div>
          <h3>Draft Orders</h3>

          <span>{visibleDrafts.length} Active Drafts</span>
        </div>

        <button
          className="new-draft-btn"
          onClick={createDraft}
          disabled={creating}
        >
          <FaPlus />

          {creating ? "Creating..." : "New"}
        </button>
      </div>
      <div className="draft-search">
        <FaSearch />

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="draft-filter">
        {["all", "draft", "accepted", "preparing", "ready"].map((status) => (
          <button
            key={status}
            className={filter === status ? "active" : ""}
            onClick={() => setFilter(status)}
          >
            <FaFilter />

            {status}
          </button>
        ))}
      </div>
      {loading && (
        <div className="draft-loading">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="draft-skeleton" />
          ))}
        </div>
      )}

      {!loading && visibleDrafts.length === 0 && (
        <div className="draft-empty">
          <FaShoppingCart />

          <h4>No Draft Orders</h4>

          <p>Create a new draft order to begin.</p>
        </div>
      )}
      <div className="draft-list">
        <AnimatePresence>
          {visibleDrafts.map((cart) => (
            <motion.div
              layout
              key={cart.id}
              initial={{
                opacity: 0,

                y: 15,
              }}
              animate={{
                opacity: 1,

                y: 0,
              }}
              exit={{
                opacity: 0,

                x: -30,
              }}
              transition={{
                duration: 0.2,
              }}
              className={
                cart.id === selectedCartId ? "draft-card active" : "draft-card"
              }
              onClick={() => setSelectedCartId(cart.id)}
            >
              <div className="draft-avatar">
                {(cart.customer_name || "Walk In")

                  .substring(
                    0,

                    1,
                  )

                  .toUpperCase()}
              </div>
              <div className="draft-content">
                <h5>{cart.customer_name || "Walk-In Customer"}</h5>

                <div className="draft-row">
                  <FaPhone />

                  <span>{cart.customer_phone || "No Phone"}</span>
                </div>

                <div className="draft-row">
                  <FaShoppingCart />

                  <span>
                    {cart.total_items}
                    Items
                  </span>
                </div>
              </div>
              <div className="draft-right">
                <div className="draft-price">
                  <FaRupeeSign />

                  {money(cart.total_amount)}
                </div>

                <div className="draft-time">
                  <FaClock />

                  {formatTime(cart.updated_at)}
                </div>

                <div className={`draft-status ${cart.status}`}>
                  {cart.status}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
