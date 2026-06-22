import { useEffect } from "react";

import {
  FaStore,
  FaUsers,
  FaClock,
  FaAward,
  FaMapMarkerAlt,
} from "react-icons/fa";


const About = () => {
  useEffect(() => {
  document.title = "About Us - Roti Wala";
}, []);

  return (
    <div className="container-fluid px-0">

      <section className="bg-warning py-5">
        <div className="container text-center">

          <h1 className="display-4 fw-bold">
            About Roti Wala
          </h1>

          <p className="lead">
            Fresh Food • Fast Pickup • Happy Customers
          </p>

        </div>
      </section>

      <section className="container py-5">

        <div className="row align-items-center g-5">

          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
              alt="Food"
              className="img-fluid rounded-4 shadow"
            />
          </div>

          <div className="col-lg-6">

            <h2 className="fw-bold mb-4">
              Our Story
            </h2>

            <p className="text-muted">
              Roti Wala is a modern food pickup platform
              connecting customers with local food shops.
              Our mission is to make ordering delicious
              meals fast, easy and reliable.
            </p>

            <p className="text-muted">
              Customers can browse menus, place orders,
              track status and collect food directly
              from shops without waiting in long queues.
            </p>

          </div>

        </div>

      </section>

      <section className="bg-light py-5">

        <div className="container">

          <div className="row g-4">

            <div className="col-md-6 col-lg-3">

              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body">

                  <FaStore
                    size={50}
                    className="text-warning mb-3"
                  />

                  <h4>Multiple Shops</h4>

                  <p>
                    Explore food from nearby shops.
                  </p>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-lg-3">

              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body">

                  <FaUsers
                    size={50}
                    className="text-warning mb-3"
                  />

                  <h4>Happy Customers</h4>

                  <p>
                    Thousands of successful orders.
                  </p>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-lg-3">

              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body">

                  <FaClock
                    size={50}
                    className="text-warning mb-3"
                  />

                  <h4>Quick Pickup</h4>

                  <p>
                    Save time with advance ordering.
                  </p>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-lg-3">

              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body">

                  <FaAward
                    size={50}
                    className="text-warning mb-3"
                  />

                  <h4>Quality Service</h4>

                  <p>
                    Trusted by local communities.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="container py-5 text-center">

        <FaMapMarkerAlt
          size={50}
          className="text-warning mb-3"
        />

        <h2>
          Serving Food Lovers Every Day
        </h2>

        <p className="text-muted">
          We work with local food vendors to bring
          fresh meals closer to you.
        </p>

      </section>

    </div>
  );
};

export default About;