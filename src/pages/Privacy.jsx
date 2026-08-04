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

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - Roti Wala";
  }, []);

  return (
    <motion.div className="page-shell policy-page" initial="hidden" animate="visible" variants={pageVariants}>
      <motion.section className="container py-5" variants={cardVariants}>
        <div className="policy-card">
          <div className="policy-badge">Privacy</div>
          <h1>Privacy Policy</h1>
          <p>
            At Roti Wala, your privacy is important to us. We collect and use
            information only to provide and improve our food pickup service.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect your name, email, phone number, address, order history,
            and other details needed to process orders and provide customer support.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            Your information is used to handle orders, communicate with you,
            deliver updates, and keep your account secure.
          </p>

          <h2>Data Security</h2>
          <p>
            We work to protect your personal information with reasonable security
            measures and will never sell your data to third parties.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about privacy, please contact our support team.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Privacy;
