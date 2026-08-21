// frontend/src/pages/Checkout.jsx

import { useEffect, useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCart } from "../../service/cartService";
import { placeOrder } from "../../service/orderService";
import { fetchAvailablePromotions, applyPromotionPreview } from "../../service/couponService";
import api, { getAddresses, createAddress } from "../../service/api";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import "./CSS/Checkout.css";

const libraries = ["places"];
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function Checkout() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // ----- Core States -----
  const [loading, setLoading] = useState(true);
  const [redirectToCart, setRedirectToCart] = useState(false);
  const [cart, setCart] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ----- Delivery Option -----
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [addressError, setAddressError] = useState("");

  // ----- Delivery Distance Validation -----
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isWithinRadius, setIsWithinRadius] = useState(true);

  // ----- Pickup & Payment (only for pickup) -----
  const [pickupByOtherPerson, setPickupByOtherPerson] = useState(false);
  const [pickupPersonName, setPickupPersonName] = useState("");
  const [pickupPersonPhone, setPickupPersonPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [pickupType, setPickupType] = useState("instant");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  // ----- Promotion States -----
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState({
    type: null,
    name: "",
    amount: 0,
    finalTotal: 0,
    originalTotal: 0,
    items: [],
  });
  const [isApplying, setIsApplying] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [promotionMessage, setPromotionMessage] = useState("");
  const [fetchingPromotions, setFetchingPromotions] = useState(false);

  // ----- Manual coupon input -----
  const [manualCouponCode, setManualCouponCode] = useState("");
  const [showManualCoupon, setShowManualCoupon] = useState(false);

  // ----- Saved Addresses -----
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");

  // ----- Map Modal -----
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapMarker, setMapMarker] = useState(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  // ============================================
  // 1. Load Cart and Shops
  // ============================================
  useEffect(() => {
    document.title = "Check Out - Roti Wala";
    loadData();
  }, []);

  // ============================================
  // 2. Load Promotions when Shop Changes
  // ============================================
  useEffect(() => {
    if (shopId) {
      setSelectedPromotion(null);
      setAppliedDiscount({
        type: null,
        name: "",
        amount: 0,
        finalTotal: 0,
        originalTotal: 0,
        items: [],
      });
      setDiscountError("");
      setPromotionMessage("");
      setManualCouponCode("");
      fetchPromotions(shopId);
    }
  }, [shopId]);

  // ============================================
  // 3. Preview when selected promotion changes
  // ============================================
  useEffect(() => {
    if (selectedPromotion && shopId) {
      applySelectedPromotion();
    }
  }, [selectedPromotion]);

  // ============================================
  // 4. Calculate delivery distance when shop or location changes
  // ============================================
  useEffect(() => {
    if (
      deliveryOption === "delivery" &&
      selectedShop &&
      deliveryLat !== null &&
      deliveryLng !== null &&
      selectedShop.latitude &&
      selectedShop.longitude
    ) {
      const dist = calculateDistance(
        parseFloat(selectedShop.latitude),
        parseFloat(selectedShop.longitude),
        deliveryLat,
        deliveryLng
      );
      setDeliveryDistance(dist);
      const maxDist = parseFloat(selectedShop.delivery_radius_km || 2.0);
      setIsWithinRadius(dist <= maxDist);
      if (!isWithinRadius) {
        setAddressError(`📍 Delivery distance is ${dist.toFixed(2)} km. Maximum allowed is ${maxDist} km.`);
      } else {
        setAddressError("");
      }
    } else {
      setDeliveryDistance(null);
      setIsWithinRadius(true);
      if (deliveryOption !== "delivery") {
        setAddressError("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryOption, selectedShop, deliveryLat, deliveryLng]);

  // ============================================
  // Helper functions
  // ============================================
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestShop = (userLat, userLng, shopsList) => {
    if (!shopsList || shopsList.length === 0) return null;
    const shopsWithCoords = shopsList.filter(
      (s) => s.latitude != null && s.longitude != null
    );
    if (shopsWithCoords.length === 0) return shopsList[0];
    let nearest = shopsWithCoords[0];
    let minDist = calculateDistance(
      userLat,
      userLng,
      nearest.latitude,
      nearest.longitude
    );
    for (let i = 1; i < shopsWithCoords.length; i++) {
      const dist = calculateDistance(
        userLat,
        userLng,
        shopsWithCoords[i].latitude,
        shopsWithCoords[i].longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = shopsWithCoords[i];
      }
    }
    return nearest;
  };

  const autoSelectShop = (shopsData) => {
    if (!shopsData || shopsData.length === 0) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const nearest = findNearestShop(userLat, userLng, shopsData);
          if (nearest) {
            setShopId(String(nearest.id));
            setSelectedShop(nearest);
          }
        },
        () => {
          const first = shopsData[0];
          setShopId(String(first.id));
          setSelectedShop(first);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      const first = shopsData[0];
      setShopId(String(first.id));
      setSelectedShop(first);
    }
  };

  const loadData = async () => {
    try {
      const cartData = await getCart();
      if (
        !cartData ||
        !cartData.items ||
        cartData.items.length === 0 ||
        cartData.total_amount === 0
      ) {
        setRedirectToCart(true);
        return;
      }
      setCart(cartData);

      const res = await api.get("/shops/public/");
      const shopsData = res.data || [];
      setShops(shopsData);
      autoSelectShop(shopsData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unable to load checkout", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async (shopId) => {
    setFetchingPromotions(true);
    try {
      const data = await fetchAvailablePromotions(shopId);
      setPromotions(data);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      setPromotions([]);
    } finally {
      setFetchingPromotions(false);
    }
  };

  const applySelectedPromotion = async () => {
    if (!selectedPromotion) return;
    setIsApplying(true);
    setDiscountError("");
    setPromotionMessage("");
    try {
      const response = await applyPromotionPreview(
        shopId,
        selectedPromotion.type,
        selectedPromotion.type === "discount" ? selectedPromotion.id : undefined,
        selectedPromotion.type === "coupon" ? selectedPromotion.code : undefined
      );
      setAppliedDiscount({
        type: response.discount_type,
        name: response.discount_name,
        amount: response.discount_amount,
        finalTotal: response.final_total,
        originalTotal: response.original_total,
        items: response.items || [],
      });
      if (response.message) {
        setPromotionMessage(response.message);
      }
    } catch (error) {
      console.error(error);
      setDiscountError(error.response?.data?.detail || "Promotion not applicable.");
      setAppliedDiscount({
        type: null,
        name: "",
        amount: 0,
        finalTotal: 0,
        originalTotal: 0,
        items: [],
      });
      setSelectedPromotion(null);
    } finally {
      setIsApplying(false);
    }
  };

  // Manual coupon application
  const handleApplyManualCoupon = async () => {
    if (!manualCouponCode.trim()) {
      setDiscountError("Please enter a coupon code.");
      return;
    }
    const coupon = promotions.find(p => p.type === "coupon" && p.code === manualCouponCode.toUpperCase());
    if (coupon) {
      handleSelectPromotion(coupon);
    } else {
      setIsApplying(true);
      setDiscountError("");
      try {
        const response = await applyPromotionPreview(
          shopId,
          "coupon",
          undefined,
          manualCouponCode.toUpperCase()
        );
        setAppliedDiscount({
          type: response.discount_type,
          name: response.discount_name,
          amount: response.discount_amount,
          finalTotal: response.final_total,
          originalTotal: response.original_total,
          items: response.items || [],
        });
        if (response.message) {
          setPromotionMessage(response.message);
        }
        setSelectedPromotion({
          type: "coupon",
          code: manualCouponCode.toUpperCase(),
          name: response.discount_name || manualCouponCode.toUpperCase(),
        });
      } catch (error) {
        setDiscountError(error.response?.data?.detail || "Invalid coupon.");
      } finally {
        setIsApplying(false);
      }
    }
    setManualCouponCode("");
  };

  const handleSelectPromotion = (promo) => {
    if (selectedPromotion?.id === promo.id && selectedPromotion?.type === promo.type) {
      setSelectedPromotion(null);
      setAppliedDiscount({
        type: null,
        name: "",
        amount: 0,
        finalTotal: 0,
        originalTotal: 0,
        items: [],
      });
      setPromotionMessage("");
    } else {
      setSelectedPromotion(promo);
    }
  };

  // ============================================
  // Get current location for delivery
  // ============================================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddressError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLat(position.coords.latitude);
        setDeliveryLng(position.coords.longitude);
        // We'll also try reverse geocode to get address
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
            (results, status) => {
              if (status === "OK" && results[0]) {
                setDeliveryAddress(results[0].formatted_address);
              }
            }
          );
        }
      },
      (error) => {
        setAddressError("Unable to get your location. Please enter address manually.");
        console.error(error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ============================================
  // Load saved addresses
  // ============================================
  useEffect(() => {
    if (deliveryOption === "delivery") {
      loadSavedAddresses();
    }
  }, [deliveryOption]);

  const loadSavedAddresses = async () => {
    try {
      const data = await getAddresses();
      setSavedAddresses(data);
      const defaultAddr = data.find(addr => addr.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setDeliveryAddress(defaultAddr.address);
        setDeliveryLat(defaultAddr.latitude);
        setDeliveryLng(defaultAddr.longitude);
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = savedAddresses.find(a => a.id === addressId);
    if (addr) {
      setDeliveryAddress(addr.address);
      setDeliveryLat(addr.latitude);
      setDeliveryLng(addr.longitude);
      setAddressError("");
      setSaveNewAddress(false);
    }
  };

  // ============================================
  // Map Modal – Location Picker
  // ============================================
  const openMapModal = () => {
    setShowMapModal(true);
    // Center to current location if available, else default
    if (deliveryLat && deliveryLng) {
      setMapCenter({ lat: deliveryLat, lng: deliveryLng });
      setMapMarker({ lat: deliveryLat, lng: deliveryLng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setMapMarker({ lat: latitude, lng: longitude });
        },
        () => {
          setMapCenter(DEFAULT_CENTER);
          setMapMarker(null);
        }
      );
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMapMarker(null);
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setMapMarker(null);
  };

  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapMarker({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const onMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapMarker({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const formatted = results[0].formatted_address;
        setDeliveryAddress(formatted);
        setDeliveryLat(lat);
        setDeliveryLng(lng);
        setAddressError("");
      }
    });
  };

  const onPlaceSelected = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMapMarker({ lat, lng });
        setDeliveryAddress(place.formatted_address || "");
        setDeliveryLat(lat);
        setDeliveryLng(lng);
        setAddressError("");
      }
    }
  };

  const confirmLocation = () => {
    if (deliveryLat === null || deliveryLng === null) {
      Swal.fire("Error", "Please select a location on the map.", "warning");
      return;
    }
    // Check distance again before confirming
    if (selectedShop) {
      const dist = calculateDistance(
        parseFloat(selectedShop.latitude),
        parseFloat(selectedShop.longitude),
        deliveryLat,
        deliveryLng
      );
      const maxDist = parseFloat(selectedShop.delivery_radius_km || 2.0);
      if (dist > maxDist) {
        Swal.fire(
          "Location Too Far",
          `Your location is ${dist.toFixed(2)} km away. Maximum allowed is ${maxDist} km.`,
          "warning"
        );
        return;
      }
    }
    // Optionally auto‑save if user wants
    if (saveNewAddress && deliveryAddress.trim()) {
      createAddress({
        label: addressLabel || "Home",
        address: deliveryAddress,
        latitude: deliveryLat,
        longitude: deliveryLng,
        is_default: false,
      }).then(() => {
        loadSavedAddresses(); // refresh list
      }).catch(err => console.error("Failed to save address", err));
    }
    closeMapModal();
    Swal.fire("Location Set", "Delivery address updated.", "success");
  };

  // ============================================
// Place Order
// ============================================
const handlePlaceOrder = async () => {
  if (!shopId) {
    Swal.fire("Select Shop", "Please select a shop", "warning");
    return;
  }

  if (deliveryOption === "pickup") {
    if (pickupByOtherPerson && !pickupPersonName.trim()) {
      Swal.fire("Pickup Person", "Enter pickup person name", "warning");
      return;
    }
    if (pickupByOtherPerson && !pickupPersonPhone.trim()) {
      Swal.fire("Pickup Person", "Enter pickup person phone number", "warning");
      return;
    }
    if (pickupType === "scheduled" && (!pickupDate || !pickupTime)) {
      Swal.fire(
        "Schedule Required",
        "Please select both pickup date and time",
        "warning"
      );
      return;
    }
  } else {
    if (!deliveryAddress.trim()) {
      Swal.fire("Delivery Address", "Please enter your delivery address", "warning");
      return;
    }
    if (deliveryLat === null || deliveryLng === null) {
      Swal.fire("Location", "Please allow location access or provide coordinates", "warning");
      return;
    }
    if (!isWithinRadius) {
      Swal.fire(
        "Delivery Not Available",
        `Your location is ${deliveryDistance?.toFixed(2)} km away. Maximum allowed is ${selectedShop?.delivery_radius_km || 2} km.`,
        "error"
      );
      return;
    }
  }

  setPlacingOrder(true);
  try {
    const payload = {
      shop_id: shopId,
      payment_method: paymentMethod,
      notes: notes,
      delivery_option: deliveryOption,
      pickup_type: deliveryOption === "pickup" ? pickupType : "instant",
      pickup_time: deliveryOption === "pickup" && pickupType === "scheduled"
        ? `${pickupDate}T${pickupTime}:00`
        : null,
      pickup_by_other_person: deliveryOption === "pickup" ? pickupByOtherPerson : false,
      pickup_person_name: deliveryOption === "pickup" ? pickupPersonName : "",
      pickup_person_phone: deliveryOption === "pickup" ? pickupPersonPhone : "",
      delivery_address: deliveryOption === "delivery" ? deliveryAddress : "",
      delivery_latitude: deliveryOption === "delivery" ? deliveryLat : null,
      delivery_longitude: deliveryOption === "delivery" ? deliveryLng : null,
      save_address: deliveryOption === "delivery" ? saveNewAddress : false,
      address_label: deliveryOption === "delivery" ? addressLabel : "",
      address_id: deliveryOption === "delivery" && selectedAddressId ? selectedAddressId : null,
    };

    if (selectedPromotion) {
      payload.promotion_type = selectedPromotion.type;
      if (selectedPromotion.type === "discount") {
        payload.promotion_id = selectedPromotion.id;
      } else if (selectedPromotion.type === "coupon") {
        payload.coupon_code = selectedPromotion.code;
      }
    }

    const response = await placeOrder(payload);

    await Swal.fire({
      title: "🎉 Order Placed Successfully",
      html: `
        <div style="padding:10px">
          <h4>Order No</h4>
          <h2 style="color:#f7c600">
            ${response.order_number}
          </h2>
          <p>Estimated Ready In</p>
          <h3>${response.estimated_minutes} Minutes</h3>
          ${response.delivery_option === 'delivery' ? `<p>Delivery Address: ${response.delivery_address}</p>` : ''}
        </div>
      `,
      icon: "success",
      confirmButtonText: "Track Order",
      confirmButtonColor: "#f7c600",
    });

    // ✅ CRITICAL FIX: Dispatch event to update header cart count and clear cart page
    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/my-orders");
  } catch (error) {
    Swal.fire(
      "Error",
      error?.response?.data?.error || "Failed to place order",
      "error"
    );
  } finally {
    setPlacingOrder(false);
  }
};

  // ----- Redirect if cart empty -----
  if (redirectToCart) {
    return <Navigate to="/cart" replace />;
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container py-5 text-center">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text mt-3">Preparing your checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const originalTotal = appliedDiscount.originalTotal || cart?.total_amount || 0;
  const discountAmount = appliedDiscount.amount || 0;
  const finalTotal = appliedDiscount.finalTotal || originalTotal - discountAmount;
  const itemsBreakdown = appliedDiscount.items || [];

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            <div className="checkout-card">
              <div className="checkout-header">
                <h2>Checkout</h2>
                <p>Complete your order and delivery/pickup details</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {/* Estimated Time */}
                <div className="estimate-box">
                  <h6>Estimated Preparation Time</h6>
                  <h2>20 Minutes</h2>
                  <p>Freshly prepared after order confirmation</p>
                </div>

                {/* Shop Selection */}
                <h5 className="section-title">Select Shop</h5>
                <select
                  className="form-select checkout-input"
                  value={shopId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShopId(val);
                    const shop = shops.find((s) => s.id === Number(val));
                    setSelectedShop(shop);
                  }}
                >
                  <option value="">Select Shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>

                {selectedShop && (
                  <div className="customer-card mt-4">
                    <h5>Shop Details</h5>
                    <div className="customer-info">
                      <div>
                        <strong>Shop Name</strong>
                        <span>{selectedShop.name}</span>
                      </div>
                      <div>
                        <strong>Phone</strong>
                        <span>{selectedShop.phone}</span>
                      </div>
                      <div>
                        <strong>Address</strong>
                        <span>{selectedShop.address}</span>
                      </div>
                      <div>
                        <strong>Max Delivery Distance</strong>
                        <span>{selectedShop.delivery_radius_km || 2} km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Option Toggle */}
                <h5 className="section-title mt-4">Delivery Option</h5>
                <div className="delivery-options">
                  <div
                    className={`delivery-option ${deliveryOption === "pickup" ? "active" : ""}`}
                    onClick={() => setDeliveryOption("pickup")}
                  >
                    <input type="radio" checked={deliveryOption === "pickup"} readOnly />
                    <div>
                      <h6>Pay at Shop</h6>
                      <small>Pick up your order from the shop</small>
                    </div>
                  </div>
                  <div
                    className={`delivery-option ${deliveryOption === "delivery" ? "active" : ""}`}
                    onClick={() => setDeliveryOption("delivery")}
                  >
                    <input type="radio" checked={deliveryOption === "delivery"} readOnly />
                    <div>
                      <h6>Home Delivery</h6>
                      <small>We'll deliver to your address (within {selectedShop?.delivery_radius_km || 2} km)</small>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Section */}
                {deliveryOption === "delivery" && (
                  <div className="delivery-address-section mt-4">
                    <h5>Delivery Address</h5>

                    {savedAddresses.length > 0 && (
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="addressOption"
                            id="savedAddressOption"
                            checked={!showSavedAddresses}
                            onChange={() => {
                              setShowSavedAddresses(false);
                              setSelectedAddressId("");
                            }}
                          />
                          <label className="form-check-label" htmlFor="savedAddressOption">
                            Use a new address
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="addressOption"
                            id="newAddressOption"
                            checked={showSavedAddresses}
                            onChange={() => {
                              setShowSavedAddresses(true);
                              const defaultAddr = savedAddresses.find(a => a.is_default);
                              if (defaultAddr) {
                                handleAddressSelect(defaultAddr.id);
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor="newAddressOption">
                            Select a saved address
                          </label>
                        </div>
                      </div>
                    )}

                    {showSavedAddresses && savedAddresses.length > 0 ? (
                      <div className="saved-addresses-list">
                        <select
                          className="form-select checkout-input"
                          value={selectedAddressId}
                          onChange={(e) => handleAddressSelect(Number(e.target.value))}
                        >
                          <option value="">Select a saved address</option>
                          {savedAddresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label} - {addr.address.substring(0, 40)}
                              {addr.is_default ? " (Default)" : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-outline-secondary mt-2"
                          onClick={() => {
                            setShowSavedAddresses(false);
                            setSelectedAddressId("");
                            setDeliveryAddress("");
                            setDeliveryLat(null);
                            setDeliveryLng(null);
                          }}
                        >
                          Enter new address instead
                        </button>
                      </div>
                    ) : (
                      <>
                        <textarea
                          rows="2"
                          className="form-control checkout-textarea"
                          placeholder="Enter your full delivery address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                        <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                          <button
                            className="btn btn-outline-primary"
                            onClick={getCurrentLocation}
                            type="button"
                          >
                            Use my current location
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={openMapModal}
                            type="button"
                          >
                            📍 Pick on Map
                          </button>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="saveAddressCheck"
                              checked={saveNewAddress}
                              onChange={(e) => setSaveNewAddress(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="saveAddressCheck">
                              Save this address for future
                            </label>
                          </div>
                          {saveNewAddress && (
                            <input
                              type="text"
                              className="form-control w-auto"
                              placeholder="Label (e.g. Home)"
                              value={addressLabel}
                              onChange={(e) => setAddressLabel(e.target.value)}
                              style={{ maxWidth: "180px" }}
                            />
                          )}
                        </div>
                      </>
                    )}

                    {/* Distance and Radius Info */}
                    {deliveryDistance !== null && selectedShop && (
                      <div className="mt-2">
                        <span>
                          📏 Distance from shop: <strong>{deliveryDistance.toFixed(2)} km</strong>
                        </span>
                        {!isWithinRadius && (
                          <div className="text-danger mt-1">
                            ⚠️ Delivery not available – exceeds {selectedShop.delivery_radius_km || 2} km limit.
                          </div>
                        )}
                        {isWithinRadius && deliveryDistance > 0 && (
                          <div className="text-success mt-1">
                            ✅ Within delivery range.
                          </div>
                        )}
                      </div>
                    )}

                    {addressError && <div className="text-danger mt-2">{addressError}</div>}
                    {deliveryLat && deliveryLng && !showSavedAddresses && !addressError && (
                      <div className="text-success mt-2">
                        <i className="fas fa-check-circle"></i> Location captured.
                      </div>
                    )}
                  </div>
                )}

                {/* Pickup Information (only if pickup) */}
                {deliveryOption === "pickup" && (
                  <div className="pickup-card mt-4">
                    <h5>Pickup Information</h5>

                    <div className="pickup-time-card mt-4">
                      <h5 className="mb-3">Pickup Time</h5>

                      <div
                        className={`pickup-option ${pickupType === "instant" ? "active" : ""}`}
                        onClick={() => setPickupType("instant")}
                      >
                        <input
                          type="radio"
                          checked={pickupType === "instant"}
                          readOnly
                        />
                        <div>
                          <h6 className="mb-1">Prepare Immediately</h6>
                          <small className="text-muted">
                            Your order will be prepared as soon as the shop accepts it.
                          </small>
                        </div>
                      </div>

                      <div
                        className={`pickup-option mt-3 ${pickupType === "scheduled" ? "active" : ""}`}
                        onClick={() => setPickupType("scheduled")}
                      >
                        <input
                          type="radio"
                          checked={pickupType === "scheduled"}
                          readOnly
                        />
                        <div className="w-100">
                          <h6 className="mb-1">Schedule Pickup</h6>
                          <small className="text-muted">
                            Choose a pickup date and time.
                          </small>

                          {pickupType === "scheduled" && (
                            <div className="row mt-3">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Pickup Date</label>
                                <input
                                  type="date"
                                  className="form-control checkout-input"
                                  value={pickupDate}
                                  min={new Date().toISOString().split("T")[0]}
                                  onChange={(e) => setPickupDate(e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Pickup Time</label>
                                <input
                                  type="time"
                                  className="form-control checkout-input"
                                  value={pickupTime}
                                  onChange={(e) => setPickupTime(e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        id="otherPickup"
                        className="form-check-input"
                        checked={pickupByOtherPerson}
                        onChange={(e) => setPickupByOtherPerson(e.target.checked)}
                      />
                      <label htmlFor="otherPickup" className="form-check-label fw-bold">
                        Some other person will collect
                      </label>
                    </div>

                    {pickupByOtherPerson && (
                      <div className="mt-4">
                        <input
                          type="text"
                          className="form-control checkout-input mb-3"
                          placeholder="Pickup Person Name"
                          value={pickupPersonName}
                          onChange={(e) => setPickupPersonName(e.target.value)}
                        />
                        <input
                          type="tel"
                          className="form-control checkout-input"
                          placeholder="Pickup Person Phone Number"
                          value={pickupPersonPhone}
                          onChange={(e) => setPickupPersonPhone(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Method */}
                <h5 className="section-title">Payment Method</h5>
                <div className="payment-grid">
                  <div
                    className={`payment-card ${paymentMethod === "cash" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <h6>Cash On Pickup</h6>
                    <small>Pay when collecting</small>
                  </div>
                  <div
                    className={`payment-card ${paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <h6>UPI At Shop</h6>
                    <small>Scan & pay at counter</small>
                  </div>
                </div>

                {/* Notes */}
                <h5 className="section-title">Notes</h5>
                <textarea
                  rows="3"
                  className="form-control checkout-textarea"
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                {/* ----- PROMOTIONS SECTION ----- */}
                <h5 className="section-title mt-4">Available Promotions</h5>
                {fetchingPromotions ? (
                  <div className="text-muted">Loading promotions...</div>
                ) : promotions.length === 0 ? (
                  <div className="text-muted">No active promotions available.</div>
                ) : (
                  <>
                    <div className="promotion-grid">
                      {promotions.map((promo) => {
                        const isSelected =
                          selectedPromotion?.id === promo.id &&
                          selectedPromotion?.type === promo.type;
                        const isCoupon = promo.type === "coupon";
                        return (
                          <div
                            key={`${promo.type}-${promo.id}`}
                            className={`promotion-card ${isSelected ? "active" : ""}`}
                            onClick={() => handleSelectPromotion(promo)}
                          >
                            <div className="promotion-header">
                              <span className="promotion-badge">
                                {isCoupon ? "Coupon" : "Discount"}
                              </span>
                              <span className="promotion-value">
                                {promo.value}
                                {promo.discount_type === "percentage" ? "%" : " ₹"}
                              </span>
                            </div>
                            <h6>{promo.name}</h6>
                            {isCoupon && promo.code && (
                              <div className="coupon-code">📋 Code: {promo.code}</div>
                            )}
                            <small>{promo.description}</small>
                            {promo.apply_on && (
                              <div className="text-muted small">
                                Applies to: {promo.apply_on}
                              </div>
                            )}
                            {promo.minimum_order > 0 && (
                              <div className="text-muted small">
                                Min order: ₹{promo.minimum_order}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowManualCoupon(!showManualCoupon)}
                      >
                        {showManualCoupon ? "Hide" : "Enter coupon code manually"}
                      </button>
                      {showManualCoupon && (
                        <div className="coupon-input-group mt-2">
                          <input
                            type="text"
                            className="form-control checkout-input"
                            placeholder="Enter coupon code"
                            value={manualCouponCode}
                            onChange={(e) => setManualCouponCode(e.target.value.toUpperCase())}
                          />
                          <button
                            className="btn btn-primary ms-2"
                            onClick={handleApplyManualCoupon}
                            disabled={isApplying || !manualCouponCode.trim()}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {discountError && (
                  <div className="text-danger mt-2">{discountError}</div>
                )}
                {!isApplying && promotionMessage && (
                  <div className="text-warning mt-2">
                    <i className="fas fa-info-circle"></i> {promotionMessage}
                  </div>
                )}
                {appliedDiscount.amount > 0 && (
                  <div className="alert alert-success mt-2">
                    <strong>{appliedDiscount.name}</strong> applied! You saved ₹{appliedDiscount.amount}
                  </div>
                )}

                {/* ----- CART ITEMS with per‑item discount breakdown ----- */}
                <h5 className="section-title mt-4">Cart Items</h5>
                {cart?.items?.map((item, index) => {
                  const breakdown = itemsBreakdown.find(
                    (b) => b.item_name === item.item_name
                  );
                  const originalPrice = breakdown?.original_price || item.total_price;
                  const itemDiscount = breakdown?.discount_amount || 0;
                  const finalPrice = breakdown?.final_price || item.total_price;

                  return (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item-details">
                        <div className="checkout-item-name">{item.item_name}</div>
                        <div className="checkout-item-qty">Qty : {item.quantity}</div>
                      </div>
                      <div className="checkout-item-prices">
                        {itemDiscount > 0 ? (
                          <>
                            <span className="original-price">₹{originalPrice}</span>
                            <span className="discount-amount">-₹{itemDiscount}</span>
                            <span className="final-price">₹{finalPrice}</span>
                          </>
                        ) : (
                          <span className="final-price">₹{originalPrice}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* ----- Total Breakdown ----- */}
                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>₹{originalTotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="checkout-summary-row text-success">
                      <span>Discount ({appliedDiscount.name})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="checkout-summary-row">
                    <span>Taxes</span>
                    <span>₹0</span>
                  </div>
                  <div className="checkout-total">
                    <h4>Total Amount</h4>
                    <h3>₹{finalTotal}</h3>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  className="checkout-btn"
                  onClick={handlePlaceOrder}
                  disabled={
                    placingOrder ||
                    (deliveryOption === "delivery" && (!isWithinRadius || !deliveryLat || !deliveryLng))
                  }
                >
                  {placingOrder
                    ? "Placing Order..."
                    : deliveryOption === "delivery" && !isWithinRadius
                    ? "Location Not Servicable"
                    : "Place Order"}
                </button>
                {deliveryOption === "delivery" && !isWithinRadius && deliveryDistance !== null && (
                  <div className="text-danger text-center mt-2">
                    ⚠️ Delivery not available for this address. Please choose a location within {selectedShop?.delivery_radius_km || 2} km.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAP MODAL
          ============================================================ */}
      {showMapModal && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <h5>📍 Pick Delivery Location</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeMapModal}
              ></button>
            </div>
            <div className="map-modal-body">
              {isLoaded ? (
                <>
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={onPlaceSelected}
                    className="w-100 mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Search for a place..."
                      className="form-control"
                    />
                  </Autocomplete>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    options={mapOptions}
                    onClick={onMapClick}
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    {mapMarker && (
                      <Marker
                        position={mapMarker}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                      />
                    )}
                  </GoogleMap>
                  <div className="mt-2 text-muted small">
                    Drag the marker or click on the map to set location.
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <label className="form-label">Latitude</label>
                      <input
                        type="text"
                        className="form-control"
                        value={deliveryLat || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Longitude</label>
                      <input
                        type="text"
                        className="form-control"
                        value={deliveryLng || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  {selectedShop && deliveryLat && deliveryLng && (
                    <div className="mt-2">
                      <span>
                        📏 Distance: <strong>
                          {calculateDistance(
                            parseFloat(selectedShop.latitude),
                            parseFloat(selectedShop.longitude),
                            deliveryLat,
                            deliveryLng
                          ).toFixed(2)} km
                        </strong>
                      </span>
                      {calculateDistance(
                        parseFloat(selectedShop.latitude),
                        parseFloat(selectedShop.longitude),
                        deliveryLat,
                        deliveryLng
                      ) > parseFloat(selectedShop.delivery_radius_km || 2.0) && (
                        <div className="text-danger mt-1">
                          ⚠️ Exceeds maximum distance ({selectedShop.delivery_radius_km || 2} km)
                        </div>
                      )}
                    </div>
                  )}
                  <div className="form-check mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="saveMapAddress"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="saveMapAddress">
                      Save this address for future orders
                    </label>
                  </div>
                  {saveNewAddress && (
                    <div className="mt-2">
                      <label className="form-label">Label (e.g. Home, Work)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Label"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="map-loading">Loading map...</div>
              )}
            </div>
            <div className="map-modal-footer">
              <button className="btn btn-secondary" onClick={closeMapModal}>
                Cancel
              </button>
              <button className="btn btn-warning" onClick={confirmLocation}>
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}