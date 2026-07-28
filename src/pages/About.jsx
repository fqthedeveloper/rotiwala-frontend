import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStore,
  FaUsers,
  FaClock,
  FaAward,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

const highlights = [
  {
    icon: FaStore,
    title: "Multiple Shops",
    desc: "Explore food from nearby shops in one smooth experience.",
  },
  {
    icon: FaUsers,
    title: "Happy Customers",
    desc: "Thousands of successful orders delivered with ease.",
  },
  {
    icon: FaClock,
    title: "Quick Pickup",
    desc: "Save time with fast ordering and easy collection.",
  },
  {
    icon: FaAward,
    title: "Quality Service",
    desc: "Trusted by local communities for dependable support.",
  },
];

const About = () => {
  useEffect(() => {
    document.title = "About Us - Roti Wala";
  }, []);

  return (
    <div className="page-shell about-page">
      <section className="menu-hero about-hero">
        <div className="menu-hero-blob mh-blob-1" />
        <div className="menu-hero-blob mh-blob-2" />
        <div className="menu-hero-grain" />

        <div className="container hero-content">
          <span className="menu-kicker">
            <FaStore /> Our Story
          </span>
          <h1>
            Discover <span className="menu-grad-text">Roti Wala</span>
          </h1>
          <p>
            We connect hungry customers with local food shops through a smooth
            pickup experience built for speed, quality, and trust.
          </p>
          <div className="menu-count-badge">
            <FaMapMarkerAlt /> Serving food lovers every day
          </div>
          <br />
          <br />
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-warning hero-btn">
              Explore Menu
            </Link>
            <Link to="/contact" className="btn btn-outline-dark hero-btn hero-btn--ghost">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="about-image-card">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                alt="Fresh food served with care"
                className="img-fluid"
              />
              <div className="image-overlay">
                <span>Serving the community daily</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="about-story-card">
              <h2>Our Story</h2>
              <p>
                Roti Wala is a modern food pickup platform connecting customers
                with local food shops. Our mission is to make ordering delicious
                meals fast, easy, and reliable.
              </p>
              <p>
                Customers can browse menus, place orders, track status, and
                collect food directly from shops without waiting in long queues.
              </p>
              <ul className="about-points">
                <li>Simple ordering for busy days</li>
                <li>Reliable pickup from trusted partners</li>
                <li>Friendly support whenever you need it</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-highlights-section">
        <div className="container">
          <div className="section-heading text-center">
            <h2>Why customers love us</h2>
            <p>Everything is designed to make food pickup effortless.</p>
          </div>

          <div className="row g-4">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="col-sm-6 col-lg-3">
                  <div
                    className="feature-card"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="feature-icon">
                      <Icon />
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="about-cta">
          <div>
            <FaMapMarkerAlt className="cta-icon" />
            <h3>Serving food lovers every day</h3>
            <p>
              We work with local food vendors to bring fresh meals closer to
              you.
            </p>
          </div>
          <Link to="/contact" className="btn btn-warning cta-btn">
            Get In Touch <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;