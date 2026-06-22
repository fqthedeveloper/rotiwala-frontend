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
    return <div className="container py-5">Loading...</div>;
  }

  const mapUrl = `https://www.google.com/maps?q=${contact.latitude},${contact.longitude}`;

  return (
    <div className="container-fluid px-0">

      <section className="bg-warning py-5">

        <div className="container text-center">

          <h1 className="display-4 fw-bold">
            Contact Us
          </h1>

          <p>
            We'd love to hear from you
          </p>

        </div>

      </section>
  

    <div className="container py-5">

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow border-0">
            <div className="card-body">
              <h3>{contact.company_name}</h3>

              <p>
                <FaPhone /> {contact.phone}
              </p>

              <p>
                <FaEnvelope /> {contact.email}
              </p>

              <p>
                <FaMapMarkerAlt /> {contact.address}
              </p>

              <a
                href={`tel:${contact.phone}`}
                className="btn btn-warning w-100 mb-2"
              >
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

              <hr />

              <div className="d-flex gap-3">
                <a href={contact.facebook} target="_blank">
                  <FaFacebook size={30} />
                </a>

                <a href={contact.instagram} target="_blank">
                  <FaInstagram size={30} />
                </a>

                <a href={contact.youtube} target="_blank">
                  <FaYoutube size={30} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow border-0">
            <div className="card-body">
              <h3>Send Feedback</h3>

              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-3"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  name="subject"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={handleChange}
                />

                <textarea
                  rows="5"
                  className="form-control mb-3"
                  name="message"
                  placeholder="Message"
                  value={form.message}
                  onChange={handleChange}
                />

                <button className="btn btn-warning w-100">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;
