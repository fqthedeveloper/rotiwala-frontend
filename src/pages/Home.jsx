// src/pages/Home.jsx

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import Swal from "sweetalert2";

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

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (nearestShop) {
      loadMenu(nearestShop.id);
    }
  }, [nearestShop]);

  const loadLocation = () => {
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
        } finally {
          setLoading(false);
        }
      },

      async () => {
        const data = await getShopsPublic();

        setShops(data);

        setLoading(false);
      },
    );
  };

  const loadMenu = async (shopId) => {
    try {
      const categoryData = await getCategoriesByShopPublic(shopId);

      setCategories(categoryData);

      let allItems = [];

      for (const category of categoryData) {
        const items = await getItemsByCategoryPublic(category.id);

        allItems = [...allItems, ...items];
      }

      setMenuItems(allItems);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllShops = async () => {
    const data = await getShopsPublic();

    setShops(data);

    setShowShops(true);
  };

  const selectShop = (shop) => {
    setNearestShop(shop);

    localStorage.setItem("selected_shop", shop.id);

    setShowShops(false);
  };

  const handleAddCart = async (item) => {
    try {
      await addToCart({
        menu_item: item.id,

        quantity: 1,
      });

      Swal.fire({
        icon: "success",

        title: "Added To Cart",

        timer: 1200,

        showConfirmButton: false,
      });
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
      {/* HERO */}

      <motion.section
        className="hero-section"
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        <div className="hero-content">
          <span className="hero-badge">🔥 Fresh & Fast Delivery</span>

          <h1>
            Delicious Food
            <br />
            Delivered To Your Door
          </h1>

          <p>Hot Roti, Fresh Meals, Quick Pickup & Delivery.</p>

          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={loadAllShops}>
              Explore Shops
            </button>

            <Link to="/menu" className="hero-btn secondary">
              View Menu
            </Link>
          </div>
        </div>

        <div className="hero-image">🍕🍔🌮🥗🥤</div>
      </motion.section>

      {/* SHOP CARD */}

      {nearestShop && (
        <motion.div
          className="shop-card"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
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

      {/* CATEGORY SCROLLER */}

      {categories.length > 0 && (
        <div className="category-section">
          <h2>Browse Categories</h2>

          <div className="category-scroll">
            {categories.map((category) => (
              <div key={category.id} className="category-pill">
                {category.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOP LIST */}

      {showShops && (
        <div className="shops-grid">
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              className="shop-select-card"
              whileHover={{
                y: -10,
              }}
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
        </div>
      )}

      {/* POPULAR MENU HEADER */}

      <div className="section-title">
        <h2>Popular Menu</h2>

        <p>Freshly prepared dishes for you</p>
      </div>
      {/* MENU GRID */}

      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="food-card"
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * 0.05,
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
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
                  ? item.description.slice(0, 80)
                  : "Delicious freshly prepared food."}
              </p>

              <div className="food-footer">
                <h3>₹ {item.base_price || item.price}</h3>
              </div>

              <div className="food-actions">
                <button
                  className="add-cart-btn"
                  onClick={() => handleAddCart(item)}
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
      </div>

      {/* OFFER SECTION */}

      <motion.section
        className="offer-section"
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
      >
        <div className="offer-content">
          <span>🎉 Limited Time Offer</span>

          <h2>Get 20% OFF</h2>

          <p>On your first order from Roti Wala</p>

          <div className="offer-code">ROTI20</div>
        </div>
      </motion.section>

      {/* STATS */}

      <section className="stats-section">
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
      </section>

      {/* WHY CHOOSE US */}

      <section className="why-section">
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
      </section>

      {/* FLOATING CART */}

      <Link to="/cart" className="floating-cart">
        🛒 Cart
      </Link>
    </div>
  );
}
