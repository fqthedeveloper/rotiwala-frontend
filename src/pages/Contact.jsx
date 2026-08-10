import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaDirections,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaClock,
  FaPaperPlane,
  FaCommentDots
} from "react-icons/fa";
import { getContactInfo, submitFeedback } from "../service/contactService";
const Contact = () => {
  const [contact, setContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  useEffect(() => {
    loadContact();
    document.title = "Contact Us - Roti Wala";
  }, []);
  const loadContact = async () => {
    try {
      const data = await getContactInfo();
      setContact(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFeedback(form);
      Swal.fire({
        icon: "success",
        title: "Feedback Sent!",
        text: "Thank you for contacting us. We will respond to your query promptly.",
        confirmButtonColor: "#D4AF37",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Could not send message. Please try calling or messaging us on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const mapUrl = contact
    ? `https://www.google.com/maps?q=${contact.latitude},${contact.longitude}`
    : "https://maps.google.com";
  return (
    <motion.div
      className="page-shell contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* LUXURY HERO */}
      <motion.section
        className="menu-hero contact-hero text-center position-relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="menu-hero-blob mh-blob-1" />
        <div className="menu-hero-blob mh-blob-2" />
        <div className="menu-hero-grain" />
        <div className="container hero-content py-4">
          <span className="menu-kicker d-inline-flex align-items-center gap-2">
            <FaCommentDots /> We Are Here For You
          </span>
          <h1 className="display-4 fw-bold mt-3 mb-3 text-white">
            Get In Touch With <span className="menu-grad-text">Roti Waale</span>
          </h1>
          <p className="lead mx-auto text-light opacity-90" style={{ maxWidth: "600px" }}>
            Have a question about your order, feedback on our meals, or partnership inquiries? 
            Reach out to our friendly support team anytime.
          </p>
          <div className="menu-count-badge">
            <FaClock /> Support Available Daily 9 AM - 11 PM
          </div>
        </div>
      </motion.section>
      {/* CONTACT CONTENT SECTION */}
      <section className="container my-5 py-3">
        <div className="row g-4 align-items-stretch">
          {/* INFO & QUICK ACTIONS CARD */}
          <motion.div
            className="col-lg-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="luxury-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-gold-gradient fw-bold text-uppercase">Contact Details</span>
                <h3 className="fw-bold mt-2 mb-4">
                  {contact?.company_name || "Roti Waale Headquarters"}
                </h3>
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-circle bg-gold text-dark d-flex align-items-center justify-content-center"
                      style={{ width: "42px", height: "42px", flexShrink: 0 }}
                    >
                      <FaPhone />
                    </div>
                    <div>
                      <small className="text-muted d-block">Phone Support</small>
                      <strong className="fs-6">{contact?.phone || "+91 98765 43210"}</strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-circle bg-gold text-dark d-flex align-items-center justify-content-center"
                      style={{ width: "42px", height: "42px", flexShrink: 0 }}
                    >
                      <FaEnvelope />
                    </div>
                    <div>
                      <small className="text-muted d-block">Email Address</small>
                      <strong className="fs-6">{contact?.email || "support@rotiwala.com"}</strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-circle bg-gold text-dark d-flex align-items-center justify-content-center"
                      style={{ width: "42px", height: "42px", flexShrink: 0 }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <small className="text-muted d-block">Main Location</small>
                      <strong className="fs-6">{contact?.address || "Main Street, Food Hub City"}</strong>
                    </div>
                  </div>
                </div>
                {/* QUICK ACTION BUTTONS */}
                <div className="d-flex flex-column gap-2 mb-4">
                  {contact?.phone && (
                    <a href={`tel:${contact.phone}`} className="btn btn-gold w-100">
                      <FaPhone className="me-2" /> Call Store Directly
                    </a>
                  )}
                  {contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-success w-100 fw-bold py-2"
                      style={{ borderRadius: "var(--radius-sm)" }}
                    >
                      <FaWhatsapp className="me-2 fs-5" /> Chat on WhatsApp
                    </a>
                  )}
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-light w-100 py-2 border-gold text-gold btn-primary"
                    style={{ borderRadius: "var(--radius-sm)" }}
                  >
                    <FaDirections className="me-2" /> Navigate on Google Maps
                  </a>
                </div>
              </div>
              {/* SOCIAL MEDIA LINKS */}
              <div className="pt-3 border-top border-gold d-flex align-items-center justify-content-between">
                <span className="small text-muted fw-bold">Follow Our Journey</span>
                <div className="d-flex gap-3">
                  {contact?.facebook && (
                    <a href={contact.facebook} target="_blank" rel="noreferrer" className="text-gold fs-5">
                      <FaFacebook />
                    </a>
                  )}
                  {contact?.instagram && (
                    <a href={contact.instagram} target="_blank" rel="noreferrer" className="text-gold fs-5">
                      <FaInstagram />
                    </a>
                  )}
                  {contact?.youtube && (
                    <a href={contact.youtube} target="_blank" rel="noreferrer" className="text-gold fs-5">
                      <FaYoutube />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          {/* MESSAGE & FEEDBACK FORM */}
          <motion.div
            className="col-lg-7"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="luxury-card p-4 p-md-5 h-100">
              <span className="text-gold-gradient fw-bold text-uppercase">Direct Feedback</span>
              <h3 className="fw-bold mt-2 mb-2">Send Us A Message</h3>
              <p className="text-muted small mb-4">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        className="form-control"
                        placeholder="Order Feedback / Inquiry"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>Your Message *</label>
                      <textarea
                        name="message"
                        rows="5"
                        className="form-control"
                        placeholder="Type your message or special instructions here..."
                        value={form.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-gold w-100 mt-4 py-3 d-flex align-items-center justify-content-center gap-2 fs-6 btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    "Sending Message..."
                  ) : (
                    <>
                      <FaPaperPlane /> Send Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};
export default Contact;