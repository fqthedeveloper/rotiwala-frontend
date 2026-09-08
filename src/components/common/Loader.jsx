import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Loader.css";

const STAGES = [
  ["Warming the tandoor", "Getting everything ready"],
  ["Rolling fresh roti", "Preparing your order"],
  ["Baking to perfection", "Almost there"],
  ["Ready to serve", "Fresh and hot for you"],
];

const Loader = ({ fullScreen = true, message }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => (current + 1) % STAGES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const [title, subtitle] = message
    ? [message, "Please wait a moment"]
    : STAGES[stage];

  return (
    <div
      className={`rw-app-preloader ${fullScreen ? "rw-app-preloader--fullscreen" : "rw-app-preloader--inline"}`}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <motion.div className="rw-loader-orbit rw-loader-orbit-one" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      <motion.div className="rw-loader-orbit rw-loader-orbit-two" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />

      <div className="rw-loader-brand"><span className="rw-loader-mark">R</span><span>ROTI WAALE</span></div>

      <div className="rw-loader-food" aria-hidden="true">
        <motion.div className="rw-loader-flame" animate={{ scaleY: [0.85, 1.12, 0.9], rotate: [-3, 3, -3] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}><span /></motion.div>
        <motion.div className="rw-loader-roti" animate={{ y: [0, -7, 0], scale: [1, 1.035, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><i /><i /><i /><i /></motion.div>
      </div>

      <div className="rw-loader-copy">
        <motion.h1 key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{title}</motion.h1>
        <p>{subtitle}</p>
      </div>

      <div className="rw-loader-progress" aria-hidden="true"><motion.span animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} /></div>
      <div className="rw-loader-dots" aria-hidden="true">{STAGES.map((item, index) => <span className={index === stage ? "is-active" : ""} key={item[0]} />)}</div>
    </div>
  );
};

export default Loader;
