import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Loader.css";

const STAGES = [
  ["Heating the Tandoor", "Crafting the perfect hearth temperature"],
  ["Handcrafting Fresh Dough", "100% pure stone-ground chakki atta"],
  ["Baking & Puffing Roti", "Fluffy, light & golden brown perfection"],
  ["Brushing with Desi Ghee", "Infusing rich traditional aroma & warmth"],
  ["Serving Piping Hot", "From our kitchen straight to your table"],
];

const Loader = ({
  fullScreen = true,
  message,
  variant = "warm",
  size = "md",
}) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((prev) => (prev + 1) % STAGES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const [title, subtitle] = message
    ? [message, "Preparing authentic freshness for you..."]
    : STAGES[stage];

  const progressPercent = Math.round(((stage + 1) / STAGES.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className={`rw-app-preloader ${
        fullScreen ? "rw-app-preloader--fullscreen" : "rw-app-preloader--inline"
      } rw-loader-size--${size} rw-loader-variant--${variant}`}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      {/* Ambient background glow orbs */}
      <div className="rw-loader-ambient rw-ambient-1" aria-hidden="true" />
      <div className="rw-loader-ambient rw-ambient-2" aria-hidden="true" />
      <div className="rw-loader-ambient rw-ambient-3" aria-hidden="true" />

      {/* Main card container */}
      <motion.div
        className="rw-loader-card"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand Header with official logo */}
        <div className="rw-loader-brand-header">
          <div className="rw-loader-logo-wrap">
            <img
              src="/logo.png"
              alt="Roti Waale Nashik"
              className="rw-loader-logo-img"
              loading="eager"
            />
            <div className="rw-loader-logo-glow" aria-hidden="true" />
          </div>
          <div className="rw-loader-brand-text">
            <span className="rw-brand-kicker">AUTHENTIC &bull; HYGIENIC &bull; HOMESTYLE</span>
            <span className="rw-brand-sub">NASHIK</span>
          </div>
        </div>

        {/* Realistic Artisanal Tawa & Puffed Roti SVG Graphic */}
        <div className="rw-loader-stage-scene" aria-hidden="true">
          <svg
            className="rw-loader-svg"
            viewBox="0 0 320 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Tawa / Hearth Underglow */}
              <radialGradient id="hearthGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#e63900" stopOpacity="0.5" />
                <stop offset="85%" stopColor="#991b1b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#71152a" stopOpacity="0" />
              </radialGradient>

              {/* Cast Iron Tawa Texture */}
              <linearGradient id="tawaIron" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c2724" />
                <stop offset="35%" stopColor="#1e1a18" />
                <stop offset="70%" stopColor="#151211" />
                <stop offset="100%" stopColor="#0d0b0a" />
              </linearGradient>

              {/* Tawa Rim Highlight */}
              <linearGradient id="tawaRim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5c534d" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#2e2724" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#151211" stopOpacity="0.9" />
              </linearGradient>

              {/* Realistic Roti Dough Radial Shading */}
              <radialGradient id="rotiDough" cx="42%" cy="38%" r="58%">
                <stop offset="0%" stopColor="#FFF7E2" />
                <stop offset="25%" stopColor="#FDE6B8" />
                <stop offset="60%" stopColor="#E9B76A" />
                <stop offset="88%" stopColor="#CD8832" />
                <stop offset="100%" stopColor="#A85C16" />
              </radialGradient>

              {/* Roti 3D Volume Shadow */}
              <radialGradient id="rotiVolShadow" cx="50%" cy="85%" r="60%">
                <stop offset="0%" stopColor="#78340F" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#92400E" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
              </radialGradient>

              {/* Ghee Specular Highlight Sweep */}
              <linearGradient id="gheeSheen" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#FFFBEB" stopOpacity="0.75" />
                <stop offset="65%" stopColor="#FEF3C7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Char Mark Blister Gradient */}
              <radialGradient id="charBlister1" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#3d1d0a" />
                <stop offset="65%" stopColor="#69300c" />
                <stop offset="90%" stopColor="#9c4a12" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#c2641a" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="charBlister2" cx="45%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#281105" />
                <stop offset="70%" stopColor="#572408" />
                <stop offset="100%" stopColor="#873c0f" stopOpacity="0" />
              </radialGradient>

              {/* Soft blur for organic steam */}
              <filter id="steamBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {/* Pulsing Under-Tawa Fire / Hearth Heat */}
            <g className="rw-svg-hearth">
              <ellipse
                cx="160"
                cy="175"
                rx="125"
                ry="35"
                fill="url(#hearthGlow)"
                className="rw-anim-hearth"
              />
            </g>

            {/* Cast Iron Tawa Base & Handle */}
            <g className="rw-svg-tawa">
              {/* Tawa Handle Left */}
              <path
                d="M 32 170 Q 20 170 14 175 Q 8 180 18 184 L 46 180 Z"
                fill="#1c1917"
                stroke="#44403c"
                strokeWidth="1.5"
              />
              {/* Tawa Outer Shadow */}
              <ellipse cx="160" cy="180" rx="120" ry="34" fill="#181311" opacity="0.75" />
              {/* Tawa Body */}
              <ellipse
                cx="160"
                cy="174"
                rx="116"
                ry="32"
                fill="url(#tawaIron)"
                stroke="url(#tawaRim)"
                strokeWidth="3"
              />
              {/* Inner Rim Heat Sheen */}
              <ellipse
                cx="160"
                cy="173"
                rx="108"
                ry="28"
                fill="none"
                stroke="#ffaa33"
                strokeWidth="1"
                opacity="0.35"
                className="rw-anim-heat-ring"
              />
            </g>

            {/* 3D Realistic Puffed Roti Group */}
            <g className="rw-svg-roti-group">
              {/* Drop Shadow onto Tawa */}
              <ellipse
                cx="160"
                cy="166"
                rx="76"
                ry="24"
                fill="#120c09"
                opacity="0.55"
                className="rw-anim-roti-shadow"
              />

              {/* Roti Body (Puffs & Breathes with heat) */}
              <g className="rw-anim-roti-puff">
                {/* Base Bread Volume */}
                <path
                  d="M 85 142 C 82 118, 108 92, 160 92 C 214 92, 238 118, 235 142 C 233 162, 210 173, 160 173 C 109 173, 87 162, 85 142 Z"
                  fill="url(#rotiDough)"
                  stroke="#995112"
                  strokeWidth="2.5"
                  className="rw-roti-outline"
                />

                {/* Lower Puff Shade for Realistic 3D Roundness */}
                <path
                  d="M 87 144 C 95 163, 125 172, 160 172 C 196 172, 226 163, 233 144 C 225 160, 195 168, 160 168 C 124 168, 96 160, 87 144 Z"
                  fill="url(#rotiVolShadow)"
                />

                {/* Upper Dome Highlight (Soft Golden Puff) */}
                <ellipse
                  cx="156"
                  cy="124"
                  rx="52"
                  ry="24"
                  fill="#FFF8E7"
                  opacity="0.55"
                  filter="url(#steamBlur)"
                />

                {/* Authentic Charred Tandoor Blisters / Spots */}
                <g className="rw-roti-blisters">
                  {/* Big center blister */}
                  <ellipse cx="146" cy="122" rx="14" ry="9" fill="url(#charBlister1)" />
                  <ellipse cx="145" cy="121" rx="9" ry="5" fill="url(#charBlister2)" />

                  {/* Top-right toast spots */}
                  <ellipse cx="188" cy="116" rx="11" ry="7" fill="url(#charBlister1)" />
                  <ellipse cx="189" cy="115" rx="6" ry="4" fill="url(#charBlister2)" />

                  {/* Left roasted blister */}
                  <ellipse cx="114" cy="132" rx="12" ry="8" fill="url(#charBlister1)" />
                  <circle cx="113" cy="131" r="5" fill="url(#charBlister2)" />

                  {/* Lower right spots */}
                  <ellipse cx="178" cy="144" rx="13" ry="8" fill="url(#charBlister1)" />
                  <ellipse cx="177" cy="143" rx="7" ry="4" fill="url(#charBlister2)" />

                  {/* Tiny natural speckled flecks */}
                  <circle cx="132" cy="106" r="3.2" fill="#582409" opacity="0.8" />
                  <circle cx="168" cy="104" r="2.8" fill="#582409" opacity="0.75" />
                  <circle cx="128" cy="146" r="4.2" fill="#69300c" opacity="0.7" />
                  <circle cx="206" cy="132" r="3.5" fill="#582409" opacity="0.8" />
                  <circle cx="102" cy="145" r="2.5" fill="#582409" opacity="0.65" />
                  <circle cx="158" cy="140" r="3" fill="#69300c" opacity="0.7" />
                </g>

                {/* Melted Desi Ghee Shimmer Wave Sweep */}
                <path
                  d="M 87 142 C 84 120, 109 94, 160 94 C 212 94, 236 120, 233 142 C 231 160, 208 171, 160 171 C 111 171, 89 160, 87 142 Z"
                  fill="url(#gheeSheen)"
                  className="rw-anim-ghee-shimmer"
                />
              </g>
            </g>

            {/* Realistic Rising Steam Ribbons */}
            <g className="rw-svg-steam" filter="url(#steamBlur)">
              {/* Steam Wisp 1 (Left) */}
              <path
                d="M 125 105 Q 115 75 130 50 T 120 18"
                fill="none"
                stroke="#fff8e7"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="rw-anim-steam rw-steam-1"
              />
              {/* Steam Wisp 2 (Center High) */}
              <path
                d="M 160 95 Q 175 68 155 42 T 168 12"
                fill="none"
                stroke="#fffdfa"
                strokeWidth="5.5"
                strokeLinecap="round"
                className="rw-anim-steam rw-steam-2"
              />
              {/* Steam Wisp 3 (Right) */}
              <path
                d="M 195 102 Q 185 76 202 52 T 190 20"
                fill="none"
                stroke="#fff8e7"
                strokeWidth="4"
                strokeLinecap="round"
                className="rw-anim-steam rw-steam-3"
              />
            </g>

            {/* Glowing Golden Kitchen Embers Drifting Upward */}
            <g className="rw-svg-embers">
              <circle cx="108" cy="160" r="2.2" fill="#ffb703" className="rw-ember rw-ember-1" />
              <circle cx="140" cy="172" r="1.8" fill="#fb8500" className="rw-ember rw-ember-2" />
              <circle cx="180" cy="168" r="2.4" fill="#ffd166" className="rw-ember rw-ember-3" />
              <circle cx="215" cy="162" r="2" fill="#f77f00" className="rw-ember rw-ember-4" />
              <circle cx="162" cy="155" r="1.6" fill="#ffea00" className="rw-ember rw-ember-5" />
            </g>
          </svg>
        </div>

        {/* Dynamic Storytelling / Status Copy */}
        <div className="rw-loader-copy">
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rw-loader-message-wrap"
            >
              <h2 className="rw-loader-title">{title}</h2>
              <p className="rw-loader-subtitle">{subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Liquid Gold Glowing Progress Bar */}
        <div className="rw-loader-progress-area">
          <div className="rw-loader-progress-track" aria-hidden="true">
            <motion.div
              className="rw-loader-progress-bar"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="rw-progress-glow-head" />
            </motion.div>
          </div>
          <div className="rw-loader-progress-meta">
            <span className="rw-loader-step-badge">
              Step {stage + 1} of {STAGES.length}
            </span>
            <span className="rw-loader-percent">{progressPercent}%</span>
          </div>
        </div>

        {/* Interactive Culinary Stage Dots */}
        <div className="rw-loader-stepper" aria-hidden="true">
          {STAGES.map((item, index) => {
            const isCompleted = index < stage;
            const isActive = index === stage;
            return (
              <span
                key={item[0]}
                className={`rw-step-dot ${
                  isActive ? "is-active" : isCompleted ? "is-complete" : ""
                }`}
              />
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Loader;
