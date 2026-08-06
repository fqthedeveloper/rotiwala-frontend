import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaStore,
  FaUsers,
  FaClock,
  FaAward,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheckCircle,
  FaHeart,
  FaShieldAlt,
  FaUtensils
} from "react-icons/fa";
import "./CSS/Menu.css";
const stats = [
  { count: "10+", label: "Local Partner Shops" },
  { count: "5,000+", label: "Happy Food Lovers" },
  { count: "40 Min", label: "Average Delivery Time" },
  { count: "4.9 ★", label: "Customer Rating" },
];
const highlights = [
  {
    icon: FaStore,
    title: "Multi-Shop Network",
    desc: "Seamlessly order from your nearest tandoor shop or local kitchen.",
  },
  {
    icon: FaUtensils,
    title: "Tandoor Freshness",
    desc: "Hot, soft rotis baked fresh upon every order confirmation.",
  },
  {
    icon: FaClock,
    title: "Express Delivery & Pickup",
    desc: "Lightning fast delivery to your home or instant takeaway pickup.",
  },
  {
    icon: FaAward,
    title: "Top Tier Hygiene",
    desc: "FSSAI compliant, eco-packaged, and strictly quality audited.",
  },
];
const values = [
  {
    icon: FaHeart,
    title: "Home-cooked Taste",
    desc: "Authentic recipes crafted with traditional masalas and pure ghee.",
  },
  {
    icon: FaShieldAlt,
    title: "Quality Guaranteed",
    desc: "Fresh whole wheat flour (Atta) without artificial preservatives.",
  },
  {
    icon: FaCheckCircle,
    title: "Affordable Meals",
    desc: "Wholesome, budget-friendly meal combos for daily nutrition.",
  },
];
const About = () => {
  useEffect(() => {
    document.title = "About Us - Roti Wala";
  }, []);
  return (
    <motion.div
      className="page-shell about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* LUXURY HERO */}
      <motion.section
        className="menu-hero about-hero text-center position-relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="menu-hero-blob mh-blob-1" />
        <div className="menu-hero-blob mh-blob-2" />
        <div className="menu-hero-grain" />
        <div className="container hero-content py-4">
          <motion.span
            className="menu-kicker d-inline-flex align-items-center gap-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaStore /> Crafting Culinary Memories
          </motion.span>
          <motion.h1
            className="display-4 fw-bold mt-3 mb-3 text-white"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            The Story Behind <span className="menu-grad-text">Roti Waale</span>
          </motion.h1>
          <motion.p
            className="lead mx-auto text-light opacity-90"
            style={{ maxWidth: "680px" }}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We bridge local tandoors and food lovers with a high-speed, 
            hygienic pickup and doorstep delivery network. Fresh, hot, and made with love.
          </motion.p>
          <motion.div
            className="d-flex justify-content-center gap-3 mt-4 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/menu" className="btn btn-gold btn-lg">
              Explore Our Menu <FaArrowRight className="ms-2" />
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">
              Contact Our Team
            </Link>
          </motion.div>
        </div>
      </motion.section>
      {/* STATS BANNER */}
      <section className="container my-5">
        <div className="row g-4 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="col-6 col-md-3">
              <motion.div
                className="luxury-card p-4 h-100"
                whileHover={{ y: -6, boxShadow: "var(--shadow-glow)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="display-6 fw-bold text-gold-gradient mb-1">{stat.count}</h2>
                <p className="mb-0 text-muted fw-semibold small">{stat.label}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>
      {/* OUR MISSION & STORY */}
      <section className="container my-5 py-4">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="position-relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="rounded-4 overflow-hidden shadow-lg border border-gold"
                style={{ position: "relative", minHeight: "380px" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                  alt="Fresh food served with care"
                  className="w-100 h-100 object-fit-cover"
                  style={{ minHeight: "380px", borderRadius: "var(--radius-md)" }}
                />
                <div
                  className="position-absolute bottom-0 start-0 right-0 p-4 text-white"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                    width: "100%",
                  }}
                >
                  <span className="badge bg-gold mb-2">Authentic Tandoori</span>
                  <h4 className="mb-0">Prepared Fresh Every Single Hour</h4>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-gold-gradient fw-bold text-uppercase tracking-wider">Our Heritage</span>
              <h2 className="display-6 fw-bold mt-2 mb-4">Dedicated to Delivering Freshness & Integrity</h2>
              <p className="text-muted leading-relaxed">
                Roti Waale was founded with a singular vision: to eliminate the hassle of meal prep 
                without compromising on the warmth and taste of homemade food.
              </p>
              <p className="text-muted leading-relaxed">
                Whether you are an office goer, a student living away from home, or a busy household, 
                our platform delivers steaming hot rotis, rich gravies, and delicious side dishes directly from nearby kitchens.
              </p>
              <div className="mt-4">
                {values.map((v, idx) => {
                  const VIcon = v.icon;
                  return (
                    <div key={idx} className="d-flex align-items-start gap-3 mb-3">
                      <div
                        className="p-2 rounded-circle bg-gold text-dark d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px", flexShrink: 0 }}
                      >
                        <VIcon />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{v.title}</h6>
                        <p className="small text-muted mb-0">{v.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* FEATURE HIGHLIGHTS */}
      <section className="py-5 bg-glass-heavy border-top border-bottom border-gold">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-gold-gradient fw-bold text-uppercase">Why Choose Us</span>
            <h2 className="display-6 fw-bold mt-2">Built for Exceptional Food Experience</h2>
          </div>
          <div className="row g-4">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="col-sm-6 col-lg-3">
                  <motion.div
                    className="luxury-card p-4 text-center h-100"
                    whileHover={{ y: -8, boxShadow: "var(--shadow-glow)" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "var(--primary-glow)",
                        color: "var(--primary)",
                        fontSize: "1.5rem",
                        border: "1px solid var(--border-glow)",
                      }}
                    >
                      <Icon />
                    </div>
                    <h5 className="fw-bold mb-2">{item.title}</h5>
                    <p className="small text-muted mb-0">{item.desc}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* CTA FOOTER BANNER */}
      <section className="container my-5 py-4">
        <motion.div
          className="p-5 rounded-4 text-center position-relative overflow-hidden shadow-lg"
          style={{ background: "var(--grad-hero)", color: "#FFFFFF" }}
          whileHover={{ scale: 1.01 }}
        >
          <FaMapMarkerAlt className="display-4 text-gold mb-3" />
          <h2 className="display-6 fw-bold mb-3 text-white">Ready for Fresh & Hot Roti?</h2>
          <p className="mx-auto mb-4 opacity-90" style={{ maxWidth: "540px" }}>
            Order now from your nearest Roti Waale outlet and experience the real taste of authentic tandoori delights.
          </p>
          <Link to="/menu" className="btn btn-gold btn-lg px-5">
            Order Now <FaArrowRight className="ms-2" />
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
};
export default About;