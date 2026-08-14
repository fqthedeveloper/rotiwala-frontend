// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
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
  FaArrowRight,
} from "react-icons/fa";
import "./CSS/Home.css";

import Marquee from "../components/Home/Marquee";
import VideoSlideshow from "../components/Home/VideoSlideshow";
import TestimonialSection from "../components/Home/TestimonialSection";

import { getNearestShop, getShopsPublic } from "../service/shopService";
import {
  getCategoriesByShopPublic,
  getPublicMenuItems,
} from "../service/menuItemService";
import { addToCart } from "../service/cartService";
import Loader from "../components/common/Loader";
import { useLoading } from "../context/LoadingContext";
import { getPublicStats } from "../service/reportServices";

const EASE = [0.22, 1, 0.36, 1];

const Chapter = ({ no, kicker, title, accent, sub }) => (
  <motion.div
    className="rw-chapter"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.7, ease: EASE }}
  >
    <div className="rw-chapter-top">
      <span className="rw-chapter-no">{no}</span>
      <span className="rw-chapter-kicker">{kicker}</span>
      <span className="rw-chapter-rule" />
    </div>
    <h2 data-testid={`chapter-title-${no}`}>
      {title} {accent && <em>{accent}</em>}
    </h2>
    {sub && <p>{sub}</p>}
  </motion.div>
);

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const plateY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const { showLoading, hideLoading } = useLoading();

  // ----- State -----
  const [loading, setLoading] = useState(true);
  const [nearestShop, setNearestShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [showShops, setShowShops] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stats, setStats] = useState([
    { num: "10+", label: "Shops" },
    { num: "500+", label: "Daily Orders" },
    { num: "100+", label: "Menu Items" },
    { num: "5K+", label: "Happy Customers" },
  ]);

  /* ---------- LENIS ---------- */
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      smoothWheel: true,
      smoothTouch: true,
      direction: "vertical",
      gestureDirection: "vertical",
      mouseMultiplier: 1,
      touchMultiplier: 1.4,
      lerp: 0.09,
    });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  /* ---------- Init ---------- */
  useEffect(() => {
    loadLocation();
    fetchStats();
    document.title = "Home - Roti Wala";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Load menu when shop changes ---------- */
  useEffect(() => {
    if (nearestShop) {
      setMenuItems([]); // clear old items
      loadMenu(nearestShop.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearestShop]);

  /* ---------- Shops & Menu ---------- */
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
      // ✅ Use 'shop' as the query parameter (backend expects 'shop')
      const allItems = await getPublicMenuItems({ shop: shopId });
      setMenuItems(allItems);
    } catch (e) {
      console.log(e);
      setMenuItems([]);
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
        background: "#17110c",
        color: "#f7ead2",
      });
    } catch (error) {
      hideLoading();
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.error || "Unable to add item",
        background: "#17110c",
        color: "#f7ead2",
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

  /* ---------- Fetch Stats ---------- */
  const fetchStats = async () => {
    try {
      const data = await getPublicStats();
      setStats([
        { num: `${data.shops}+`, label: "Shops" },
        { num: `${data.daily_orders}+`, label: "Daily Orders" },
        { num: `${data.menu_items}+`, label: "Menu Items" },
        { num: `${data.customers}+`, label: "Happy Customers" },
      ]);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Keep fallback values already set in state
    }
  };

  /* ---------- Loader ---------- */
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

  /* ---------- Render ---------- */
  return (
    <div className="rw-home" data-testid="home-page">
      {isLoadingMore && (
        <Loader
          message="Loading shops..."
          variant="cool"
          size="md"
          fullScreen={true}
        />
      )}

      {/* ============ HERO ============ */}
      <section className="rw-hero" ref={heroRef}>
        <div className="rw-hero-glow" />
        <div className="rw-hero-grain" />
        <div className="rw-hero-ring rw-ring-a" />
        <div className="rw-hero-ring rw-ring-b" />

        <motion.div
          className="rw-hero-inner"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="rw-hero-kicker-mask">
            <motion.p
              className="rw-hero-kicker"
              initial={{ y: "120%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            >
              <FaFire /> № 01 — Roti Wala · Faizan Qureshi Test
            </motion.p>
          </div>

          <h1 className="rw-hero-title" data-testid="hero-title">
            {[
              <>Hot tandoor,</>,
              <>
                <em>delivered</em> to
              </>,
              <>your door.</>,
            ].map((line, i) => (
              <span className="rw-line-mask" key={i}>
                <motion.span
                  className="rw-line"
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.95,
                    delay: 0.3 + i * 0.14,
                    ease: EASE,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="rw-hero-sub"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7, ease: EASE }}
          >
            Hot roti, mouthwatering meals, and express delivery from your
            nearest shop — straight to your doorstep.
          </motion.p>

          <motion.div
            className="rw-hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: EASE }}
          >
            <motion.button
              data-testid="hero-explore-shops-btn"
              className="rw-btn rw-btn-gold"
              onClick={handleChangeShop}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Shops <FaLocationArrow />
            </motion.button>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={nearestShop ? `/menu?shop=${nearestShop.id}` : "/menu"}
                data-testid="hero-view-menu-link"
                className="rw-btn rw-btn-ghost"
              >
                View Full Menu <FaArrowRight />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="rw-hero-visual"
          style={{ y: plateY }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: EASE }}
        >
          <div className="rw-plate">
            <div className="rw-plate-orbit" />
            <motion.div
              className="rw-plate-emoji"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
            >
              🫓
            </motion.div>
          </div>
          <motion.div
            className="rw-tag rw-tag-delivery"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaTruck /> <span>40 min Delivery</span>
          </motion.div>
          <motion.div
            className="rw-tag rw-tag-rating"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaStar /> <span>4.9 Rating</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="rw-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span>Scroll</span>
          <div className="rw-scroll-line" />
        </motion.div>
      </section>

      {/* ============ MARQUEE ============ */}
      <Marquee />

      {/* ============ LOCATION BANNER ============ */}
      <AnimatePresence>
        {locationDenied && !nearestShop && !showShops && (
          <motion.div
            className="rw-banner"
            data-testid="location-banner"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
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
            className="rw-shop-card"
            data-testid="nearest-shop-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="rw-shop-info">
              <div className="rw-shop-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <span className="rw-shop-label">Your nearest shop</span>
                <h2>{nearestShop.name}</h2>
                <p>{nearestShop.address}</p>
                <span className="rw-shop-phone">
                  <FaPhoneAlt /> {nearestShop.phone}
                </span>
              </div>
            </div>
            <div className="rw-shop-actions">
              <motion.a
                data-testid="navigate-shop-btn"
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShop.latitude},${nearestShop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="rw-btn rw-btn-maroon"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaLocationArrow /> Navigate
              </motion.a>
              <motion.button
                data-testid="change-shop-btn"
                className="rw-btn rw-btn-outline"
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
            className="rw-shops-grid"
            data-testid="shops-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {shops.map((shop, i) => (
              <motion.div
                key={shop.id}
                className="rw-shop-select"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease: EASE }}
                whileHover={{ y: -8 }}
              >
                <div className="rw-shop-select-top">
                  <FaMapMarkerAlt />
                  <h4>{shop.name}</h4>
                </div>
                <p>{shop.address}</p>
                <button
                  data-testid={`select-shop-btn-${shop.id}`}
                  className="rw-btn rw-btn-maroon rw-btn-block"
                  onClick={() => selectShop(shop)}
                >
                  Select Shop
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ CHAPTER 01 — VIDEOS ============ */}
      <Chapter
        no="01"
        kicker="Our Video Journey"
        title="How to"
        accent="Prepare"
        sub="Watch our kitchen stories and food preparation videos"
      />

      <VideoSlideshow />

      {/* ============ CHAPTER 02 — POPULAR MENU ============ */}
      <Chapter
        no="02"
        kicker="Today's Picks"
        title="Popular"
        accent="Menu"
        sub={`Freshly prepared dishes from ${nearestShop?.name || "your shop"}`}
      />

      <motion.div className="rw-foods" data-testid="popular-menu-grid">
        {menuItems.length === 0 ? (
          <div className="rw-empty" data-testid="empty-menu">
            <p>No menu items available for this shop.</p>
          </div>
        ) : (
          menuItems.map((item, index) => (
            <motion.article
              key={item.id}
              className="rw-food"
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                delay: (index % 8) * 0.05,
                duration: 0.55,
                ease: EASE,
              }}
              whileHover={{ y: -10 }}
            >
              <div className="rw-food-frame">
                <img
                  src={item.image_url || "/food-placeholder.jpg"}
                  alt={item.name}
                  className="rw-food-img"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/food-placeholder.jpg")}
                />
                <span className="rw-food-badge">
                  <FaFire /> Hot
                </span>
                <div className="rw-food-overlay" />
              </div>
              <div className="rw-food-body">
                <h4>{item.name}</h4>
                <p>
                  {item.description
                    ? item.description.slice(0, 90)
                    : "Delicious freshly prepared food."}
                </p>
                <div className="rw-food-meta">
                  <h3>₹ {item.base_price || item.price}</h3>
                  <div className="rw-food-stars">
                    <FaStar /> 4.{5 + (index % 4)}
                  </div>
                </div>
                <motion.button
                  data-testid={`add-cart-btn-${item.id}`}
                  className="rw-btn rw-btn-maroon rw-btn-block"
                  onClick={() => handleAddCart(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <FaShoppingCart /> Add To Cart
                </motion.button>
              </div>
            </motion.article>
          ))
        )}
      </motion.div>

      {/* ============ STATS BAND (now from backend) ============ */}
      <motion.section
        className="rw-stats"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="rw-stat"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { ease: EASE } },
            }}
          >
            <h2>{s.num}</h2>
            <span>{s.label}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* ============ CHAPTER 03 — WHY US ============ */}
      <Chapter
        no="03"
        kicker="Why Choose Us"
        title="Made With"
        accent="Love"
        sub="Everything you need from a food partner"
      />

      <motion.section
        className="rw-why"
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
            data-testid={`why-card-${i}`}
            className="rw-why-card"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { ease: EASE } },
            }}
            whileHover={{ y: -8 }}
          >
            <span className="rw-why-no">{String(i + 1).padStart(2, "0")}</span>
            <div className="rw-why-icon">{w.icon}</div>
            <h4>{w.title}</h4>
            <p>{w.text}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ============ CHAPTER 04 — TESTIMONIALS ============ */}
      <Chapter
        no="04"
        kicker="Loved By Foodies"
        title="What Customers"
        accent="Say"
        sub="Real reviews from real customers"
      />

      <TestimonialSection />

      {/* ============ CTA STRIP ============ */}
      <motion.section
        className="rw-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="rw-cta-glow" />
        <div className="rw-cta-text">
          <h3>Hungry? Don&apos;t wait!</h3>
          <p>Order now &amp; get your favorite dishes hot at your door.</p>
        </div>
        <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
          <Link to="/menu" data-testid="cta-order-btn" className="rw-btn rw-btn-gold">
            Order Now <FaShoppingCart />
          </Link>
        </motion.div>
      </motion.section>

      {/* ============ WHATSAPP FLOAT ============ */}
      <a
        href="https://wa.me/917030808095"
        className="rw-wa"
        data-testid="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <span className="rw-wa-ring" />
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
}