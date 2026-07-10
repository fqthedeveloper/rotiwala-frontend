// src/components/common/Loader.jsx
import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Loader.css";

const GRADIENTS = [
  "conic-gradient(#ffb74d, #ff9800, #ff5252, #ffb74d)",
  "conic-gradient(#81c784, #4caf50, #2e7d32, #81c784)",
  "conic-gradient(#64b5f6, #2196f3, #1565c0, #64b5f6)",
  "conic-gradient(#ff9a9e, #fecfef, #f6d365, #ff9a9e)",
  "conic-gradient(#a18cd1, #fbc2eb, #f6d365, #a18cd1)",
  "conic-gradient(#fccb90, #d57eeb, #a18cd1, #fccb90)",
];

const Loader = ({ 
  message = "Loading...", 
  variant = "warm",
  fullScreen = true,
  size = "md"
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const style = useMemo(() => {
    const idx = Math.floor(Math.random() * GRADIENTS.length);
    const gradient = GRADIENTS[idx];
    const duration = (Math.random() * 0.8 + 1.0).toFixed(2) + "s";
    const direction = Math.random() > 0.4 ? "normal" : "reverse";
    const sizeMap = {
      sm: { outer: 64, core: 32, text: 0.8 },
      md: { outer: 86, core: 44, text: 0.95 },
      lg: { outer: 110, core: 56, text: 1.1 },
    };
    const sizes = sizeMap[size] || sizeMap.md;

    return {
      "--ring-bg": gradient,
      "--spin-duration": duration,
      "--spin-direction": direction,
      "--outer-size": `${sizes.outer}px`,
      "--core-size": `${sizes.core}px`,
      "--text-size": `${sizes.text}rem`,
    };
  }, [size]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.6,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const ringVariants = {
    hidden: { rotate: 0, scale: 0 },
    visible: { 
      rotate: 360,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: "linear",
        repeat: Infinity,
      }
    }
  };

  const coreVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [1, 0.85, 1],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i) => ({
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      x: [0, (i % 2 === 0 ? 1 : -1) * (Math.random() * 50 + 20)],
      y: [0, (i % 3 === 0 ? 1 : -1) * (Math.random() * 50 + 20)],
      transition: {
        duration: (i % 3 + 2),
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeInOut"
      }
    })
  };

  return (
    <motion.div
      className={`loader-wrapper ${fullScreen ? 'fullscreen' : 'inline'}`}
      style={style}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      aria-live="polite"
      role="status"
    >
      <div className="particles-container">
        {particles.map((particle, i) => (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            custom={i}
            variants={particleVariants}
            initial="hidden"
            animate="visible"
          />
        ))}
      </div>

      <motion.div 
        className="loader-outer"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div 
          className="loader-ring"
          variants={ringVariants}
          initial="hidden"
          animate="visible"
          style={{
            background: `var(--ring-bg)`,
            animationDuration: `var(--spin-duration)`,
            animationDirection: `var(--spin-direction)`,
          }}
        />
        
        <div className="loader-glow" />
        
        <motion.div 
          className="loader-core"
          variants={coreVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="loader-inner-core" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="loader-text-wrapper"
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        <span className="loader-text">{message}</span>
        <motion.span 
          className="loader-dots"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ...
        </motion.span>
      </motion.div>

      <motion.div 
        className="loader-progress"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 3, 
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </motion.div>
  );
};

export default Loader;