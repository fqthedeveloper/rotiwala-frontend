import { useMemo } from "react";
import { motion } from "framer-motion";
import "./Loader.css";

const GRADIENTS = [
  "conic-gradient(#ffb74d, #ff9800, #ff5252, #ffb74d)",
  "conic-gradient(#81c784, #4caf50, #2e7d32, #81c784)",
  "conic-gradient(#64b5f6, #2196f3, #1565c0, #64b5f6)",
  "conic-gradient(#ff9a9e, #fecfef, #f6d365, #ff9a9e)",
];

const Loader = ({ message = "Loading...", variant = "warm" }) => {
  // pick a pseudo-random style per mount to make the loader feel dynamic
  const style = useMemo(() => {
    const idx = Math.floor(Math.random() * GRADIENTS.length);
    const gradient = GRADIENTS[idx];
    const duration = (Math.random() * 0.8 + 1.0).toFixed(2) + "s"; // 1.0 - 1.8s
    const direction = Math.random() > 0.4 ? "normal" : "reverse";

    return {
      "--ring-bg": gradient,
      "--spin-duration": duration,
      "--spin-direction": direction,
    };
  }, []);

  return (
    <motion.div
      className="loader-wrapper"
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      aria-live="polite"
    >
      <div className="loader-outer">
        <div className="loader-ring" />
        <div className="loader-core" />
      </div>
      <div className="loader-text">{message}</div>
    </motion.div>
  );
};

export default Loader;