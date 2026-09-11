// src/utils/reviewPopup.js
import Swal from 'sweetalert2';
import { submitReview } from '../service/videoApi';
import toast from 'react-hot-toast';

// Keys for localStorage
const REVIEWED_KEY = 'reviewed_orders';
const SKIPPED_KEY = 'skipped_orders';
const DISMISSED_UNTIL_KEY = 'review_dismissed_until_order_id';

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

export const getDismissedUntilOrderId = () => {
  try {
    const val = localStorage.getItem(DISMISSED_UNTIL_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const setDismissedUntilOrderId = (orderId) => {
  try {
    const current = getDismissedUntilOrderId();
    const newMax = Math.max(current, parseInt(orderId, 10) || 0);
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(newMax));
  } catch (err) {
    console.error('Error saving dismissed order threshold:', err);
  }
};

export const markOrderReviewed = (orderId) => {
  const reviewed = getReviewedOrders();
  const idNum = parseInt(orderId, 10);
  if (!reviewed.includes(idNum)) {
    reviewed.push(idNum);
    localStorage.setItem(REVIEWED_KEY, JSON.stringify(reviewed));
  }
  setDismissedUntilOrderId(idNum);
};

export const markOrderSkipped = (orderId, allCollectedIds = []) => {
  const skipped = getSkippedOrders();
  const idNum = parseInt(orderId, 10);
  if (!skipped.includes(idNum)) {
    skipped.push(idNum);
  }
  allCollectedIds.forEach((id) => {
    const num = parseInt(id, 10);
    if (num && !skipped.includes(num)) {
      skipped.push(num);
    }
  });
  localStorage.setItem(SKIPPED_KEY, JSON.stringify(skipped));

  // Also update threshold so no past or current collected order triggers until NEXT order is collected
  const highestId = Math.max(
    idNum || 0,
    ...(allCollectedIds.map((id) => parseInt(id, 10) || 0))
  );
  setDismissedUntilOrderId(highestId);
};

export const isOrderReviewedOrSkipped = (orderId) => {
  const idNum = parseInt(orderId, 10);
  const reviewed = getReviewedOrders();
  const skipped = getSkippedOrders();
  const dismissedUntil = getDismissedUntilOrderId();
  return (
    reviewed.includes(idNum) ||
    skipped.includes(idNum) ||
    (dismissedUntil > 0 && idNum <= dismissedUntil)
  );
};

export const showReviewPopup = async (orderId, orderNumber, allCollectedIds = []) => {
  return new Promise((resolve) => {
    const idNum = parseInt(orderId, 10);
    // Do not show if this order already reviewed, skipped, or below dismissed threshold
    if (isOrderReviewedOrSkipped(idNum)) {
      resolve(false);
      return;
    }

    let selectedRating = 0;
    let hoveredRating = 0;

    const ratingDescriptions = [
      'Tap a star to rate your meal',
      'Terrible 😞',
      'Could be better 🙁',
      'Good / Average 😐',
      'Very Delicious! 😊',
      'Amazing & Outstanding! 🤩',
    ];

    // Inject responsive + animated styles for the review modal once
    if (!document.getElementById('swal-review-styles')) {
      const style = document.createElement('style');
      style.id = 'swal-review-styles';
      style.innerHTML = `
        /* Container & popup */
        .swal2-container.swal-review-container {
          z-index: 20000 !important;
          backdrop-filter: blur(6px) !important;
          -webkit-backdrop-filter: blur(6px) !important;
          padding: 12px !important;
        }
        .swal2-popup.swal-review-popup {
          width: min(520px, 94vw) !important;
          max-width: 520px !important;
          border-radius: 24px !important;
          padding: 24px 20px !important;
          background: #ffffff !important;
          color: #1e293b !important;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
          animation: swal-review-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          box-sizing: border-box !important;
        }

        @keyframes swal-review-entrance {
          from {
            transform: translateY(20px) scale(0.92);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .swal2-title.swal-review-title {
          display: none !important;
        }

        .swal2-html-container.swal-review-content {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Review Header */
        .rw-review-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .rw-review-avatar {
          width: 64px;
          height: 64px;
          margin: 0 auto 12px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);
          animation: rw-heartbeat 2s ease-in-out infinite;
        }
        @keyframes rw-heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .rw-review-title {
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }
        .rw-review-order-tag {
          display: inline-block;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 3px 12px;
          border-radius: 12px;
        }

        /* Rating Stars */
        .rw-stars-wrapper {
          text-align: center;
          margin-bottom: 20px;
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px 10px 14px;
          border: 1px solid #e2e8f0;
        }
        .rw-stars-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          user-select: none;
        }
        .rw-star-btn {
          background: none;
          border: none;
          outline: none;
          font-size: clamp(2rem, 5vw, 2.5rem);
          line-height: 1;
          cursor: pointer;
          padding: 0 2px;
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease;
          color: #cbd5e1;
        }
        .rw-star-btn:hover {
          transform: translateY(-4px) scale(1.22);
        }
        .rw-star-btn.active {
          color: #f59e0b;
          text-shadow: 0 3px 12px rgba(245, 158, 11, 0.4);
        }
        .rw-star-btn.bounce {
          animation: rw-star-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes rw-star-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.35) rotate(-6deg); }
          100% { transform: scale(1.15); }
        }
        .rw-rating-desc {
          font-size: 0.9rem;
          font-weight: 700;
          color: #d97706;
          min-height: 22px;
          transition: all 0.2s ease;
        }

        /* Form Controls - No horizontal scrollbar */
        .rw-form-group {
          margin-bottom: 14px;
          text-align: left;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .rw-form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }
        .swal2-html-container .swal2-textarea.rw-textarea,
        .swal2-html-container .swal2-input.rw-input {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          border-radius: 12px !important;
          border: 1.5px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          font-size: 0.95rem !important;
          padding: 12px 14px !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow-x: hidden !important;
        }
        .swal2-html-container .swal2-textarea.rw-textarea:focus,
        .swal2-html-container .swal2-input.rw-input:focus {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
          outline: none !important;
        }
        .swal2-html-container .swal2-textarea.rw-textarea {
          min-height: 86px;
          max-height: 180px;
          resize: vertical;
        }

        /* Actions styling */
        .swal2-actions.swal-review-actions {
          width: 100% !important;
          margin: 18px 0 0 0 !important;
          display: flex !important;
          flex-direction: row-reverse !important;
          gap: 12px !important;
          justify-content: stretch !important;
        }
        .swal-review-confirm {
          flex: 1.4 !important;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          font-size: 0.95rem !important;
          border-radius: 12px !important;
          padding: 12px 20px !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 8px 20px -4px rgba(217, 119, 6, 0.4) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .swal-review-confirm:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 24px -4px rgba(217, 119, 6, 0.5) !important;
        }
        .swal-review-cancel {
          flex: 1 !important;
          background: #f1f5f9 !important;
          color: #64748b !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          border: 1px solid #e2e8f0 !important;
          cursor: pointer !important;
          transition: background 0.2s ease, color 0.2s ease !important;
        }
        .swal-review-cancel:hover {
          background: #e2e8f0 !important;
          color: #334155 !important;
        }

        @media (max-width: 460px) {
          .swal2-popup.swal-review-popup {
            padding: 20px 16px !important;
            border-radius: 20px !important;
          }
          .rw-stars-row {
            gap: 6px;
          }
          .swal2-actions.swal-review-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .swal-review-confirm, .swal-review-cancel {
            width: 100% !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const renderStars = () => {
      let html = '';
      for (let i = 1; i <= 5; i++) {
        html += `<button type="button" class="rw-star-btn" data-rating="${i}" aria-label="${i} stars">★</button>`;
      }
      return html;
    };

    const updateStarUI = (rating) => {
      const starButtons = document.querySelectorAll('.rw-star-btn');
      const descEl = document.getElementById('rw-rating-desc');
      starButtons.forEach((btn) => {
        const val = parseInt(btn.dataset.rating, 10);
        if (val <= rating) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      if (descEl) {
        descEl.textContent = ratingDescriptions[rating] || ratingDescriptions[0];
      }
    };

    Swal.fire({
      html: `
        <div class="rw-review-modal-body">
          <div class="rw-review-header">
            <div class="rw-review-avatar">😋</div>
            <h3 class="rw-review-title">How was your order?</h3>
            <span class="rw-review-order-tag">Order #${orderNumber || idNum}</span>
          </div>

          <div class="rw-stars-wrapper">
            <div class="rw-stars-row">
              ${renderStars()}
            </div>
            <div id="rw-rating-desc" class="rw-rating-desc">
              ${ratingDescriptions[0]}
            </div>
          </div>

          <div class="rw-form-group">
            <label class="rw-form-label" for="review-text">Your Feedback</label>
            <textarea id="review-text" class="swal2-textarea rw-textarea" placeholder="Tell us how the food tasted, delivery speed, or quality..." rows="3"></textarea>
          </div>

          <div class="rw-form-group">
            <label class="rw-form-label" for="review-role">Your Name / Title (Optional)</label>
            <input id="review-role" class="swal2-input rw-input" placeholder="e.g. Happy Customer, Foodie" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Submit Review',
      cancelButtonText: '⏭️ Skip for Now',
      focusConfirm: false,
      customClass: {
        container: 'swal-review-container',
        popup: 'swal-review-popup',
        title: 'swal-review-title',
        htmlContainer: 'swal-review-content',
        actions: 'swal-review-actions',
        confirmButton: 'swal-review-confirm',
        cancelButton: 'swal-review-cancel',
      },
      preConfirm: () => {
        const text = document.getElementById('review-text')?.value.trim();
        const roleInput = document.getElementById('review-role')?.value.trim();
        if (!selectedRating || selectedRating === 0) {
          Swal.showValidationMessage('Please tap a star to give a rating (1 to 5)');
          return false;
        }
        if (!text) {
          Swal.showValidationMessage('Please share a brief comment about your meal');
          return false;
        }
        return { rating: selectedRating, text, role: roleInput || 'Customer' };
      },
      didOpen: () => {
        const starButtons = document.querySelectorAll('.rw-star-btn');
        starButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const rating = parseInt(btn.dataset.rating, 10);
            selectedRating = rating;
            updateStarUI(rating);
            starButtons.forEach((b) => b.classList.remove('bounce'));
            btn.classList.add('bounce');
          });

          btn.addEventListener('mouseenter', () => {
            hoveredRating = parseInt(btn.dataset.rating, 10);
            updateStarUI(hoveredRating);
          });

          btn.addEventListener('mouseleave', () => {
            updateStarUI(selectedRating);
          });
        });

        updateStarUI(0);
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
          markOrderReviewed(idNum);
          resolve(true);
        } catch (error) {
          console.error(error);
          toast.error('Failed to submit review. Please try again.');
          resolve(false);
        }
      } else {
        // User clicked "Skip" or dismissed the modal
        markOrderSkipped(idNum, allCollectedIds);
        resolve(false);
      }
    });
  });
};