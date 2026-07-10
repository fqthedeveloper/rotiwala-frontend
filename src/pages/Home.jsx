// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaWhatsapp,
  FaTruck,
  FaUtensils,
  FaCreditCard,
  FaStar,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaLocationArrow,
  FaExchangeAlt,
  FaShoppingCart,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaPizzaSlice,
  FaHamburger,
  FaIceCream,
  FaCoffee,
  FaBreadSlice,
  FaCarrot,
  FaLeaf,
  FaDrumstickBite,
} from "react-icons/fa";
import "./CSS/Home.css";

import { getNearestShop, getShopsPublic } from "../service/shopService";
import {
  getCategoriesByShopPublic,
  getItemsByCategoryPublic,
} from "../service/menuItemService";
import { addToCart } from "../service/cartService";
import Loader from "../components/common/Loader"; // Import the loader
import { useLoading } from "../context/LoadingContext"; // Import loading context

/* -------------------- STATIC DATA -------------------- */
const TOP_CATEGORIES = [
  { icon: <FaBreadSlice />, name: "Roti & Breads", color: "#ff9800" },
  { icon: <FaPizzaSlice />, name: "Pizza", color: "#ef4444" },
  { icon: <FaHamburger />, name: "Burgers", color: "#f59e0b" },
  { icon: <FaDrumstickBite />, name: "Non-Veg", color: "#dc2626" },
  { icon: <FaLeaf />, name: "Healthy", color: "#16a34a" },
  { icon: <FaCarrot />, name: "Veggies", color: "#f97316" },
  { icon: <FaIceCream />, name: "Desserts", color: "#ec4899" },
  { icon: <FaCoffee />, name: "Beverages", color: "#92400e" },
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "Daily Customer",
    text: "The roti is always hot, fresh, and arrives within minutes. Absolutely love the taste — feels just like home!",
    rating: 5,
    avatar: "/#",
  },
  {
    name: "Priya Verma",
    role: "Food Blogger",
    text: "Best in town! Hygienic, quick delivery, and the menu variety is incredible. Roti Wala has my heart.",
    rating: 5,
    avatar: "/#",
  },
  {
    name: "Rahul Mehta",
    role: "Office Goer",
    text: "Lunch problem solved forever. Affordable, tasty, and always on time. My whole team orders daily now!",
    rating: 5,
    avatar: "/#",
  },
  {
    name: "Sneha Kapoor",
    role: "Home Maker",
    text: "Saves me so much time. Quality is consistent and packaging is super clean. Truly impressed!",
    rating: 5,
    avatar: "/#",
  },
];

const FLOATING_FOODS = [
  "🫓", "🫓", "🫓", "🫓", "🫓", "🫓", "🫓", "🫓", 
  "🫓", "🫓", "🫓", "🫓", "🫓", "🫓"
];

/* -------------------- COMPONENT -------------------- */
export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  // Use loading context
  const { showLoading, hideLoading } = useLoading();
  
  const [loading, setLoading] = useState(true);
  const [nearestShop, setNearestShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [showShops, setShowShops] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    loadLocation();
    document.title = "Home - Roti Wala";
  }, []);

  useEffect(() => {
    if (nearestShop) loadMenu(nearestShop.id);
  }, [nearestShop]);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((p) => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* ---------- API HELPERS ---------- */
  const fetchAllShops = async () => {
    try {
      const data = await getShopsPublic();
      setShops(data);
      setShowShops(true);
    } catch (e) {
      console.log(e);
    }
  };

  const loadLocation = async () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      await fetchAllShops();
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearest = await getNearestShop(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setNearestShop(nearest);
          localStorage.setItem("selected_shop", nearest.id);
        } catch (e) {
          console.log(e);
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
      }
    );
  };

  const loadMenu = async (shopId) => {
    try {
      const categoryData = await getCategoriesByShopPublic(shopId);
      setCategories(categoryData);
      const allItems = [];
      for (const c of categoryData) {
        const items = await getItemsByCategoryPublic(c.id);
        allItems.push(...items);
      }
      setMenuItems(allItems);
    } catch (e) {
      console.log(e);
    }
  };

  const loadAllShops = async () => {
    setIsLoadingMore(true);
    showLoading("Loading available shops...", "warm", "md");
    try {
      await fetchAllShops();
    } finally {
      setIsLoadingMore(false);
      hideLoading();
    }
  };

  const selectShop = (shop) => {
    setNearestShop(shop);
    localStorage.setItem("selected_shop", shop.id);
    setShowShops(false);
  };

  const handleAddCart = async (item) => {
    showLoading("Adding to cart...", "cool", "sm");
    try {
      await addToCart(item.id, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      hideLoading();
      Swal.fire({
        icon: "success",
        title: "Added To Cart",
        text: `${item.name} added successfully`,
        timer: 1200,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } catch (error) {
      hideLoading();
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.error || "Unable to add item",
        background: '#1a1a1a',
        color: '#ffffff',
      });
    }
  };

  const handleChangeShop = async () => {
    setIsLoadingMore(true);
    showLoading("Loading shops...", "warm", "md");
    try {
      await loadAllShops();
    } finally {
      setIsLoadingMore(false);
      hideLoading();
    }
  };

  /* ---------- LOADER ---------- */
  if (loading) {
    return (
      <Loader 
        message="Finding the best food near you..." 
        variant="warm" 
        size="lg"
        fullScreen={true}
      />
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="home-page">
      {/* Show loader for async operations */}
      {isLoadingMore && (
        <Loader 
          message="Loading shops..." 
          variant="cool" 
          size="md"
          fullScreen={true}
        />
      )}

      {/* ============ HERO ============ */}
      <motion.section
        ref={heroRef}
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background blobs */}
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="hero-blob blob-3" />
        <div className="hero-grain" />

        {/* Floating food emojis */}
        {FLOATING_FOODS.map((emoji, i) => (
          <motion.span
            key={i}
            className={`floating-food food-pos-${i}`}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {emoji}
          </motion.span>
        ))}

        <motion.div
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.span
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FaFire className="badge-icon" /> Fresh & Fast Making
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Delicious Food <br />
            <span className="hero-gradient-text">Delivered Hot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            Hot roti, mouthwatering meals, and express delivery from your
            nearest shop — straight to your doorstep.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="hero-btn primary"
              onClick={handleChangeShop}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Shops <FaLocationArrow />
            </motion.button>
            <Link to="/menu" className="hero-btn secondary">
              <motion.span
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                View Full Menu
              </motion.span>
            </Link>
          </motion.div>

          {/* Mini stats inside hero */}
          <motion.div
            className="hero-mini-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="mini-stat">
              <strong>10+</strong>
              <span>Shops</span>
            </div>
            <div className="mini-stat">
              <strong>5K+</strong>
              <span>Customers</span>
            </div>
            <div className="mini-stat">
              <strong>4.9★</strong>
              <span>Rating</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: "easeOut" }}
        >
          <div className="hero-plate">
            <motion.div
              className="plate-emoji"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              🫓
            </motion.div>
          </div>
          <motion.div
            className="hero-card-tag tag-delivery"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FaTruck /> <span>20 min Delivery</span>
          </motion.div>
          <motion.div
            className="hero-card-tag tag-rating"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            <FaStar /> <span>4.9 Rating</span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ============ INFO BANNER ============ */}
      <AnimatePresence>
        {locationDenied && !nearestShop && !showShops && (
          <motion.div
            className="info-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <FaMapMarkerAlt /> Location unavailable. Choose a shop manually to
            see menu items.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ NEAREST SHOP CARD ============ */}
      <AnimatePresence>
        {nearestShop && !showShops && (
          <motion.div
            className="shop-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <div className="shop-info">
              <div className="shop-icon-wrap">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h2>{nearestShop.name}</h2>
                <p>{nearestShop.address}</p>
                <span>
                  <FaPhoneAlt /> {nearestShop.phone}
                </span>
              </div>
            </div>
            <div className="shop-actions">
              <motion.a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShop.latitude},${nearestShop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="navigate-btn"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaLocationArrow /> Navigate
              </motion.a>
              <motion.button
                className="change-btn"
                onClick={handleChangeShop}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaExchangeAlt /> Change Shop
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ SHOPS GRID ============ */}
      <AnimatePresence>
        {showShops && (
          <motion.div
            className="shops-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {shops.map((shop, i) => (
              <motion.div
                key={shop.id}
                className="shop-select-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="shop-select-top">
                  <FaMapMarkerAlt />
                  <h4>{shop.name}</h4>
                </div>
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
      </AnimatePresence>

      {/* ============ TOP CATEGORIES ============ */}
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="title-kicker">Browse by</span>
        <h2>Top Categories</h2>
        <p>Pick what you crave the most</p>
      </motion.div>

      <motion.div
        className="categories-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {TOP_CATEGORIES.map((cat, i) => (
          <motion.div
            key={i}
            className="category-card"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -8, scale: 1.04 }}
            style={{ "--cat-color": cat.color }}
          >
            <div className="cat-icon">{cat.icon}</div>
            <h5>{cat.name}</h5>
          </motion.div>
        ))}
      </motion.div>

      {/* ============ POPULAR MENU ============ */}
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="title-kicker">Today's Picks</span>
        <h2>Popular Menu</h2>
        <p>Freshly prepared dishes loved by everyone</p>
      </motion.div>

      <motion.div className="menu-grid">
        {menuItems.length === 0 ? (
          <div className="empty-menu">
            <p>No menu items available for this shop.</p>
          </div>
        ) : (
          menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="food-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: (index % 8) * 0.05, duration: 0.5 }}
              whileHover={{ y: -10 }}
            >
              <div className="food-image-wrapper">
                <img
                  src={item.image_url ? item.image_url : "/food-placeholder.jpg"}
                  alt={item.name}
                  className="food-image"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/food-placeholder.jpg")}
                />
                <span className="food-badge">
                  <FaFire /> Hot
                </span>
                <div className="food-img-overlay" />
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
                  <div className="food-stars">
                    <FaStar /> 4.{5 + (index % 4)}
                  </div>
                </div>
                <div className="food-actions">
                  <motion.button
                    className="add-cart-btn"
                    onClick={() => handleAddCart(item)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FaShoppingCart /> Add To Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ============ STATS ============ */}
      <motion.section
        className="stats-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {[
          { num: "10+", label: "Shops" },
          { num: "500+", label: "Daily Orders" },
          { num: "100+", label: "Menu Items" },
          { num: "5K+", label: "Happy Customers" },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="stat-card"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -6, scale: 1.03 }}
          >
            <h2>{s.num}</h2>
            <span>{s.label}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* ============ WHY US ============ */}
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="title-kicker">Why Choose Us</span>
        <h2>Made With Love</h2>
        <p>Everything you need from a food partner</p>
      </motion.div>

      <motion.section
        className="why-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {[
          {
            icon: <FaTruck />,
            title: "Fast Delivery",
            text: "Quick pickup and delivery from nearby shops.",
          },
          {
            icon: <FaUtensils />,
            title: "Fresh Food",
            text: "Prepared fresh every day by trusted vendors.",
          },
          {
            icon: <FaCreditCard />,
            title: "Easy Payments",
            text: "Secure and simple payment process.",
          },
          {
            icon: <FaStar />,
            title: "Best Quality",
            text: "Hygienic and quality checked meals.",
          },
        ].map((w, i) => (
          <motion.div
            key={i}
            className="why-card"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -8 }}
          >
            <div className="why-icon">{w.icon}</div>
            <h4>{w.title}</h4>
            <p>{w.text}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ============ TESTIMONIALS ============ */}
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="title-kicker">Loved By Foodies</span>
        <h2>What Customers Say</h2>
        <p>Real reviews from real customers</p>
      </motion.div>

      <div className="testimonial-wrap">
        <button
          className="t-arrow t-prev"
          onClick={() =>
            setTestimonialIdx(
              (p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
            )
          }
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>

        <div className="testimonial-slider">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              className="testimonial-card"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.45 }}
            >
              <FaQuoteLeft className="t-quote" />
              <p className="t-text">{TESTIMONIALS[testimonialIdx].text}</p>
              <div className="t-stars">
                {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map(
                  (_, i) => (
                    <FaStar key={i} />
                  )
                )}
              </div>
              <div className="t-author">
                <img
                  src={TESTIMONIALS[testimonialIdx].avatar}
                  alt={TESTIMONIALS[testimonialIdx].name}
                />
                <div>
                  <strong>{TESTIMONIALS[testimonialIdx].name}</strong>
                  <span>{TESTIMONIALS[testimonialIdx].role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          className="t-arrow t-next"
          onClick={() =>
            setTestimonialIdx((p) => (p + 1) % TESTIMONIALS.length)
          }
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="t-dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`t-dot ${i === testimonialIdx ? "active" : ""}`}
            onClick={() => setTestimonialIdx(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>

      {/* ============ CTA STRIP ============ */}
      <motion.section
        className="cta-strip"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="cta-text">
          <h3>Hungry? Don't wait!</h3>
          <p>Order now & get your favorite dishes hot at your door.</p>
        </div>
        <Link to="/menu" className="cta-btn">
          Order Now <FaShoppingCart />
        </Link>
      </motion.section>

      {/* ============ WHATSAPP FLOAT ============ */}
      <a
        href="https://wa.me/919876543210"
        className="floating-cart"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <span className="pulse-ring" />
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
}