import { useEffect, useState } from "react";
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
} from "react-icons/fa";
import { getContactInfo, submitFeedback } from "../service/contactService";

const Contact = () => {
  const [contact, setContact] = useState(null);
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

    try {
      await submitFeedback(form);

      Swal.fire({
        icon: "success",
        title: "Feedback Sent",
        text: "Thanks for reaching out. We will get back to you soon.",
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
    }
  };

  if (!contact) {
    return (
      <div className="page-shell contact-page">
        <section className="hero-section contact-hero">
          <div className="container hero-content text-center">
            <span className="hero-badge">We’re ready to help</span>
            <h1>Contact Us</h1>
            <p>Loading our contact details...</p>
          </div>
        </section>
        <div className="container py-5">
          <div className="loading-card">Preparing your contact experience...</div>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${contact.latitude},${contact.longitude}`;

  return (
    <div className="page-shell contact-page">
      <section className="menu-hero contact-hero">
        <div className="menu-hero-blob mh-blob-1" />
        <div className="menu-hero-blob mh-blob-2" />
        <div className="menu-hero-grain" />

        <div className="container hero-content text-center">
          <span className="menu-kicker">
            <FaEnvelope /> Contact Team
          </span>
          <h1>
            Contact <span className="menu-grad-text">Us</span>
          </h1>
          <p>Share your feedback, questions, or special requests with us.</p>
          <div className="menu-count-badge">
            <FaClock /> Open daily for pickup and support
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="contact-card info-card">
              <div className="contact-card__head">
                <h3>{contact.company_name}</h3>
                <p>Reach us quickly through your preferred channel.</p>
              </div>

              <div className="contact-list">
                <p>
                  <FaPhone /> <span>{contact.phone}</span>
                </p>
                <p>
                  <FaEnvelope /> <span>{contact.email}</span>
                </p>
                <p>
                  <FaMapMarkerAlt /> <span>{contact.address}</span>
                </p>
                <p>
                  <FaClock /> <span>Open daily for pickup and support</span>
                </p>
              </div>

              <div className="action-stack">
                <a href={`tel:${contact.phone}`} className="btn btn-warning w-100 mb-2">
                  Call Now
                </a>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-success w-100 mb-2"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-100"
                >
                  <FaDirections /> Navigate To Shop
                </a>
              </div>

              <div className="social-links">
                <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <FaFacebook size={24} />
                </a>
                <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <FaInstagram size={24} />
                </a>
                <a href={contact.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                  <FaYoutube size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="contact-card form-card">
              <div className="contact-card__head">
                <h3>Send Feedback</h3>
                <p>We usually reply within a day.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      name="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      name="phone"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      name="subject"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      rows="5"
                      className="form-control"
                      name="message"
                      placeholder="Message"
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-warning w-100 mt-3 contact-submit">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
