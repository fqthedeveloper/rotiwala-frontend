// src/components/Home/Marquee.jsx
import React, { useState, useEffect } from 'react';
import { getMarqueeItems } from '../../service/videoApi';

const Marquee = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMarqueeItems();
        // support both res.data array or direct array
        const data = res && res.data ? res.data : res || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching marquee:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="marquee-loading" style={{ padding: '10px', textAlign: 'center' }}>Loading...</div>;
  if (items.length === 0) return null;

  // normalize to text strings
  const marqueeItems = items.map((it) => (typeof it === 'string' ? it : it.text || it.title || ''));

  return (
    <div className="rw-marquee" aria-hidden="true">
      <style>{`
        /* ===================================================
           MARQUEE — slow editorial strip
        =================================================== */
        .rw-marquee {
          margin: 0 -24px 64px;
          background: linear-gradient(180deg,#3d0f0f 0%, #2b0b07 50%);
          color: #f0d79a;
          overflow: hidden;
          padding: 20px 0;
          border-top: 1px solid rgba(212, 164, 55, 0.18);
          border-bottom: 1px solid rgba(212, 164, 55, 0.18);
        }
        .rw-marquee-track {
          display: flex;
          width: max-content;
          animation: rwMarquee 32s linear infinite;
        }
        .rw-marquee:hover .rw-marquee-track { animation-play-state: paused; }
        .rw-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 0 28px;
          font-family: inherit;
          font-style: italic;
          font-size: 1.05rem;
          white-space: nowrap;
        }
        .rw-marquee-item i {
          font-style: normal;
          color: #d4a037;
          font-size: 0.95rem;
        }
        @keyframes rwMarquee { to { transform: translateX(-50%); } }

        /* Responsive tweaks */
        @media (max-width: 880px) {
          .rw-marquee { margin-left: -12px; margin-right: -12px; }
          .rw-marquee-item { padding: 0 18px; font-size: 0.95rem; }
          .rw-marquee-track { animation-duration: 26s; }
        }
        @media (max-width: 520px) {
          .rw-marquee { padding: 12px 0; margin-bottom: 28px; }
          .rw-marquee-item { padding: 0 12px; font-size: 0.92rem; }
          .rw-marquee-track { animation-duration: 22s; }
        }
      `}</style>

      <div className="rw-marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span className="rw-marquee-item" key={i}>
            {item} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;