import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./Loader.css";

const STAGES = [
  {
    id: "igniting",
    label: "Preheating Tandoor",
    subtitle: "Getting the clay oven to intense baking heat...",
    progress: 25,
    badge: "Tandoor",
  },
  {
    id: "placing",
    label: "Putting Roti Inside 🔥",
    subtitle: "Placing dough on the hot clay wall...",
    progress: 52,
    badge: "Putting Roti Inside",
  },
  {
    id: "baking",
    label: "Baking Inside Tandoor",
    subtitle: "Puffing up with golden blisters...",
    progress: 82,
    badge: "Baking",
  },
  {
    id: "ready",
    label: "Fresh Roti Ready! ✨",
    subtitle: "Crisp, hot tandoori roti is ready to serve...",
    progress: 100,
    badge: "Almost Ready",
  },
];

const Loader = ({ fullScreen = true }) => {
  const [activeIdx, setActiveIdx] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % STAGES.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[activeIdx];

  return (
    <div
      className={`rw-app-preloader ${
        fullScreen ? "rw-app-preloader--fullscreen" : "rw-app-preloader--inline"
      }`}
      role="status"
    >
      {/* BACKGROUND VIGNETTE & AMBIENT FIRE GLOW */}
      <div className="rw-bg-vignette" />
      <motion.div
        className="rw-bg-glow"
        animate={{
          opacity: [0.35, 0.65, 0.35],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* RISING EMBERS */}
      <div className="rw-ember-particles">
        {[...Array(16)].map((_, i) => (
          <motion.span
            key={i}
            className="rw-ember-spark"
            style={{
              left: `${10 + ((i * 17) % 80)}%`,
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
            }}
            animate={{
              y: [0, -180, -320],
              x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i * 2), (i % 2 === 0 ? -1 : 1) * 20],
              opacity: [0, 0.85, 0],
              scale: [0.2, 1.2, 0],
            }}
            transition={{
              duration: 2.5 + (i % 3) * 0.6,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* TOP BRANDING HEADER */}
      <header className="rw-header">
        <div className="rw-badge-tag rw-badge-tag--left">
          <span>Fresh Hot</span>
          <strong>Tandoori</strong>
        </div>

        <div className="rw-brand-center">
          <div className="rw-chef-hat-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 28C14.6863 28 12 25.3137 12 22C12 19.1 14.05 16.68 16.8 16.14C17.58 11.52 21.6 8 26.4 8C29.08 8 31.48 9.15 33.19 11.02C34.73 9.77 36.72 9 38.88 9C43.5 9 47.33 12.35 48.2 16.78C51.05 17.58 53.16 20.2 53.16 23.33C53.16 27.2 50.03 30.33 46.16 30.33"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M18 30H46V44C46 47.3137 43.3137 50 40 50H24C20.6863 50 18 47.3137 18 44V30Z"
                fill="#fbbf24"
              />
            </svg>
          </div>
          <h1 className="rw-main-title">
            ROTI <span>WAALE</span>
          </h1>
          <p className="rw-sub-tagline">TASTE • TRADITION • TANDOOR</p>
        </div>

        <div className="rw-badge-circle rw-badge-tag--right">
          <span className="rw-percent">100%</span>
          <span className="rw-label">Tandoor Magic</span>
        </div>
      </header>

      {/* CENTER STAGE: TANDOOR WITH ROTI BAKING */}
      <div className="rw-stage-viewport">
        <div className="rw-tandoor-center-stage">
          {/* OUTER CLAY TANDOOR VESSEL */}
          <div className="rw-tandoor-clay-body">
            {/* INNER FIRE GLOW EFFECT */}
            <motion.div
              className="rw-tandoor-fire-glow"
              animate={{
                scale: [0.92, 1.08, 0.92],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* TANDOOR TOP PIT MOUTH */}
            <div className="rw-tandoor-pit">
              <div className="rw-pit-inner-flame" />

              {/* ROTI BAKING IN THE CENTER */}
              <motion.div
                className="rw-roti-baking"
                animate={
                  activeIdx === 0
                    ? { scale: [0, 0.8], opacity: [0, 0.8] }
                    : activeIdx === 1
                    ? { scale: [0.8, 1], opacity: 1, rotate: [-2, 2, -2] }
                    : activeIdx === 2
                    ? { scale: [1, 1.06, 1], opacity: 1 }
                    : { scale: [1, 1.1, 1], opacity: 1 }
                }
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* ROTI CHARRED BLISTER SPOTS */}
                <span className="rw-roti-spot rw-spot-1" />
                <span className="rw-roti-spot rw-spot-2" />
                <span className="rw-roti-spot rw-spot-3" />
                <span className="rw-roti-spot rw-spot-4" />
                <span className="rw-roti-spot rw-spot-5" />

                {/* STEAM RISING FROM ROTI */}
                <motion.div
                  className="rw-roti-steam"
                  animate={{ y: [-2, -22], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION BANNER */}
        <div className="rw-action-banner">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              className="rw-banner-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2>{currentStage.label}</h2>
              <p>{currentStage.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="rw-progress-block">
        <div className="rw-progress-track-outer">
          <motion.div
            className="rw-progress-track-fill"
            animate={{ width: `${currentStage.progress}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="rw-fill-head-light" />
          </motion.div>
        </div>
        <span className="rw-progress-readout">{currentStage.progress}%</span>
      </div>

      {/* TIMELINE STEPS */}
      <div className="rw-timeline">
        {STAGES.map((stg, index) => {
          const isActive = index === activeIdx;
          const isDone = index < activeIdx;

          return (
            <React.Fragment key={stg.id}>
              <div
                className={`rw-timeline-node ${isActive ? "is-active" : ""} ${
                  isDone ? "is-done" : ""
                }`}
              >
                <div className="rw-node-circle">
                  {index === 0 && <span className="rw-icon">🏺</span>}
                  {index === 1 && <span className="rw-icon">🔥</span>}
                  {index === 2 && <span className="rw-icon">🫓</span>}
                  {index === 3 && <span className="rw-icon">✨</span>}
                </div>
                <span className="rw-node-label">{stg.badge}</span>
              </div>

              {index !== STAGES.length - 1 && (
                <div
                  className={`rw-timeline-line ${
                    index < activeIdx ? "is-filled" : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* FOOTER CAPTION */}
      <div className="rw-footer-tag">🍃 Roti is on the way... 🍃</div>
    </div>
  );
};

export default Loader;