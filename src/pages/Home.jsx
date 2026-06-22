import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import Swal from "sweetalert2";

import { FaWhatsapp } from "react-icons/fa";

import "./CSS/Home.css";

import { getNearestShop, getShopsPublic } from "../service/shopService";

import {
  getCategoriesByShopPublic,
  getItemsByCategoryPublic,
} from "../service/menuItemService";

import { addToCart } from "../service/cartService";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nearestShop, setNearestShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [showShops, setShowShops] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    loadLocation();
    document.title = "Home - Roti Wala";
  }, []);

  useEffect(() => {
    if (nearestShop) {
      loadMenu(nearestShop.id);
    }
  }, [nearestShop]);

  const fetchAllShops = async () => {
    try {
      const data = await getShopsPublic();
      setShops(data);
      setShowShops(true);
    } catch (error) {
      console.log(error);
    }
  };

  const loadLocation = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      fetchAllShops();
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const nearest = await getNearestShop(
            position.coords.latitude,
            position.coords.longitude,
          );

          setNearestShop(nearest);
          localStorage.setItem("selected_shop", nearest.id);
        } catch (error) {
          console.log(error);
          setLocationDenied(true);
          await fetchAllShops();
        } finally {
          setLoading(false);
        }
      },
      async () => {
        setLocationDenied(true);
        await fetchAllShops();
        setLoading(false);
      },
    );
  };

  const loadMenu = async (shopId) => {
    try {
      const categoryData = await getCategoriesByShopPublic(shopId);
      setCategories(categoryData);

      const allItems = [];
      for (const category of categoryData) {
        const items = await getItemsByCategoryPublic(category.id);
        allItems.push(...items);
      }

      setMenuItems(allItems);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllShops = async () => {
    await fetchAllShops();
  };

  const selectShop = (shop) => {
    setNearestShop(shop);
    localStorage.setItem("selected_shop", shop.id);
    setShowShops(false);
  };

  const handleAddCart = async (item) => {
    try {
      await addToCart(item.id, 1);

      // Refresh Header Cart Badge
      window.dispatchEvent(new Event("cartUpdated"));

      Swal.fire({
        icon: "success",
        title: "Added To Cart",
        text: `${item.name} added successfully`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.error || "Unable to add item",
      });
    }
  };

  const updateCartCount = async () => {
    try {
      const data = await getCartCount();

      console.log("Cart Count Response:", data);

      setCartCount(data.count || 0);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="home-loader">
        <div className="loader-circle" />
      </div>
    );
  }

  return (
    <div className="home-page">
      <motion.section
        className="hero-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          <span className="hero-badge">🔥 Fresh & Fast Making</span>

          <h1>Delicious Food</h1>

          <p>
            Hot roti, mouthwatering meals, and express delivery from your
            nearest shop.
          </p>

          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={loadAllShops}>
              Explore Shops
            </button>
            <Link to="/menu" className="hero-btn secondary">
              View Full Menu
            </Link>
          </div>

          <div className="hero-meta">
            <div>
              <strong>{menuItems.length}</strong>
              <span>Popular Dishes</span>
            </div>
            <div>
              <strong>{shops.length}</strong>
              <span>Nearby Shops</span>
            </div>
            <div>
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
        >
          🍕🍔🌮🥗🥤
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {locationDenied && !nearestShop && !showShops && (
          <motion.div
            className="info-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            Location is unavailable. Choose a shop manually to see menu items.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nearestShop && !showShops && (
          <motion.div
            className="shop-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.45 }}
          >
            <div className="shop-info">
              <h2>📍 {nearestShop.name}</h2>
              <p>{nearestShop.address}</p>
              <span>📞 {nearestShop.phone}</span>
            </div>

            <div className="shop-actions">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShop.latitude},${nearestShop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="navigate-btn"
              >
                Navigate
              </a>
              <button className="change-btn" onClick={loadAllShops}>
                Change Shop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showShops && (
        <motion.div
          className="shops-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              className="shop-select-card"
              whileHover={{ y: -10, scale: 1.01 }}
              transition={{ duration: 0.25 }}
            >
              <h4>{shop.name}</h4>
              <p>{shop.address}</p>
              <button
                className="select-shop-btn"
                onClick={() => selectShop(shop)}
              >
                Select Shop
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <br />

      <div className="section-title">
        <h2>Popular Menu</h2>
        <p>Freshly prepared dishes for you</p>
      </div>

      <motion.div
        className="menu-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="food-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.45 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="food-image-wrapper">
              <img
                src={item.image_url ? item.image_url : "/food-placeholder.jpg"}
                alt={item.name}
                className="food-image"
              />
              <div className="food-badge">⭐ Popular</div>
            </div>
            <div className="food-body">
              <h4>{item.name}</h4>
              <p>
                {item.description
                  ? item.description.slice(0, 90)
                  : "Delicious freshly prepared food."}
              </p>
              <div className="food-footer">
                <h3>₹ {item.base_price || item.price}</h3>
              </div>
              <div className="food-actions">
                <button
                  className="add-cart-btn"
                  onClick={() => handleAddCart(item) || updateCartCount(item)}
                >
                  Add To Cart
                </button>
                <button
                  className="details-btn"
                  onClick={() => navigate(`/menu-item/${item.id}`)}
                >
                  Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="stat-card">
          <h2>10+</h2>
          <span>Shops</span>
        </div>
        <div className="stat-card">
          <h2>500+</h2>
          <span>Daily Orders</span>
        </div>
        <div className="stat-card">
          <h2>100+</h2>
          <span>Menu Items</span>
        </div>
        <div className="stat-card">
          <h2>5K+</h2>
          <span>Happy Customers</span>
        </div>
      </motion.section>

      <motion.section
        className="why-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="why-card">
          🚚
          <h4>Fast Delivery</h4>
          <p>Quick pickup and delivery from nearby shops.</p>
        </div>
        <div className="why-card">
          🍲
          <h4>Fresh Food</h4>
          <p>Prepared fresh every day by trusted vendors.</p>
        </div>
        <div className="why-card">
          💳
          <h4>Easy Payments</h4>
          <p>Secure and simple payment process.</p>
        </div>
        <div className="why-card">
          ⭐<h4>Best Quality</h4>
          <p>Hygienic and quality checked meals.</p>
        </div>
      </motion.section>
      <a
        href="https://wa.me/919876543210"
        className="floating-cart"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp size={22} />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
