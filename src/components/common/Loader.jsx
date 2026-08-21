import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./Loader.css";

const PHASES = [
  {
    key: "prepare",
    label: "Preparing fresh roti",
    short: "Preparing",
  },
  {
    key: "walking",
    label: "Taking roti to the tandoor",
    short: "Tandoor",
  },
  {
    key: "baking",
    label: "Baking in the tandoor",
    short: "Baking",
  },
  {
    key: "ready",
    label: "Fresh roti is almost ready",
    short: "Almost Ready",
  },
];

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const Loader = ({
  message,
  fullScreen = true,
  size = "md",
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const phase = PHASES[phaseIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  const progress = useMemo(() => {
    const values = [18, 42, 72, 94];
    return values[phaseIndex];
  }, [phaseIndex]);

  const sceneScale = {
    sm: 0.72,
    md: 0.9,
    lg: 1,
  };

  const scale = sceneScale[size] || sceneScale.md;

  /*
   * ---------------------------------------------------------
   * MAIN SCENE
   * ---------------------------------------------------------
   */

  const sceneVariants = {
    hidden: {
      opacity: 0,
      scale: 0.94,
      y: 12,
    },

    visible: {
      opacity: 1,
      scale: 1,
      y: 0,

      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * CHARACTER WALK
   * ---------------------------------------------------------
   */

  const characterVariants = {
    prepare: {
      x: -190,
      y: 0,
      rotate: 0,
    },

    walking: {
      x: [-190, -150, -100, -50, 0, 18],
      y: [0, -3, 0, -3, 0, 0],
      rotate: [0, -1, 1, -1, 1, 0],

      transition: {
        duration: 2.5,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.82, 1],
      },
    },

    baking: {
      x: 18,
      y: 0,
      rotate: 0,

      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },

    ready: {
      x: 5,
      y: 0,
      rotate: 0,

      transition: {
        duration: 0.35,
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * WALKING LEGS
   * ---------------------------------------------------------
   */

  const leftLegVariants = {
    prepare: {
      rotate: 8,
    },

    walking: {
      rotate: [22, -20, 22, -20, 8],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      rotate: 5,
    },

    ready: {
      rotate: 4,
    },
  };

  const rightLegVariants = {
    prepare: {
      rotate: -8,
    },

    walking: {
      rotate: [-20, 22, -20, 22, -8],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      rotate: -5,
    },

    ready: {
      rotate: -4,
    },
  };

  /*
   * ---------------------------------------------------------
   * ARMS
   * ---------------------------------------------------------
   */

  const leftArmVariants = {
    prepare: {
      rotate: -8,
    },

    walking: {
      rotate: [-14, 14, -14, 14, -8],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      rotate: -35,

      transition: {
        duration: 0.5,
      },
    },

    ready: {
      rotate: -12,
    },
  };

  const rightArmVariants = {
    prepare: {
      rotate: -18,
    },

    walking: {
      rotate: [-8, 16, -8, 16, -18],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      rotate: -42,

      transition: {
        duration: 0.5,
      },
    },

    ready: {
      rotate: -15,
    },
  };

  /*
   * ---------------------------------------------------------
   * TRAY
   * ---------------------------------------------------------
   */

  const trayVariants = {
    prepare: {
      rotate: -2,
      y: 0,
    },

    walking: {
      rotate: [-2, 2, -2, 2, -1],
      y: [0, -2, 0, -2, 0],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      rotate: -3,
      x: 35,
      y: -4,

      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },

    ready: {
      rotate: 0,
      x: 15,
      y: 0,

      transition: {
        duration: 0.5,
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * ROTI ENTERING TANDOOR
   * ---------------------------------------------------------
   */

  const rotiVariants = {
    prepare: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    },

    walking: {
      opacity: 1,
      x: 0,
      y: [-1, 2, -1],
      rotate: [-2, 2, -2],

      transition: {
        duration: 0.52,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    baking: {
      opacity: [1, 1, 0],
      x: [0, 42, 68],
      y: [0, -8, -22],
      rotate: [0, 18, 35],
      scale: [1, 0.96, 0.82],

      transition: {
        duration: 0.95,
        ease: [0.4, 0, 1, 1],
      },
    },

    ready: {
      opacity: 0,
    },
  };

  /*
   * ---------------------------------------------------------
   * COOKING ROTI
   * ---------------------------------------------------------
   */

  const cookingRotiVariants = {
    prepare: {
      opacity: 0,
      scale: 0.5,
    },

    walking: {
      opacity: 0,
      scale: 0.5,
    },

    baking: {
      opacity: [0, 1, 1],
      scale: [0.45, 0.9, 1],
      rotate: [-20, 8, -4],

      transition: {
        duration: 1.1,
        ease: "easeOut",
      },
    },

    ready: {
      opacity: [1, 1, 0],
      scale: [1, 1.04, 0.95],
      y: [0, -3, -10],

      transition: {
        duration: 1.2,
        ease: "easeInOut",
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * FIRE
   * ---------------------------------------------------------
   */

  const fireVariants = {
    prepare: {
      opacity: 0.65,
      scale: 0.9,
    },

    walking: {
      opacity: 0.8,
      scale: 0.95,
    },

    baking: {
      opacity: [0.7, 1, 0.75, 1, 0.8],
      scale: [0.9, 1.18, 0.92, 1.15, 0.95],

      transition: {
        duration: 0.7,
        repeat: 4,
        ease: "easeInOut",
      },
    },

    ready: {
      opacity: [0.8, 1, 0.75],
      scale: [0.95, 1.12, 0.9],

      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * TANDOOR GLOW
   * ---------------------------------------------------------
   */

  const glowVariants = {
    prepare: {
      opacity: 0.22,
      scale: 0.9,
    },

    walking: {
      opacity: 0.32,
      scale: 1,
    },

    baking: {
      opacity: [0.35, 0.75, 0.45, 0.8],
      scale: [1, 1.12, 1, 1.1],

      transition: {
        duration: 0.9,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },

    ready: {
      opacity: [0.4, 0.85, 0.5],
      scale: [1, 1.13, 1],

      transition: {
        duration: 1.1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  /*
   * ---------------------------------------------------------
   * SMOKE
   * ---------------------------------------------------------
   */

  const smokeParticles = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    delay: index * 0.28,
  }));

  /*
   * ---------------------------------------------------------
   * FLOUR PARTICLES
   * ---------------------------------------------------------
   */

  const flourParticles = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: 15 + ((index * 17) % 70),
    delay: index * 0.12,
    duration: 2.4 + (index % 3) * 0.5,
  }));

  return (
    <motion.div
      className={[
        "rw-loader",
        fullScreen
          ? "rw-loader--fullscreen"
          : "rw-loader--inline",
        `rw-loader--${size}`,
      ].join(" ")}
      initial="hidden"
      animate="visible"
      variants={sceneVariants}
      role="status"
      aria-live="polite"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="rw-loader__background">
        <div className="rw-loader__background-glow" />
        <div className="rw-loader__background-glow rw-loader__background-glow--two" />

        <div className="rw-loader__decor rw-loader__decor--left">
          ✦
        </div>

        <div className="rw-loader__decor rw-loader__decor--right">
          ✦
        </div>
      </div>

      {/* =====================================================
          FLOUR
          ===================================================== */}

      <div className="rw-loader__flour-field">
        {flourParticles.map((particle) => (
          <motion.span
            key={particle.id}
            className="rw-loader__flour"
            style={{
              left: `${particle.left}%`,
            }}
            animate={{
              y: [10, -35, -65],
              x: [0, particle.id % 2 ? 14 : -14, particle.id % 2 ? 22 : -20],
              opacity: [0, 0.55, 0],
              scale: [0.25, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* =====================================================
          MAIN SCENE
          ===================================================== */}

      <motion.div
        className="rw-loader__scene"
        style={{
          "--scene-scale": scale,
        }}
      >
        {/* Ground */}
        <div className="rw-loader__ground">
          <motion.div
            className="rw-loader__ground-shadow"
            animate={{
              scaleX: [1, 0.9, 1],
              opacity: [0.35, 0.22, 0.35],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* =================================================
            TANDOOR
            ================================================= */}

        <div className="rw-tandoor">
          {/* Heat glow */}
          <motion.div
            className="rw-tandoor__outer-glow"
            variants={glowVariants}
            animate={phase.key}
          />

          {/* Smoke */}
          <div className="rw-tandoor__smoke">
            {smokeParticles.map((particle) => (
              <motion.span
                key={particle.id}
                animate={{
                  y: [-2, -45, -78],
                  x: [
                    0,
                    particle.id % 2 ? 14 : -12,
                    particle.id % 2 ? 22 : -18,
                  ],
                  opacity: [0, 0.4, 0],
                  scale: [0.3, 0.8, 1.2],
                }}
                transition={{
                  duration: 2.5,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Chimney */}
          <div className="rw-tandoor__chimney">
            <div className="rw-tandoor__chimney-cap" />
            <div className="rw-tandoor__chimney-body" />
          </div>

          {/* Main body */}
          <div className="rw-tandoor__body">
            {/* decorative texture */}
            <div className="rw-tandoor__texture">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            {/* top lip */}
            <div className="rw-tandoor__lip">
              <div className="rw-tandoor__mouth">
                <div className="rw-tandoor__inside">
                  {/* fire */}
                  <motion.div
                    className="rw-fire"
                    variants={fireVariants}
                    animate={phase.key}
                  >
                    <span className="rw-fire__flame rw-fire__flame--back" />
                    <span className="rw-fire__flame rw-fire__flame--left" />
                    <span className="rw-fire__flame rw-fire__flame--main" />
                    <span className="rw-fire__flame rw-fire__flame--right" />
                    <span className="rw-fire__core" />
                  </motion.div>

                  {/* cooking roti */}
                  <motion.div
                    className="rw-cooking-roti"
                    variants={cookingRotiVariants}
                    animate={phase.key}
                  >
                    <div className="rw-cooking-roti__bubble rw-cooking-roti__bubble--1" />
                    <div className="rw-cooking-roti__bubble rw-cooking-roti__bubble--2" />
                    <div className="rw-cooking-roti__bubble rw-cooking-roti__bubble--3" />
                    <div className="rw-cooking-roti__bubble rw-cooking-roti__bubble--4" />
                    <div className="rw-cooking-roti__bubble rw-cooking-roti__bubble--5" />

                    <div className="rw-cooking-roti__spot rw-cooking-roti__spot--1" />
                    <div className="rw-cooking-roti__spot rw-cooking-roti__spot--2" />
                    <div className="rw-cooking-roti__spot rw-cooking-roti__spot--3" />
                    <div className="rw-cooking-roti__spot rw-cooking-roti__spot--4" />
                    <div className="rw-cooking-roti__spot rw-cooking-roti__spot--5" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Body rings */}
            <div className="rw-tandoor__ring rw-tandoor__ring--1" />
            <div className="rw-tandoor__ring rw-tandoor__ring--2" />
            <div className="rw-tandoor__ring rw-tandoor__ring--3" />

            {/* Highlight */}
            <div className="rw-tandoor__highlight" />

            {/* Base */}
            <div className="rw-tandoor__base" />
          </div>
        </div>

        {/* =================================================
            ROTI WAALE CHARACTER
            ================================================= */}

        <motion.div
          className="rw-character"
          variants={characterVariants}
          animate={phase.key}
        >
          {/* shadow */}
          <motion.div
            className="rw-character__shadow"
            animate={{
              scaleX: [1, 0.88, 1],
              opacity: [0.4, 0.25, 0.4],
            }}
            transition={{
              duration: 0.52,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* head */}
          <div className="rw-character__head">
            <div className="rw-character__ear rw-character__ear--left" />
            <div className="rw-character__ear rw-character__ear--right" />

            <div className="rw-character__face">
              <div className="rw-character__eye rw-character__eye--left" />
              <div className="rw-character__eye rw-character__eye--right" />

              <div className="rw-character__eyebrow rw-character__eyebrow--left" />
              <div className="rw-character__eyebrow rw-character__eyebrow--right" />

              <div className="rw-character__nose" />

              <div className="rw-character__moustache">
                <span />
                <span />
              </div>

              <div className="rw-character__smile" />
            </div>

            {/* hair */}
            <div className="rw-character__hair" />

            {/* chef cap */}
            <div className="rw-character__cap">
              <div className="rw-character__cap-top">
                <span />
                <span />
                <span />
              </div>

              <div className="rw-character__cap-band">
                <span>ROTI</span>
              </div>
            </div>
          </div>

          {/* neck */}
          <div className="rw-character__neck" />

          {/* body */}
          <div className="rw-character__body">
            <div className="rw-character__collar rw-character__collar--left" />
            <div className="rw-character__collar rw-character__collar--right" />

            <div className="rw-character__buttons">
              <span />
              <span />
              <span />
            </div>

            {/* apron */}
            <div className="rw-character__apron">
              <div className="rw-character__apron-logo">
                <span>R</span>
              </div>
            </div>
          </div>

          {/* left arm */}
          <motion.div
            className="rw-character__arm rw-character__arm--left"
            variants={leftArmVariants}
            animate={phase.key}
          >
            <div className="rw-character__hand" />
          </motion.div>

          {/* right arm */}
          <motion.div
            className="rw-character__arm rw-character__arm--right"
            variants={rightArmVariants}
            animate={phase.key}
          >
            <div className="rw-character__hand" />
          </motion.div>

          {/* tray */}
          <motion.div
            className="rw-tray"
            variants={trayVariants}
            animate={phase.key}
          >
            <div className="rw-tray__surface">
              <div className="rw-tray__roti rw-tray__roti--one" />
              <div className="rw-tray__roti rw-tray__roti--two" />
              <div className="rw-tray__roti rw-tray__roti--three" />
            </div>

            <div className="rw-tray__rim" />
          </motion.div>

          {/* legs */}
          <motion.div
            className="rw-character__leg rw-character__leg--left"
            variants={leftLegVariants}
            animate={phase.key}
          >
            <div className="rw-character__shoe" />
          </motion.div>

          <motion.div
            className="rw-character__leg rw-character__leg--right"
            variants={rightLegVariants}
            animate={phase.key}
          >
            <div className="rw-character__shoe" />
          </motion.div>

          {/* carried roti */}
          <motion.div
            className="rw-carried-roti"
            variants={rotiVariants}
            animate={phase.key}
          >
            <span />
            <span />
            <span />
            <span />
          </motion.div>
        </motion.div>

        {/* Heat waves */}
        <div className="rw-heat">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={{
                opacity: [0, 0.5, 0],
                scaleY: [0.75, 1.15, 0.75],
              }}
              transition={{
                duration: 1.1 + index * 0.15,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* =====================================================
          BRAND
          ===================================================== */}

      <motion.div
        className="rw-loader__brand"
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.35,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="rw-loader__brand-name">
          <span className="rw-loader__brand-roti">
            ROTI
          </span>

          <span className="rw-loader__brand-waale">
            WAALE
          </span>
        </div>

        <div className="rw-loader__tagline">
          Fresh From The Tandoor
        </div>
      </motion.div>

      {/* =====================================================
          MESSAGE
          ===================================================== */}

      <div className="rw-loader__message-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.key}
            className="rw-loader__message"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <span>
              {message || phase.label}
            </span>

            <span className="rw-loader__dots">
              <i />
              <i />
              <i />
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =====================================================
          PROGRESS
          ===================================================== */}

      <div className="rw-loader__progress-container">
        <div className="rw-loader__progress">
          <motion.div
            className="rw-loader__progress-fill"
            animate={{
              width: `${clamp(progress, 0, 100)}%`,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <motion.div
            className="rw-loader__progress-shine"
            animate={{
              x: ["-100%", "250%"],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.span
          className="rw-loader__percentage"
          key={progress}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          {progress}%
        </motion.span>
      </div>

      {/* =====================================================
          STEPS
          ===================================================== */}

      <div className="rw-loader__steps">
        {PHASES.map((item, index) => {
          const active = index === phaseIndex;
          const completed = index < phaseIndex;

          return (
            <div
              key={item.key}
              className={[
                "rw-loader__step",
                active ? "is-active" : "",
                completed ? "is-completed" : "",
              ].join(" ")}
            >
              <motion.div
                className="rw-loader__step-icon"
                animate={
                  active
                    ? {
                        scale: [1, 1.12, 1],
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  duration: 0.8,
                  repeat: active ? Infinity : 0,
                }}
              >
                {index === 0 && "🫓"}
                {index === 1 && "🏺"}
                {index === 2 && "🔥"}
                {index === 3 && "✨"}
              </motion.div>

              <span>{item.short}</span>

              {index !== PHASES.length - 1 && (
                <div className="rw-loader__step-line" />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom accent */}
      <div className="rw-loader__bottom-accent" />
    </motion.div>
  );
};

export default Loader;