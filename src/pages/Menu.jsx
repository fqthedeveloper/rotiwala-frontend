import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaUtensils,
  FaFire,
  FaStar,
  FaCheckCircle,
  FaSortAmountDown,
} from "react-icons/fa";
import Swal from "sweetalert2";

import { getItemsPublic } from "../service/menuItemService";
import { addToCart } from "../service/cartService";

import "./CSS/Menu.css";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadMenu();
    document.title = "Menu - Roti Wala";
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getItemsPublic();
      if (!Array.isArray(data)) {
        setItems([]);
        return;
      }
      const uniqueItems = [];
      const names = new Set();
      data.forEach((item) => {
        const key = item.name.toLowerCase().trim();
        if (!names.has(key)) {
          names.add(key);
          uniqueItems.push(item);
        }
      });
      setItems(uniqueItems);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [...new Set(items.map((i) => i.category))];
  }, [items]);

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (search) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      data = data.filter(
        (item) => String(item.category) === String(category)
      );
    }

    if (maxPrice) {
      data = data.filter(
        (item) => parseFloat(item.base_price) <= parseFloat(maxPrice)
      );
    }

    if (availableOnly) {
      data = data.filter((item) => item.available !== false);
    }

    switch (sortBy) {
      case "price-low":
        data.sort(
          (a, b) => parseFloat(a.base_price) - parseFloat(b.base_price)
        );
        break;
      case "price-high":
        data.sort(
          (a, b) => parseFloat(b.base_price) - parseFloat(a.base_price)
        );
        break;
      case "name":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return data;
  }, [items, search, category, sortBy, maxPrice, availableOnly]);

  const handleAddCart = async (item) => {
    try {
      await addToCart(item.id, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      Swal.fire({
        icon: "success",
        title: "Added To Cart",
        text: `${item.name} added successfully`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.error || "Unable to add item",
      });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMaxPrice("");
    setSortBy("default");
    setAvailableOnly(false);
  };

  const activeFiltersCount =
    (search ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0) +
    (availableOnly ? 1 : 0);

  return (
    <div className="menu-page">
      {/* ============ HERO ============ */}
      <motion.section
        className="menu-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="menu-hero-blob mh-blob-1" />
        <div className="menu-hero-blob mh-blob-2" />
        <div className="menu-hero-grain" />

        <motion.span
          className="menu-kicker"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FaUtensils /> Our Full Menu
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          Explore <span className="menu-grad-text">Delicious</span> Foods
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Handpicked meals from all our shops — fresh, hot & affordable.
        </motion.p>

        <motion.div
          className="menu-count-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 200 }}
        >
          <FaFire /> {filteredItems.length} Foods Available
        </motion.div>
      </motion.section>

      {/* ============ FILTER BAR ============ */}
      <motion.div
        className="filter-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="filter-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search for food, dish, snack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Max Price</label>
            <input
              type="number"
              placeholder="₹ 999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label>
              <FaSortAmountDown /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span className="toggle-slider" />
            <span className="toggle-label">Available Only</span>
          </label>

          {activeFiltersCount > 0 && (
            <button className="clear-all-btn" onClick={resetFilters}>
              <FaTimes /> Clear ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Mobile filter trigger */}
        <button
          className="mobile-filter-trigger"
          onClick={() => setShowMobileFilters(true)}
        >
          <FaFilter /> Filters
          {activeFiltersCount > 0 && (
            <span className="filter-count">{activeFiltersCount}</span>
          )}
        </button>
      </motion.div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              className="mobile-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              className="mobile-filter-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="drawer-handle" />
              <div className="drawer-header">
                <h3>
                  <FaFilter /> Filters
                </h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="drawer-body">
                <div className="filter-field">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        Category {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label>Max Price</label>
                  <input
                    type="number"
                    placeholder="₹ 999"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="filter-field">
                  <label>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                  <span className="toggle-label">Available Only</span>
                </label>
              </div>

              <div className="drawer-footer">
                <button className="drawer-reset" onClick={resetFilters}>
                  Reset
                </button>
                <button
                  className="drawer-apply"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ LOADING SKELETONS ============ */}
      {loading && (
        <div className="menu-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line w-70" />
                <div className="skeleton-line w-90" />
                <div className="skeleton-line w-50" />
                <div className="skeleton-line w-100 tall" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ EMPTY STATE ============ */}
      {!loading && filteredItems.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">🍽️</div>
          <h3>No Food Found</h3>
          <p>Try adjusting your filters or search keyword.</p>
          <button onClick={resetFilters} className="empty-reset">
            Reset Filters
          </button>
        </motion.div>
      )}

      {/* ============ ITEMS GRID ============ */}
      {!loading && filteredItems.length > 0 && (
        <motion.div
          className="menu-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              className="m-food-card"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="m-food-img-wrap">
                <img
                  src={item.image_url || item.image || "/food-placeholder.jpg"}
                  alt={item.name}
                  className="m-food-img"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/food-placeholder.jpg")}
                />
                <span className="m-food-badge">
                  <FaFire /> Hot
                </span>
                {item.available !== false && (
                  <span className="m-food-avail">
                    <FaCheckCircle /> Available
                  </span>
                )}
                <div className="m-food-overlay" />
              </div>

              <div className="m-food-body">
                <div className="m-food-top">
                  <h4>{item.name}</h4>
                  <div className="m-food-rating">
                    <FaStar /> 4.{5 + (idx % 4)}
                  </div>
                </div>

                <p className="m-food-desc">
                  {item.description
                    ? item.description.slice(0, 95)
                    : "Delicious freshly prepared food."}
                </p>

                <div className="m-food-footer">
                  <div className="m-food-price">
                    ₹ {parseFloat(item.base_price).toFixed(2)}
                  </div>
                  <motion.button
                    className="m-add-btn"
                    onClick={() => handleAddCart(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart /> Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Menu;