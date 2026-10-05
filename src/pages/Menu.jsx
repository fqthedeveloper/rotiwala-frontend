import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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

import {
  getPublicMenuItems,
  getCategoriesByShopPublic,
  getPublicCategories,
} from "../service/menuItemService";
import { addToCart } from "../service/cartService";
import { getNearestShop, getShopsPublic } from "../service/shopService";
import { getServerImageUrl } from "../utils/imageUtils";
import OnlineOrderStatus from "../components/order-capacity/OnlineOrderStatus";
import VariantSelectModal from "../components/menu/VariantSelectModal";

import "./CSS/Menu.css";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(
    localStorage.getItem("selected_shop") || ""
  );
  const [shops, setShops] = useState([]);
  const [currentShop, setCurrentShop] = useState(null);
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [variantModalItem, setVariantModalItem] = useState(null);

  useEffect(() => {
    document.title = "Menu - Roti Wala";
    // prefer shop from URL query param when present
    const params = new URLSearchParams(location.search);
    const qShop = params.get("shop");
    if (qShop) {
      localStorage.setItem("selected_shop", qShop);
      setShopId(qShop);
    }

    initShopAndLocation(qShop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (shopId) {
      loadMenu(shopId);
    }
  }, [shopId]);

  const initShopAndLocation = async (forcedShopId) => {
    // 1. Fetch available shops immediately
    let allShops = [];
    try {
      allShops = await getShopsPublic();
      if (Array.isArray(allShops)) {
        setShops(allShops);
      }
    } catch (e) {
      console.warn("Could not fetch shops in Menu:", e);
    }

    // 2. Select initial shop immediately
    let initialShopId = forcedShopId || shopId || localStorage.getItem("selected_shop");
    let chosenShop = null;
    if (initialShopId && allShops.length > 0) {
      chosenShop = allShops.find((s) => String(s.id) === String(initialShopId));
    }
    if (!chosenShop && allShops.length > 0) {
      chosenShop = allShops[0];
    }

    if (chosenShop) {
      setCurrentShop(chosenShop);
      setShopId(chosenShop.id);
      localStorage.setItem("selected_shop", chosenShop.id);
    }

    // 3. In parallel, query browser geolocation to automatically detect nearest shop
    if (!forcedShopId && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const nearest = await getNearestShop(
              pos.coords.latitude,
              pos.coords.longitude
            );
            if (nearest?.id) {
              localStorage.setItem("selected_shop", nearest.id);
              setShopId(nearest.id);
              setCurrentShop(nearest);
            }
          } catch (error) {
            console.warn("Error finding nearest shop in Menu:", error);
          }
        },
        (err) => {
          console.warn("Geolocation not available in Menu:", err);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  };

  const loadMenu = async (shopIdToLoad) => {
    try {
      setLoading(true);
      const data = await getPublicMenuItems({ shop: shopIdToLoad, shop_id: shopIdToLoad });

      if (!Array.isArray(data)) {
        setItems([]);
        return;
      }

      const uniqueItems = [];
      const names = new Set();
      data.forEach((item) => {
        const key = (item.name || "").toLowerCase().trim();
        if (!names.has(key)) {
          names.add(key);
          uniqueItems.push(item);
        }
      });
      setItems(uniqueItems);
    } catch (error) {
      console.error("Error loading menu:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [...new Set(items.map((i) => i.category_name || i.category))].filter(Boolean);
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
        (item) =>
          String(item.category_name || item.category).toLowerCase() ===
          String(category).toLowerCase()
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
    if (item.has_variants && item.variants && item.variants.length > 0) {
      setVariantModalItem(item);
      return;
    }
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

  const handleVariantAddToCart = async (item, selectedVariant, quantity) => {
    try {
      await addToCart(item.id, quantity, selectedVariant.id);
      window.dispatchEvent(new Event("cartUpdated"));
      setVariantModalItem(null);
      Swal.fire({
        icon: "success",
        title: "Added To Cart",
        text: `${item.name} (${selectedVariant.name}) × ${quantity} added successfully`,
        timer: 1400,
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
      <OnlineOrderStatus />
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
          {currentShop?.name
            ? `Freshly baked rotis & authentic naans from ${currentShop.name}`
            : "Handpicked meals from our nearest bakery shop — fresh, hot & affordable."}
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
          {shops.length > 0 && (
            <div className="filter-field">
              <label>Branch / Shop</label>
              <select
                value={shopId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setShopId(newId);
                  localStorage.setItem("selected_shop", newId);
                  const found = shops.find((s) => String(s.id) === String(newId));
                  if (found) setCurrentShop(found);
                }}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
                {shops.length > 0 && (
                  <div className="filter-field">
                    <label>Branch / Shop</label>
                    <select
                      value={shopId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setShopId(newId);
                        localStorage.setItem("selected_shop", newId);
                        const found = shops.find((s) => String(s.id) === String(newId));
                        if (found) setCurrentShop(found);
                      }}
                    >
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="filter-field">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
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
                  src={getServerImageUrl(item.image_url || item.image)}
                  alt={item.name}
                  className="m-food-img"
                  loading="lazy"
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
                  {(item.category_name || item.category) && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#998075",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.category_name || item.category}
                    </span>
                  )}
                </div>

                <p className="m-food-desc">
                  {item.description
                    ? item.description.slice(0, 95)
                    : "Delicious freshly prepared food."}
                </p>

                <div className="m-food-footer">
                  <div className="m-food-price">
                    {item.has_variants && item.min_price != null ? (
                      item.min_price === item.max_price ? (
                        <>₹ {parseFloat(item.min_price).toFixed(2)}</>
                      ) : (
                        <>₹ {parseFloat(item.min_price).toFixed(2)} - ₹ {parseFloat(item.max_price).toFixed(2)}</>
                      )
                    ) : (
                      <>
                        ₹ {parseFloat(item.final_price || item.base_price).toFixed(2)}
                        {item.has_discount && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              opacity: 0.5,
                              fontSize: "0.8em",
                              marginLeft: 6,
                            }}
                          >
                            ₹ {parseFloat(item.original_price || item.base_price).toFixed(2)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <motion.button
                    className="m-add-btn"
                    onClick={() => handleAddCart(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart /> {item.has_variants && item.variants?.length > 0 ? "Options" : "Add"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ============ VARIANT SELECTION MODAL ============ */}
      <VariantSelectModal
        item={variantModalItem}
        isOpen={!!variantModalItem}
        onClose={() => setVariantModalItem(null)}
        onAddToCart={handleVariantAddToCart}
      />
    </div>
  );
};

export default Menu;