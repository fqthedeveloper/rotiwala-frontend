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

const Refund = () => {
  useEffect(() => {
    document.title = "Refund Policy - Roti Wala";
  }, []);

  return (
    <motion.div className="page-shell policy-page" initial="hidden" animate="visible" variants={pageVariants}>
      <motion.section className="container py-5" variants={cardVariants}>
        <div className="policy-card">
          <div className="policy-badge">Refund</div>
          <h1>Refund Policy</h1>
          <p>
            Roti Wala strives to deliver fresh, high-quality meals. If you are
            unsatisfied with your order, we will review refund requests fairly.
          </p>

          <h2>Eligibility</h2>
          <p>
            Refunds may be granted when an order is incorrect, missing, or not
            delivered as confirmed. Please reach out within a reasonable time.
          </p>

          <h2>How to Request a Refund</h2>
          <p>
            Contact our support team with your order details and any photos or
            information related to the issue.
          </p>

          <h2>Review Process</h2>
          <p>
            Each refund request is reviewed individually. If approved, we will
            provide a refund or credit based on the situation.
          </p>

          <h2>Contact</h2>
          <p>
            For refund assistance, please get in touch through the contact page
            or our customer support channels.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Refund;
