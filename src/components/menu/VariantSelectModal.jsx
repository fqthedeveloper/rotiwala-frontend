// src/components/menu/VariantSelectModal.jsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { getServerImageUrl } from "../../utils/imageUtils";
import "./VariantSelectModal.css";

const VariantSelectModal = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const variants = item?.variants || [];
  const activeVariants = variants.filter((v) => v.is_active !== false);

  useEffect(() => {
    if (isOpen && activeVariants.length > 0) {
      // Find first available variant, or fallback to first
      const firstAvail = activeVariants.find((v) => v.is_available) || activeVariants[0];
      setSelectedVariantId(firstAvail?.id || null);
      setQuantity(1);
    }
  }, [isOpen, item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) || null;
  const unitPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(item.base_price || 0);
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleAdd = () => {
    if (!selectedVariant) return;
    onAddToCart(item, selectedVariant, quantity);
  };

  const imgSrc = getServerImageUrl(item.image_url || item.image);

  return (
    <div className="vsm-overlay" onClick={onClose}>
      <div className="vsm-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="vsm-close-btn"
          onClick={onClose}
          aria-label="Close variant selector"
        >
          <FaTimes />
        </button>

        {/* Dish Image */}
        <div className="vsm-header">
          <img
            src={imgSrc}
            alt={item.name}
            className="vsm-header-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/logo.png";
            }}
          />
        </div>

        {/* Dish Info & Variants */}
        <div className="vsm-content">
          <div className="vsm-title-row">
            <h3 className="vsm-dish-name">{item.name}</h3>
            {item.description && (
              <p className="vsm-dish-desc">{item.description}</p>
            )}
          </div>

          <div className="vsm-section-label">
            <h5>Select Option</h5>
            <span className="vsm-section-badge">Required</span>
          </div>

          {/* Variants List */}
          <div className="vsm-variants-list">
            {activeVariants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const isAvailable = variant.is_available !== false;
              return (
                <div
                  key={variant.id}
                  className={`vsm-variant-option ${isSelected ? "selected" : ""} ${
                    !isAvailable ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (isAvailable) setSelectedVariantId(variant.id);
                  }}
                >
                  <div className="vsm-option-left">
                    <div className="vsm-radio-circle">
                      {isSelected && <div className="vsm-radio-dot" />}
                    </div>
                    <div>
                      <div className="vsm-option-name">{variant.name}</div>
                      {!isAvailable && (
                        <small style={{ color: "#dc2626", fontSize: "0.74rem" }}>
                          Currently Unavailable
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="vsm-option-price">
                    ₹{parseFloat(variant.price).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Controls */}
          <div className="vsm-qty-row">
            <span className="vsm-qty-label">Quantity</span>
            <div className="vsm-qty-counter">
              <button
                className="vsm-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <FaMinus size={11} />
              </button>
              <span className="vsm-qty-value">{quantity}</span>
              <button
                className="vsm-qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <FaPlus size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="vsm-footer">
          <div className="vsm-total-box">
            <span className="vsm-total-label">Total Price</span>
            <span className="vsm-total-price">₹{totalPrice}</span>
          </div>
          <button
            className="vsm-add-btn"
            disabled={!selectedVariant || selectedVariant.is_available === false}
            onClick={handleAdd}
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectModal;
