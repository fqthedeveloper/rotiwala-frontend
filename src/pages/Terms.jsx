import { useEffect } from "react";
import { motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut", delay: 0.15 } },
};

const Terms = () => {
  useEffect(() => {
    document.title = "Terms & Conditions - Roti Wala";
  }, []);

  return (
    <motion.div className="page-shell policy-page" initial="hidden" animate="visible" variants={pageVariants}>
      <motion.section className="container py-5" variants={cardVariants}>
        <div className="policy-card">
          <div className="policy-badge">Terms</div>
          <h1>Terms & Conditions</h1>
          <p>
            These terms govern your use of Roti Wala. By accessing our site and
            placing orders, you agree to follow these terms.
          </p>

          <h2>Ordering</h2>
          <p>
            Orders are accepted subject to availability. We may change or cancel
            an order if the selected items are unavailable.
          </p>

          <h2>Payment</h2>
          <p>
            Payment must be completed before pickup or delivery, and all prices
            are subject to change without notice.
          </p>

          <h2>User Conduct</h2>
          <p>
            You agree to use the website lawfully and not to interfere with other
            users or the service.
          </p>

          <h2>Limitations</h2>
          <p>
            We are not responsible for delays due to third-party vendors or
            delivery issues outside our control.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Terms;
