// src/utils/reviewPopup.js
import Swal from 'sweetalert2';
import { submitReview } from '../service/videoApi';
import toast from 'react-hot-toast';

// Keys for localStorage
const REVIEWED_KEY = 'reviewed_orders';
const SKIPPED_KEY = 'skipped_orders';

export const getReviewedOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(REVIEWED_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getSkippedOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(SKIPPED_KEY) || '[]');
  } catch {
    return [];
  }
};

export const markOrderReviewed = (orderId) => {
  const reviewed = getReviewedOrders();
  if (!reviewed.includes(orderId)) {
    reviewed.push(orderId);
    localStorage.setItem(REVIEWED_KEY, JSON.stringify(reviewed));
  }
};

export const markOrderSkipped = (orderId) => {
  const skipped = getSkippedOrders();
  if (!skipped.includes(orderId)) {
    skipped.push(orderId);
    localStorage.setItem(SKIPPED_KEY, JSON.stringify(skipped));
  }
};

export const isOrderReviewedOrSkipped = (orderId) => {
  const reviewed = getReviewedOrders();
  const skipped = getSkippedOrders();
  return reviewed.includes(orderId) || skipped.includes(orderId);
};

export const showReviewPopup = async (orderId, orderNumber) => {
  return new Promise((resolve) => {
    // Do not show if this order already reviewed or skipped
    if (isOrderReviewedOrSkipped(orderId)) {
      resolve(false);
      return;
    }
    let selectedRating = 0;
    let reviewText = '';
    let role = '';

    // Inject responsive + animated styles for the review modal once
    if (!document.getElementById('swal-review-styles')) {
      const style = document.createElement('style');
      style.id = 'swal-review-styles';
      style.innerHTML = `
        /* container & popup */
        .swal2-container { z-index: 20000 !important; align-items: center; justify-content: center; }
        .swal2-popup.swal-review-popup {
          width: min(640px, 94vw) !important;
          max-width: 640px !important;
          border-radius: 12px !important;
          padding: 18px !important;
          background: #fffaf0; /* creamy white */
          color: #0b0b0b; /* dark text */
          box-shadow: 0 18px 48px rgba(15,15,15,0.12);
          animation: swal-zoom-in 260ms cubic-bezier(.2,.9,.3,1);
          overflow: visible !important;
        }

        @keyframes swal-zoom-in {
          from { transform: translateY(8px) scale(.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Title & content resets to avoid site CSS collisions */
        .swal2-title.swal-review-title {
          background: transparent !important;
          display: block !important;
          padding: 0 !important;
          margin: 0 0 10px 0 !important;
          color: #0b0b0b !important;
          font-size: 1.05rem !important;
          font-weight: 700 !important;
        }
        .swal2-html-container.swal-review-content {
          padding: 0 !important;
          color: #0b0b0b !important;
        }

        /* Star rating micro-interactions */
        .review-rating { margin-bottom: 14px !important; }
        .review-rating span { transition: transform 160ms ease, color 160ms ease, text-shadow 160ms ease; transform-origin: center; font-size: 2.2rem; }
        .review-rating span:hover { transform: translateY(-6px) scale(1.12); }
        .review-rating span.selected { transform: translateY(-8px) scale(1.18); text-shadow: 0 6px 18px rgba(251,191,36,0.18); }

        /* Make inputs full width and tile nicely inside SweetAlert */
        .swal2-html-container .swal2-textarea.swal-review-textarea,
        .swal2-html-container .swal2-input.swal-review-input {
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .swal2-textarea.swal-review-textarea { background: #ffffff; color: #0b0b0b; border-radius: 8px; resize: vertical; min-height: 80px; max-height: 220px; padding:12px; border: 1px solid rgba(0,0,0,0.06) !important; }
        .swal2-input.swal-review-input { border-radius: 8px; background: #ffffff; color: #0b0b0b; padding:8px 10px; border: 1px solid rgba(0,0,0,0.06) !important; }

        /* Action buttons */
        .swal2-actions .swal-review-confirm { background: linear-gradient(90deg,#f2c94c 0%, #d4a017 100%) !important; color: #0b0b0b !important; border-radius: 8px !important; padding: 10px 14px !important; box-shadow: 0 6px 18px rgba(0,0,0,0.12) !important; }
        .swal2-actions .swal-review-cancel { background: transparent !important; color: rgba(0,0,0,0.75) !important; border-radius: 8px !important; padding: 8px 12px !important; border: 1px solid rgba(0,0,0,0.06) !important; }

        @media (max-width: 520px) {
          .swal2-popup.swal-review-popup { padding: 14px !important; }
          .review-rating span { font-size: 1.6rem !important; }
          .swal2-textarea.swal-review-textarea { min-height: 64px; }
        }
      `;
      document.head.appendChild(style);
    }

    const renderStars = (rating) => {
      let html = '';
      for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? '★' : '☆';
        html += `<span class="review-star" data-rating="${i}" style="cursor:pointer;font-size:2.2rem;color:${i <= rating ? '#fbbf24' : '#d1d5db'};margin:0 4px;">${filled}</span>`;
      }
      return html;
    };

    const updateStars = (rating) => {
      const stars = document.querySelectorAll('.review-rating span');
      stars.forEach((span) => {
        const val = parseInt(span.dataset.rating);
        span.textContent = val <= rating ? '★' : '☆';
        span.style.color = val <= rating ? '#fbbf24' : '#d1d5db';
      });
    };

    Swal.fire({
      title: `❤️ How was your order?`,
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:8px;font-weight:500;">Share your experience</p>
          <div class="review-rating" style="display:flex;justify-content:center;gap:6px;margin-bottom:18px;">
            ${renderStars(0)}
          </div>
          <textarea id="review-text" class="swal2-textarea swal-review-textarea" placeholder="Write your review..." rows="3"></textarea>
          <input id="review-role" class="swal2-input swal-review-input" placeholder="Your role (e.g., Customer, Food Blogger)" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✅ Submit Review',
      cancelButtonText: '⏭️ Skip',
      focusConfirm: false,
      customClass: {
        popup: 'swal-review-popup',
        title: 'swal-review-title',
        content: 'swal-review-content',
        confirmButton: 'swal-review-confirm',
        cancelButton: 'swal-review-cancel',
      },
      preConfirm: () => {
        const text = document.getElementById('review-text').value.trim();
        const roleInput = document.getElementById('review-role').value.trim();
        if (!selectedRating) {
          Swal.showValidationMessage('Please select a rating');
          return;
        }
        if (!text) {
          Swal.showValidationMessage('Please write your review');
          return;
        }
        return { rating: selectedRating, text, role: roleInput };
      },
      didOpen: () => {
        const stars = document.querySelectorAll('.review-rating span');
        stars.forEach((span) => {
          span.addEventListener('click', () => {
            const rating = parseInt(span.dataset.rating);
            selectedRating = rating;
            updateStars(rating);
            stars.forEach((s) => s.classList.remove('selected'));
            span.classList.add('selected');
          });
          span.addEventListener('mouseenter', () => {
            const rating = parseInt(span.dataset.rating);
            updateStars(rating);
          });
          span.addEventListener('mouseleave', () => {
            updateStars(selectedRating);
          });
        });
        selectedRating = 0;
        updateStars(0);
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await submitReview({
            text: result.value.text,
            rating: result.value.rating,
            role: result.value.role,
          });
          toast.success('Thank you for your review! ❤️');
          markOrderReviewed(orderId);
          resolve(true);
        } catch (error) {
          console.error(error);
          toast.error('Failed to submit review. Please try again.');
          resolve(false);
        }
      } else {
        // User skipped
        markOrderSkipped(orderId);
        resolve(false);
      }
    });
  });
};