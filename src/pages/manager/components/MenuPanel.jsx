import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaPlus, FaTimesCircle, FaSync, FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";

import {
  getCategoriesByShop,
  getItemsByCategoryPublic,
} from "../../../service/menuItemService";
import { addItemToCart } from "../../../service/walkInService";

import "./CSS/MenuPanel.css";

export default function MenuPanel({ selectedCart, refreshCart }) {
  const shopId = localStorage.getItem("selected_shop");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(null);
  const [addedItems, setAddedItems] = useState(new Set());

  // load categories
  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategoriesByShop(shopId);
      setCategories(data || []);
      if (data?.length) setSelectedCategory(data[0].id);
    } catch (error) {
      Swal.fire("Error", "Unable to load categories.", "error");
    } finally {
      setLoading(false);
    }
  }

  // load items for selected category
  async function loadItems(categoryId) {
    if (!categoryId) return;
    try {
      setLoading(true);
      const data = await getItemsByCategoryPublic(categoryId);
      setItems(data || []);
    } catch {
      Swal.fire("Error", "Unable to load menu.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { if (selectedCategory) loadItems(selectedCategory); }, [selectedCategory]);

  // search filter
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  // ---------- ADD PRODUCT (INSTANT) ----------
  async function addProduct(product) {
    if (!selectedCart) {
      Swal.fire("Select Customer", "Please select a draft customer first.", "warning");
      return;
    }
    if (adding === product.id) return;

    try {
      setAdding(product.id);
      setAddedItems((prev) => new Set(prev).add(product.id));

      await addItemToCart(selectedCart.id, product.id, 1);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Added!",
        timer: 600,
        showConfirmButton: false,
      });

      refreshCart();

      setTimeout(() => {
        setAdding(null);
        setTimeout(() => {
          setAddedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
        }, 2000);
      }, 300);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Unable to add item.", "error");
      setAdding(null);
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  }

  return (
    <div className="menu-panel">
      {/* ---- search bar ---- */}
      <div className="menu-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="clear-search" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      {/* ---- category tabs ---- */}
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? "category-btn active" : "category-btn"}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* ---- HORIZONTAL SCROLL ITEMS ---- */}
      {loading ? (
        <div className="menu-loading-horizontal">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="menu-skeleton-horizontal" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="menu-empty">
          <FaTimesCircle />
          <h4>No Menu Found</h4>
          <p>Try another search or category.</p>
        </div>
      ) : (
        <div className="menu-scroll-wrapper">
          <div className="menu-horizontal-scroll">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
                  className={`menu-card-horizontal ${!item.is_available ? "out-of-stock" : ""} ${
                    addedItems.has(item.id) ? "just-added" : ""
                  }`}
                >
                  <div className="menu-body-horizontal">
                    <h4>{item.name}</h4>
                    {item.description && <p>{item.description}</p>}
                    <div className="menu-bottom-horizontal">
                      <div className="menu-price">₹{Number(item.base_price).toFixed(2)}</div>
                      <button
                        className={`add-cart-btn ${adding === item.id ? "adding" : ""}`}
                        disabled={!item.is_available || adding === item.id}
                        onClick={() => addProduct(item)}
                      >
                        {adding === item.id ? (
                          <FaSync className="spin" />
                        ) : addedItems.has(item.id) ? (
                          <FaCheck />
                        ) : (
                          <FaPlus />
                        )}
                        {adding === item.id ? "Adding" : addedItems.has(item.id) ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}