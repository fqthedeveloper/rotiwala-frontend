// src/components/Home/TestimonialSection.jsx
import React, { useState, useEffect } from 'react';
import { getApprovedReviews } from '../../service/videoApi';
import { AnimatePresence, motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EASE = [0.22, 1, 0.36, 1];

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getApprovedReviews();
        setReviews(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Auto‑slide
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  if (loading) {
    return <div className="text-center py-5" style={{ color: '#6b7280' }}>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  return (
    <>
      {/* Arrows + Slider */}
      <div className="rw-t-wrap" data-testid="testimonials">
        <button
          data-testid="testimonial-prev-btn"
          className="rw-t-arrow"
          onClick={handlePrev}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>

        <div className="rw-t-slider">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="rw-t-card"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <FaQuoteLeft className="rw-t-quote" />
              <p className="rw-t-text">{currentReview.text}</p>
              <div className="rw-t-stars">
                {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <div className="rw-t-author">
                <div className="rw-t-avatar">
                  {currentReview.customer_name ? currentReview.customer_name.charAt(0) : 'U'}
                </div>
                <div>
                  <strong>{currentReview.customer_name || 'Customer'}</strong>
                  <span>{currentReview.role || 'Customer'}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          data-testid="testimonial-next-btn"
          className="rw-t-arrow"
          onClick={handleNext}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Dots below */}
      <div className="rw-t-dots">
        {reviews.map((_, i) => (
          <button
            key={i}
            data-testid={`testimonial-dot-${i}`}
            className={`rw-t-dot ${i === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
};

export default TestimonialSection;