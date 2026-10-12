import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaBars,
  FaReceipt,
  FaClock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaUserPlus,
  FaSpinner,
  FaUser,
  FaThLarge,
} from "react-icons/fa";

import {
  getWalkInCarts,
  getWalkInCart,
  createWalkInCart,
  updateWalkInCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
  clearWalkInCartItems,
  placeWalkInCart,
  searchCustomer,
  getActiveDiscounts,
} from "../../service/walkInService";

import {
  getCategoriesByShop,
  getPublicMenuItems,
} from "../../service/menuItemService";
import api from "../../service/api";
import ReceiptPrinter from "./components/ReceiptPrinter";

import "./CSS/WalkInOrder.css";

const BaseURL = import.meta.env.VITE_WS_URL;

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});

export default function WalkInOrder() {
  const navigate = useNavigate();

  // Role check
  const userRole = localStorage.getItem("role");
  useEffect(() => {
    if (userRole === "preparing_staff") {
      navigate("/manager/orders", { replace: true });
    }
  }, [userRole, navigate]);

  // ---- Core States ----
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);

  // ---- Menu & Categories ----
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ---- Order Settings & Toggles ----
  const [orderType, setOrderType] = useState("walkin"); // 'walkin' | 'call'
  const [prepTiming, setPrepTiming] = useState("now"); // 'now' | 'later'
  const [prepTime, setPrepTime] = useState("NOW");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' | 'upi' | 'credit' | 'parts'
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  // ---- Discounts ----
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);

  // ---- Modals & Drawer ----
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ---- Customer Form Inside Modal ----
  const [custFormName, setCustFormName] = useState("");
  const [custFormPhone, setCustFormPhone] = useState("");
  const [custLookupFound, setCustLookupFound] = useState(false);
  const [custLookupOrders, setCustLookupOrders] = useState(0);
  const [custLookupTrust, setCustLookupTrust] = useState(null);
  const [isSearchingCust, setIsSearchingCust] = useState(false);

  // ---- Receipt Modal ----
  const [receiptOrderId, setReceiptOrderId] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ---- Socket & Timers ----
  const socketRef = useRef(null);
  const reconnectRef = useRef(true);
  const reconnectTimerRef = useRef(null);

  // ---- Responsive Screen & View Mode ----
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cart popup modal state (replaces sidebar layout with dedicated popup)
  const [isCartPopupOpen, setIsCartPopupOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isCartPopupOpen) setIsCartPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartPopupOpen]);

  const shopId = localStorage.getItem("selected_shop");

  // ==========================================
  // 1. LOAD DRAFT CARTS
  // ==========================================
  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      let list = (await getWalkInCarts()) || [];
      if (list.length === 0) {
        const newCart = await createWalkInCart({
          customer_name: "Walk-In Customer",
          customer_phone: "",
          payment_method: "cash",
          order_taking_method: "walkin",
          prep_timing: "now",
          prep_time: "NOW",
          notes: "",
        });
        list = [newCart];
      }
      setCarts(list);
      if (!selectedCartId || !list.some((c) => c.id === selectedCartId)) {
        setSelectedCartId(list[0].id);
      }
    } catch (error) {
      console.error("Failed to load walkin carts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCartId]);

  // ==========================================
  // 2. LOAD ACTIVE CART DETAILS (WITH 404 FALLBACK)
  // ==========================================
  const loadSelectedCart = useCallback(async (id) => {
    if (!id) return;
    try {
      const cart = await getWalkInCart(id);
      setSelectedCart(cart);
      if (cart.notes !== undefined) setOrderNotes(cart.notes || "");
      if (cart.payment_method) setPaymentMethod(cart.payment_method);
      if (cart.order_taking_method) setOrderType(cart.order_taking_method);
      if (cart.prep_timing) setPrepTiming(cart.prep_timing);
      if (cart.prep_time) setPrepTime(cart.prep_time);
      const phoneClean = (cart.customer_phone || "").replace("+91", "").replace(/^91/, "");
      setCustFormName(cart.customer_name || "Walk-In Customer");
      setCustFormPhone(phoneClean);
      if (phoneClean.length === 10) {
        searchCustomer(phoneClean)
          .then((data) => {
            if (data?.found) {
              setCustLookupFound(true);
              setCustLookupOrders(data.total_orders ?? 0);
              setCustLookupTrust(data.trust_score ?? 100);
            } else {
              setCustLookupFound(false);
            }
          })
          .catch(() => setCustLookupFound(false));
      } else {
        setCustLookupFound(false);
      }
    } catch (error) {
      console.warn("Cart not found or inaccessible:", id, error);
      // Auto-fallback to active draft carts list
      try {
        const freshList = (await getWalkInCarts()) || [];
        setCarts(freshList);
        if (freshList.length > 0) {
          const fallback = freshList.find((c) => c.id !== id) || freshList[0];
          setSelectedCartId(fallback.id);
        } else {
          const fresh = await createWalkInCart({
            customer_name: "Walk-In Customer",
            customer_phone: "",
            payment_method: "cash",
            order_taking_method: "walkin",
            prep_timing: "now",
            prep_time: "NOW",
            notes: "",
          });
          setCarts([fresh]);
          setSelectedCartId(fresh.id);
        }
      } catch (err) {
        console.error("Cart fallback error:", err);
      }
    }
  }, []);

  // ==========================================
  // 3. LOAD MENU ITEMS & CATEGORIES
  // ==========================================
  const loadMenuData = useCallback(async () => {
    try {
      if (shopId) {
        const cats = await getCategoriesByShop(shopId);
        setCategories(cats || []);
      }

      try {
        const res = await api.get("/menu/items/");
        if (Array.isArray(res.data)) {
          setMenuItems(res.data);
          return;
        }
      } catch (e) {}

      const publicItems = await getPublicMenuItems({ shop: shopId });
      if (Array.isArray(publicItems)) {
        setMenuItems(publicItems);
      } else if (publicItems?.results) {
        setMenuItems(publicItems.results);
      }
    } catch (err) {
      console.error("Failed to load menu data:", err);
    }
  }, [shopId]);

  // ==========================================
  // 4. LOAD ACTIVE DISCOUNTS
  // ==========================================
  const loadDiscounts = useCallback(async () => {
    try {
      if (shopId) {
        const d = await getActiveDiscounts(shopId);
        setDiscounts(Array.isArray(d) ? d : []);
      }
    } catch (e) {
      setDiscounts([]);
    }
  }, [shopId]);

  useEffect(() => {
    loadCarts();
    loadMenuData();
    loadDiscounts();
  }, [loadCarts, loadMenuData, loadDiscounts]);

  useEffect(() => {
    if (selectedCartId) {
      loadSelectedCart(selectedCartId);
    }
  }, [selectedCartId, loadSelectedCart]);

  // Keep a ref of selectedCartId for socket handler to avoid reconnecting on cart switch
  const selectedCartIdRef = useRef(selectedCartId);
  useEffect(() => {
    selectedCartIdRef.current = selectedCartId;
  }, [selectedCartId]);

  // ==========================================
  // 5. WEBSOCKET SYNC
  // ==========================================
  const connectSocket = useCallback(() => {
    if (!BaseURL) return;
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${BaseURL}/ws/manager/orders/`);
      socketRef.current = ws;

      ws.onclose = () => {
        if (!reconnectRef.current) return;
        reconnectTimerRef.current = setTimeout(() => {
          if (reconnectRef.current) connectSocket();
        }, 5000);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_order" || data.type === "order_update") {
            loadCarts();
            if (selectedCartIdRef.current) loadSelectedCart(selectedCartIdRef.current);
          }
        } catch {}
      };
    } catch (error) {
      console.error(error);
    }
  }, [loadCarts, loadSelectedCart]);

  useEffect(() => {
    reconnectRef.current = true;
    connectSocket();
    const interval = setInterval(loadCarts, 20000);
    return () => {
      reconnectRef.current = false;
      clearInterval(interval);
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, [connectSocket, loadCarts]);

  // ==========================================
  // 6. ADD ITEM TO CART (FAST & ATOMIC)
  // ==========================================
  const handleAddItem = async (item, variant = null) => {
    if (!selectedCart) {
      Toast.fire({ icon: "warning", title: "Select or create customer draft" });
      return;
    }

    if (navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }

    const variantId = variant ? variant.id : null;
    const label = variant ? `${item.name} (${variant.name})` : item.name;

    try {
      const updatedCart = await addItemToCart(
        selectedCart.id,
        item.id,
        1,
        variantId
      );
      setSelectedCart(updatedCart);
      setCarts((prev) =>
        prev.map((c) =>
          c.id === updatedCart.id
            ? { ...c, total_items: updatedCart.items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0 }
            : c
        )
      );

      Toast.fire({
        icon: "success",
        title: `+1 ${label}`,
        timer: 600,
      });
    } catch (err) {
      console.error("Failed to add item:", err);
      Toast.fire({ icon: "error", title: "Could not add item" });
    }
  };

  // ==========================================
  // 7. CLEAR ALL ITEMS
  // ==========================================
  const handleClearAllItems = async () => {
    if (!selectedCart || !selectedCart.items || selectedCart.items.length === 0)
      return;

    const result = await Swal.fire({
      title: "Clear all items?",
      text: "Remove all items from this order cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#78716c",
      confirmButtonText: "Yes, clear all",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const updated = await clearWalkInCartItems(selectedCart.id);
        setSelectedCart(updated);
        Toast.fire({ icon: "success", title: "Cart items cleared" });
      } catch (err) {
        console.error("Failed to clear cart:", err);
        Toast.fire({ icon: "error", title: "Could not clear items" });
      }
    }
  };

  // ==========================================
  // 8. UPDATE ITEM QUANTITY (OR REMOVE)
  // ==========================================
  const handleUpdateItemQty = async (itemId, newQty) => {
    if (newQty < 0) return;
    try {
      // Optimistic instant feedback
      setSelectedCart((prev) => {
        if (!prev || !prev.items) return prev;
        let nextItems;
        if (newQty === 0) {
          nextItems = prev.items.filter((i) => i.id !== itemId);
        } else {
          nextItems = prev.items.map((i) =>
            i.id === itemId
              ? { ...i, quantity: newQty, total_price: Number(i.item_price) * newQty }
              : i
          );
        }
        const total = nextItems.reduce((s, i) => s + Number(i.total_price || 0), 0);
        return {
          ...prev,
          items: nextItems,
          total_amount: total,
        };
      });

      if (newQty === 0) {
        await deleteCartItem(itemId);
      } else {
        await updateCartItem(itemId, newQty);
      }
      if (selectedCartId) await loadSelectedCart(selectedCartId);
    } catch (e) {
      console.error(e);
      if (selectedCartId) await loadSelectedCart(selectedCartId);
      Toast.fire({ icon: "error", title: "Failed to update item" });
    }
  };

  // ==========================================
  // 9. CREATE NEW DRAFT CUSTOMER
  // ==========================================
  const handleCreateNewCustomer = async () => {
    try {
      const newCart = await createWalkInCart({
        customer_name: "Walk-In Customer",
        customer_phone: "",
        payment_method: "cash",
        order_taking_method: "walkin",
        prep_timing: "now",
        prep_time: "NOW",
        notes: "",
      });
      await loadCarts();
      setSelectedCartId(newCart.id);
      setIsDrawerOpen(false);
      Toast.fire({ icon: "success", title: "New Customer Created" });
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "Unable to create customer" });
    }
  };

  // ==========================================
  // 10. SAVE CUSTOMER DETAILS
  // ==========================================
  const handleSaveCustomer = async () => {
    if (!selectedCart) return;
    try {
      const cleanPhone = custFormPhone.replace(/\D/g, "").slice(0, 10);
      const phoneToSend = cleanPhone ? `+91${cleanPhone}` : "";
      const nameToSend = custFormName.trim() || "Walk-In Customer";

      await updateWalkInCart(selectedCart.id, {
        customer_name: nameToSend,
        customer_phone: phoneToSend,
      });
      await loadSelectedCart(selectedCart.id);
      await loadCarts();
      setIsCustomerModalOpen(false);

      if (cleanPhone) {
        Toast.fire({
          icon: "success",
          title: custLookupFound
            ? `Customer ${nameToSend} linked`
            : `✨ Customer +91${cleanPhone} registered & linked!`,
        });
      } else {
        Toast.fire({ icon: "success", title: "Customer details updated" });
      }
    } catch (e) {
      console.error(e);
      Toast.fire({ icon: "error", title: "Failed to save customer" });
    }
  };

  // Phone lookup
  const handlePhoneLookup = async (phone) => {
    const clean = phone.replace(/\D/g, "").slice(0, 10);
    setCustFormPhone(clean);
    if (clean.length === 10) {
      setIsSearchingCust(true);
      try {
        const data = await searchCustomer(clean);
        if (data && data.found) {
          setCustLookupFound(true);
          setCustFormName(data.name || "Customer");
          setCustLookupOrders(data.total_orders ?? 0);
          setCustLookupTrust(data.trust_score ?? 100);
        } else {
          setCustLookupFound(false);
          setCustLookupOrders(0);
          setCustLookupTrust(100);
        }
      } catch {
        setCustLookupFound(false);
      } finally {
        setIsSearchingCust(false);
      }
    } else {
      setCustLookupFound(false);
      setCustLookupOrders(0);
      setCustLookupTrust(null);
    }
  };

  // ==========================================
  // 11. SAVE PREP TIME & NOTES
  // ==========================================
  const handleSavePrepAndNotes = async () => {
    if (!selectedCart) return;
    try {
      await updateWalkInCart(selectedCart.id, {
        notes: orderNotes,
        prep_timing: prepTiming,
        prep_time: prepTime,
      });
      await loadSelectedCart(selectedCart.id);
      setIsPrepModalOpen(false);
      Toast.fire({ icon: "success", title: "Prep & note updated" });
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle order taking method (Walk-In Counter vs Call)
  const handleToggleOrderTakingMethod = async (method) => {
    setOrderType(method);
    if (!selectedCart) return;
    try {
      await updateWalkInCart(selectedCart.id, { order_taking_method: method });
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle prep timing (Now vs Later)
  const handleTogglePrepTiming = async (timing) => {
    setPrepTiming(timing);
    if (timing === "now") {
      setPrepTime("NOW");
      if (selectedCart) {
        try {
          await updateWalkInCart(selectedCart.id, { prep_timing: "now", prep_time: "NOW" });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setIsPrepModalOpen(true);
    }
  };

  // ==========================================
  // 12. UPDATE PAYMENT METHOD
  // ==========================================
  const handleSelectPaymentMethod = async (method) => {
    setPaymentMethod(method);
    if (method === "pending" || method === "credit") {
      setPaymentStatus("unpaid");
    } else {
      setPaymentStatus("paid");
    }
    if (!selectedCart) return;
    try {
      const backendMethod = method === "pending" ? "credit" : method;
      await updateWalkInCart(selectedCart.id, { payment_method: backendMethod });
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // 13. PLACE ORDER (SAVE or BILL & PRINT)
  // ==========================================
  const handlePlaceOrder = async (isBillAndPrint = false) => {
    if (!selectedCart || !selectedCart.items || selectedCart.items.length === 0) {
      Toast.fire({ icon: "warning", title: "Add items to the order first" });
      return;
    }

    try {
      setPlacingOrder(true);
      const isUnpaid = paymentMethod === "pending" || paymentMethod === "credit";
      const payload = {
        payment_status: isUnpaid ? "unpaid" : "paid",
        payment_method: paymentMethod === "pending" ? "credit" : paymentMethod,
        order_taking_method: orderType,
        prep_timing: prepTiming,
        prep_time: prepTime,
      };
      if (selectedDiscountId) {
        payload.discount_id = selectedDiscountId;
      }

      const res = await placeWalkInCart(selectedCart.id, payload);
      if (!res.success) throw new Error(res.message || "Order placement failed");

      Toast.fire({
        icon: "success",
        title: res.message || "Order Created Successfully",
        timer: 1800,
      });

      const placedOrderId = res.order?.id;
      setIsCartPopupOpen(false);
      await loadCarts();

      if (isBillAndPrint && placedOrderId) {
        setReceiptOrderId(placedOrderId);
        setShowReceipt(true);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: err.response?.data?.error || err.message || "Unable to place order.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // 14. FILTERED MENU ITEMS & DEDICATED VARIANT CARDS
  // ==========================================
  const filteredMenuItems = useMemo(() => {
    let list = menuItems;
    if (selectedCategoryId !== "all") {
      list = list.filter((item) => String(item.category) === String(selectedCategoryId));
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.variants?.some((v) => v.name?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [menuItems, selectedCategoryId, searchQuery]);

  // Check if customer details (phone or custom name) were added
  const hasCustomerDetails = useMemo(() => {
    if (!selectedCart) return false;
    const phone = (selectedCart.customer_phone || "").replace("+91", "").trim();
    const name = (selectedCart.customer_name || "").trim();
    const isDefaultName =
      !name ||
      name.toLowerCase() === "walk-in customer" ||
      name.toLowerCase() === "walk-in";
    return phone.length > 0 || !isDefaultName;
  }, [selectedCart]);

  // Total Items in active cart
  const totalItems = useMemo(() => {
    if (!selectedCart?.items) return 0;
    return selectedCart.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
  }, [selectedCart]);

  // Grand Total calculation
  const grandTotal = useMemo(() => {
    return Number(selectedCart?.total_amount || 0);
  }, [selectedCart]);

  // Format price helper
  const formatPrice = (val) => {
    const num = Number(val || 0);
    return num % 1 === 0 ? num.toFixed(1) : num.toFixed(2);
  };

  // Short 2-word label helper for variant pills (e.g. "Butter", "Large", "Batter")
  const getShortVariantLabel = (rawName) => {
    const name = (rawName || "").trim();
    if (/batter/i.test(name) && /large/i.test(name)) return "Batter";
    if (/butter/i.test(name) && /large/i.test(name)) return "Butter";
    if (/butter/i.test(name)) return "Butter";
    if (/batter/i.test(name)) return "Batter";
    if (/large/i.test(name)) return "Large";
    if (/small/i.test(name)) return "Small";
    if (/half/i.test(name)) return "Half";
    if (/full/i.test(name)) return "Full";
    if (/regular|normal|medium/i.test(name)) return "Normal";
    const words = name.split(/\s+/);
    return words[0] || name;
  };

  // Helper to generate short alphabetical kitchen/cashier codes (e.g. AN, AB, LA, LAB, LK, LG)
  const getVariantShortCode = (item, variant) => {
    const rawItemName = (item?.name || item?.item_name || "").trim();
    const varName = (variant?.name || variant?.variant_name || "").trim();

    // Check if item name itself has "Large" or "Small"
    let itemName = rawItemName;
    let itemHasLarge = /large/i.test(itemName);
    if (/^large\s+/i.test(itemName)) {
      itemName = itemName.replace(/^large\s+/i, "");
    }

    const itemWords = itemName.split(/\s+/).filter(Boolean);
    const itemInitial = (itemWords[0] || "A").charAt(0).toUpperCase();

    const isLarge = itemHasLarge || /large/i.test(varName);
    const isButter = /butter/i.test(varName) || /butter/i.test(rawItemName);
    const isBatter = /batter/i.test(varName) || /batter/i.test(rawItemName);

    if (isLarge && (isButter || isBatter)) {
      return `L${itemInitial}B`;
    }
    if (isLarge) {
      return `L${itemInitial}`;
    }
    if (isButter || isBatter) {
      return `${itemInitial}B`;
    }
    if (!varName || /normal|regular|medium/i.test(varName)) {
      return `${itemInitial}N`;
    }

    const varInitial = varName.charAt(0).toUpperCase();
    return `${itemInitial}${varInitial}`;
  };

  // Item display name helper that extracts base name and variant badge
  const getItemDisplayName = (item) => {
    let raw = item.item_name || "";
    let base = raw;
    let variant = item.variant_name || "";

    const match = raw.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      base = match[1];
      if (!variant) variant = match[2];
    }
    return { base, variant };
  };

  // Menu cards component: 1 card per item, showing Normal variant + sub-pills for other variants
  const renderMenuCards = () => (
    <>
      {filteredMenuItems.map((item) => {
        const activeVariants = (item.variants || []).filter(
          (v) => v.is_active !== false && v.is_available !== false
        );

        // Find primary "Normal" variant (or first variant if no normal)
        const primaryVariant =
          activeVariants.find((v) => /normal|regular|medium/i.test(v.name)) ||
          (activeVariants.length > 0 ? activeVariants[0] : null);

        // The remaining variants to display under the main row
        const otherVariants = activeVariants.filter(
          (v) => v.id !== primaryVariant?.id
        );

        const isOutOfStock = !item.is_available;
        const mainPrice = primaryVariant
          ? Number(primaryVariant.price)
          : Number(item.base_price);
        const primaryCode = getVariantShortCode(item, primaryVariant || null);

        return (
          <div
            key={item.id}
            className={`pos-menu-card ${isOutOfStock ? "unavailable" : ""}`}
            onClick={() =>
              !isOutOfStock && handleAddItem(item, primaryVariant || null)
            }
            title={`Tap to add ${item.name}${primaryVariant ? ` (${primaryVariant.name})` : ""}`}
          >
            <div className="pos-card-title">{item.name}</div>

            <div className="pos-card-body-row">
              <div
                className="pos-card-variant-circle"
                title={`Variant: ${primaryVariant ? primaryVariant.name : "Normal"} (${primaryCode})`}
              >
                <span className="pos-circle-code">{primaryCode}</span>
              </div>

              <div className="pos-card-price-num">
                {Math.round(mainPrice)}
              </div>
            </div>

            {/* Underneath: Other variants as sleek preference pills with shortcode */}
            {otherVariants.length > 0 && (
              <div className="pos-card-subvariants">
                {otherVariants.map((v) => {
                  const code = getVariantShortCode(item, v);
                  const label = getShortVariantLabel(v.name);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      className="pos-subvariant-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddItem(item, v);
                      }}
                      title={`Add ${item.name} (${v.name}) [${code}] - ₹${Math.round(v.price)}`}
                    >
                      <span className="pos-pill-code">{code}</span>
                      <span className="pos-pill-sep">·</span>
                      <span className="pos-pill-label">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="pos-wrapper">
      <div className="pos-layout-outer">
        {/* ========================================================
            DESKTOP MENU HUB (Left Pane >= 992px)
            ======================================================== */}
        <section className="pos-desktop-menu-pane">
          <div className="pos-desktop-toolbar">
            <div className="pos-desktop-search-row">
              <div className="pos-desktop-search-input">
                <FaSearch style={{ color: "#78716c", fontSize: "0.9rem" }} />
                <input
                  type="text"
                  placeholder="Search all menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="pos-search-clear"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category horizontal pill strip */}
            <div className="pos-desktop-cat-list">
              <button
                className={`pos-desktop-cat-pill ${selectedCategoryId === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategoryId("all")}
              >
                ALL ({filteredMenuItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pos-desktop-cat-pill ${selectedCategoryId === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pos-desktop-grid-scroll">
            {renderMenuCards()}
          </div>
        </section>

        {/* ========================================================
            DESKTOP CART STATION (Right Pane >= 992px)
            Side-by-side dedicated POS workstation
            ======================================================== */}
        <aside className="pos-desktop-cart-pane">
          {/* Header */}
          <header className="pos-header-bar">
            <button
              type="button"
              className="pos-header-draft-btn"
              onClick={() => setIsDrawerOpen(true)}
              title="Open Customers & Draft Carts"
            >
              <FaBars />
              <span>Drafts ({carts.length})</span>
            </button>

            <div className="pos-header-title">
              <span className="pos-header-station-name">Cart Station</span>
            </div>

            <button
              type="button"
              className="pos-icon-btn"
              onClick={() => navigate("/manager/orders")}
              title="Order History / Orders List"
            >
              <span style={{ position: "relative", display: "inline-block" }}>
                <FaReceipt />
                <FaClock
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -4,
                    fontSize: "0.62rem",
                  }}
                />
              </span>
            </button>
          </header>

          {/* Customer & Prep Info Rows */}
          <section className="pos-summary-info">
            <div
              className="pos-info-row"
              onClick={() => setIsCustomerModalOpen(true)}
              title="Tap to search or edit customer"
              style={{ cursor: "pointer" }}
            >
              <span className="pos-info-label">Customer Detail:</span>
              <span className="pos-info-value">
                {selectedCart?.customer_name || "Walk-In Customer"}
                {selectedCart?.customer_phone
                  ? ` / ${selectedCart.customer_phone.replace("+91", "")}`
                  : ""}
              </span>
              {selectedCart?.customer_trust_score !== undefined && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background:
                      selectedCart.customer_trust_score < 80 ? "#fee2e2" : "#ecfdf5",
                    color:
                      selectedCart.customer_trust_score < 80 ? "#b91c1c" : "#047857",
                  }}
                >
                  {selectedCart.customer_trust_score} pts
                </span>
              )}
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--pos-primary)",
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <FaEdit />
              </span>
            </div>

            <div
              className="pos-info-row"
              onClick={() => setIsPrepModalOpen(true)}
              title="Tap to edit prep time & notes"
            >
              <span className="pos-info-label">Mode:</span>
              <span
                className="pos-info-value"
                style={{
                  flex: "none",
                  fontWeight: 700,
                  color: orderType === "call" ? "#c2410c" : "#15803d",
                }}
              >
                {orderType === "call" ? "📞 Call" : "🚶 Walk-In"}
              </span>
              <span className="pos-info-label" style={{ marginLeft: 8 }}>
                Prep:
              </span>
              <span className="pos-info-value" style={{ flex: "none" }}>
                {prepTime}
              </span>
              <span className="pos-info-label" style={{ marginLeft: 8 }}>
                Note:
              </span>
              <span className="pos-info-value">{orderNotes || "None"}</span>
            </div>
          </section>

          {/* Cart Table Area */}
          <section className="pos-cart-section">
            <div className="pos-cart-table">
              <div className="pos-table-head">
                <span className="pos-th-item">ITEM</span>
                <span className="pos-th-price">PRICE</span>
                <span className="pos-th-qty">QTY</span>
                <span className="pos-th-amt">AMT</span>
                <span className="pos-th-action"></span>
              </div>

              <div className="pos-cart-items-scroll">
                {!selectedCart?.items || selectedCart.items.length === 0 ? (
                  <div className="pos-cart-empty">
                    No items in cart. Click menu items to add.
                  </div>
                ) : (
                  selectedCart.items.map((item) => {
                    const { base, variant } = getItemDisplayName(item);

                    return (
                      <div key={item.id} className="pos-cart-row">
                        <div className="pos-cart-item-name" title={item.item_name}>
                          <span className="pos-cart-code-tag">
                            {getVariantShortCode({ name: base }, { name: variant })}
                          </span>
                          <span className="pos-cart-base-name">
                            {base.toUpperCase()}
                          </span>
                          {variant && (
                            <span className="pos-cart-variant-tag">
                              ({variant})
                            </span>
                          )}
                        </div>

                        <span className="pos-cart-item-price">
                          ₹{formatPrice(item.item_price)}
                        </span>

                        <div className="pos-cart-qty-ctrl">
                          <button
                            type="button"
                            className="pos-qty-mini-btn"
                            onClick={() =>
                              handleUpdateItemQty(item.id, item.quantity - 1)
                            }
                            title="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span
                            className="pos-qty-num"
                            onClick={() => setEditingItem(item)}
                            title="Click to type custom quantity"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="pos-qty-mini-btn"
                            onClick={() =>
                              handleUpdateItemQty(item.id, item.quantity + 1)
                            }
                            title="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <span className="pos-cart-item-amt">
                          ₹{formatPrice(item.total_price)}
                        </span>

                        <span className="pos-cart-item-action">
                          <button
                            type="button"
                            className="pos-cart-delete-btn"
                            onClick={() => handleUpdateItemQty(item.id, 0)}
                            title="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selectedCart?.items?.length > 0 && (
              <button
                className="pos-clear-items-btn"
                onClick={handleClearAllItems}
              >
                Clear All Items <FaTimesCircle style={{ fontSize: "0.95rem" }} />
              </button>
            )}
          </section>

          {/* Solid Divider */}
          <div className="pos-solid-divider" />

          {/* Controls: [WALK IN | CALL] & [NOW | LATER] */}
          <div className="pos-control-toggles">
            <div className="pos-pill-toggle">
              <button
                type="button"
                className={`pos-pill-btn ${orderType === "walkin" ? "active" : ""}`}
                onClick={() => handleToggleOrderTakingMethod("walkin")}
              >
                WALK IN
              </button>
              <button
                type="button"
                className={`pos-pill-btn ${orderType === "call" ? "active" : ""}`}
                onClick={() => handleToggleOrderTakingMethod("call")}
              >
                CALL
              </button>
            </div>

            <div className="pos-pill-toggle">
              <button
                type="button"
                className={`pos-pill-btn ${prepTiming === "now" ? "active" : ""}`}
                onClick={() => handleTogglePrepTiming("now")}
              >
                NOW
              </button>
              <button
                type="button"
                className={`pos-pill-btn ${prepTiming === "later" ? "active" : ""}`}
                onClick={() => handleTogglePrepTiming("later")}
              >
                LATER
              </button>
            </div>
          </div>

          {/* Bottom Payment & Action Bar */}
          <footer className="pos-bottom-bar">
            {/* Payment Segmented Pill */}
            <div className="pos-payment-segment">
              {["cash", "upi", "credit", "parts", "pending"].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`pos-payment-btn ${paymentMethod === method ? "active" : ""}`}
                  onClick={() => handleSelectPaymentMethod(method)}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Action Buttons: [SAVE] and [BILL - Total] */}
            <div className="pos-action-footer">
              <button
                type="button"
                className="pos-btn-save"
                disabled={placingOrder || !selectedCart?.items?.length}
                onClick={() => handlePlaceOrder(false)}
              >
                {placingOrder ? (
                  <FaSpinner className="spin" />
                ) : (
                  "SAVE"
                )}
              </button>

              <button
                type="button"
                className="pos-btn-bill"
                disabled={placingOrder || !selectedCart?.items?.length}
                onClick={() => handlePlaceOrder(true)}
              >
                BILL - {grandTotal > 0 ? (grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(1)) : 0}
              </button>
            </div>
          </footer>
        </aside>

        {/* ========================================================
            MOBILE WORKSTATION (Single Screen Mobile View < 992px)
            Exact layout as shown in user reference
            ======================================================== */}
        <div className="pos-device-frame pos-mobile-frame">
          {/* ========================================================
              TOP HALF: CART & BILLING (Static Header + Scrolling Items)
              ======================================================== */}
          <div className="pos-mobile-upper-half">
            {/* ---- Top Header Bar ---- */}
            <header className="pos-header-bar">
              <div className="pos-header-title">
                {carts.length > 1 && (
                  <span
                    className="pos-header-draft-pill"
                    onClick={() => setIsDrawerOpen(true)}
                    title="Switch draft customer"
                  >
                    {carts.length} Drafts
                  </span>
                )}
              </div>
            </header>

            {/* ---- Customer & Prep Time Summary Info ---- */}
            <section className="pos-summary-info">
              {/* Customer Detail: HIDDEN until customer name or phone is added! */}
              {hasCustomerDetails && (
                <div
                  className="pos-info-row pos-customer-row"
                  onClick={() => setIsCustomerModalOpen(true)}
                  title="Tap to edit customer"
                >
                  <span className="pos-info-label">Customer:</span>
                  <span className="pos-info-value">
                    {selectedCart?.customer_name || "Customer"}
                    {selectedCart?.customer_phone
                      ? ` / ${selectedCart.customer_phone.replace("+91", "")}`
                      : ""}
                  </span>
                  {selectedCart?.customer_trust_score !== undefined && (
                    <span className="pos-trust-badge">
                      {selectedCart.customer_trust_score} pts
                    </span>
                  )}
                  <span className="pos-info-edit-icon">
                    <FaEdit />
                  </span>
                </div>
              )}

              {/* Prep Time Row */}
              <div
                className="pos-info-row pos-prep-row"
                onClick={() => setIsPrepModalOpen(true)}
                title="Tap to edit prep time & notes"
              >
                <span className="pos-info-label">Prep Time:</span>
                <span className="pos-info-value">{prepTime || "NOW"}</span>
                <span className="pos-info-edit-icon">
                  <FaEdit />
                </span>
              </div>
            </section>

            {/* ---- Active Cart Table with Static Header & Half-Screen Scroll ---- */}
            <section className="pos-cart-section">
              <div className="pos-cart-table">
                {/* Static Underlined Italic Table Heading */}
                <div className="pos-table-head">
                  <span className="pos-th-item">ITEM</span>
                  <span className="pos-th-price">PRICE</span>
                  <span className="pos-th-mult">x</span>
                  <span className="pos-th-qty">QTY</span>
                  <span className="pos-th-amt">AMT</span>
                  <span className="pos-th-action"></span>
                </div>

                {/* Smooth Scrollable Cart Items Container */}
                <div className="pos-cart-items-scroll">
                  {!selectedCart?.items || selectedCart.items.length === 0 ? (
                    <div className="pos-cart-empty">
                      No items in cart. Tap menu items below to add.
                    </div>
                  ) : (
                    selectedCart.items.map((item) => {
                      const { base, variant } = getItemDisplayName(item);
                      const unitPrice = Number(item.item_price || 0);
                      const totalAmt = Number(item.total_price || 0);

                      return (
                        <div key={item.id} className="pos-cart-row">
                          <div className="pos-cart-item-name" title={item.item_name}>
                            <span className="pos-cart-code-tag">
                              {getVariantShortCode({ name: base }, { name: variant })}
                            </span>
                            <span className="pos-cart-base-name">
                              {base.toUpperCase()}
                            </span>
                            {variant && (
                              <span className="pos-cart-variant-tag">
                                ({variant})
                              </span>
                            )}
                          </div>

                          <span className="pos-cart-item-price">
                            {unitPrice % 1 === 0 ? unitPrice.toFixed(1) : unitPrice.toFixed(2)}
                          </span>

                          <span className="pos-cart-item-mult">x</span>

                          <span
                            className="pos-cart-item-qty"
                            onClick={() => setEditingItem(item)}
                            title="Tap to edit quantity"
                          >
                            {item.quantity}
                          </span>

                          <span className="pos-cart-item-amt">
                            {totalAmt % 1 === 0 ? totalAmt.toFixed(1) : totalAmt.toFixed(2)}
                          </span>

                          <span className="pos-cart-item-action">
                            <button
                              type="button"
                              className="pos-cart-edit-btn"
                              onClick={() => setEditingItem(item)}
                              title="Edit quantity"
                            >
                              <FaEdit />
                            </button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cart Sub-Row: Clear All Items [x] and NOTE: */}
              <div className="pos-cart-subrow">
                {selectedCart?.items?.length > 0 ? (
                  <button
                    type="button"
                    className="pos-clear-items-btn"
                    onClick={handleClearAllItems}
                  >
                    Clear All Items <FaTimesCircle style={{ fontSize: "0.92rem" }} />
                  </button>
                ) : (
                  <div />
                )}

                <div
                  className="pos-cart-note-badge"
                  onClick={() => setIsPrepModalOpen(true)}
                  title="Tap to add / edit order note"
                >
                  <span className="pos-note-label">NOTE:</span>
                  <span className="pos-note-text">
                    {orderNotes || ""}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* ---- Solid Dark Divider Line Between Halves ---- */}
          <div className="pos-solid-divider" />

          {/* ========================================================
              BOTTOM HALF: MENU & DOCK (Toggles + Half Screen Menu Scroll)
              ======================================================== */}
          <div className="pos-mobile-lower-half">
            {/* Controls: [WALK IN | CALL] & [NOW | LATER] */}
            <div className="pos-control-toggles">
              <div className="pos-pill-toggle">
                <button
                  type="button"
                  className={`pos-pill-btn ${orderType === "walkin" ? "active" : ""}`}
                  onClick={() => handleToggleOrderTakingMethod("walkin")}
                >
                  WALK IN
                </button>
                <button
                  type="button"
                  className={`pos-pill-btn ${orderType === "call" ? "active" : ""}`}
                  onClick={() => handleToggleOrderTakingMethod("call")}
                >
                  CALL
                </button>
              </div>

              <div className="pos-pill-toggle">
                <button
                  type="button"
                  className={`pos-pill-btn ${prepTiming === "now" ? "active" : ""}`}
                  onClick={() => handleTogglePrepTiming("now")}
                >
                  NOW
                </button>
                <button
                  type="button"
                  className={`pos-pill-btn ${prepTiming === "later" ? "active" : ""}`}
                  onClick={() => handleTogglePrepTiming("later")}
                >
                  LATER
                </button>
              </div>
            </div>

            {/* Mobile Search Bar (when toggled on) */}
            {isSearchOpen && (
              <div className="pos-search-bar">
                <FaSearch style={{ color: "#78716c", fontSize: "0.85rem" }} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="pos-search-clear"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Menu Body: Half-Screen Scrollable Menu Grid + Right Floating Action Dock */}
            <div className="pos-menu-body">
              <div className="pos-menu-grid">
                {renderMenuCards()}
              </div>

              {/* Right Vertical Floating Action Strip Dock */}
              <div className="pos-action-strip">
                {/* 1. History / Drafts */}
                <button
                  type="button"
                  className="pos-strip-btn"
                  onClick={() => setIsDrawerOpen(true)}
                  title="Drafts & Orders"
                >
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <FaReceipt />
                    <FaClock
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -3,
                        fontSize: "0.55rem",
                      }}
                    />
                  </span>
                </button>

                {/* 2. Customer Detail */}
                <button
                  type="button"
                  className={`pos-strip-btn ${hasCustomerDetails ? "highlight" : ""}`}
                  onClick={() => setIsCustomerModalOpen(true)}
                  title="Customer Details"
                >
                  <FaUser />
                </button>

                {/* 3. Note / Prep */}
                <button
                  type="button"
                  className={`pos-strip-btn ${orderNotes ? "highlight" : ""}`}
                  onClick={() => setIsPrepModalOpen(true)}
                  title="Order Note & Prep Time"
                >
                  <FaEdit />
                </button>

                {/* 4. Search */}
                <button
                  type="button"
                  className={`pos-strip-btn ${isSearchOpen ? "active" : ""}`}
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  title="Search Menu"
                >
                  <FaSearch />
                </button>

                {/* 5. Category Selector */}
                <button
                  type="button"
                  className={`pos-strip-btn ${selectedCategoryId !== "all" ? "active" : ""}`}
                  onClick={() => setIsCategoryModalOpen(true)}
                  title="Categories"
                >
                  <FaThLarge />
                </button>

                {/* 6. ALL Items */}
                <button
                  type="button"
                  className={`pos-strip-btn ${selectedCategoryId === "all" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  title="Show All Items"
                >
                  ALL
                </button>
              </div>
            </div>
          </div>

          {/* ---- Fixed Bottom Payment & Action Bar ---- */}
          <footer className="pos-bottom-bar">
            {/* Payment Segmented Pill (CASH | UPI | CREDIT | PARTS | PENDING) */}
            <div className="pos-payment-segment">
              {["cash", "upi", "credit", "parts", "pending"].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`pos-payment-btn ${paymentMethod === method ? "active" : ""}`}
                  onClick={() => handleSelectPaymentMethod(method)}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Action Buttons: [SAVE] and [BILL - Total] */}
            <div className="pos-action-footer">
              <button
                type="button"
                className="pos-btn-save"
                disabled={placingOrder || !selectedCart?.items?.length}
                onClick={() => handlePlaceOrder(false)}
              >
                {placingOrder ? (
                  <FaSpinner className="spin" />
                ) : (
                  "SAVE"
                )}
              </button>

              <button
                type="button"
                className="pos-btn-bill"
                disabled={placingOrder || !selectedCart?.items?.length}
                onClick={() => handlePlaceOrder(true)}
              >
                BILL - {grandTotal > 0 ? (grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(1)) : 0}
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* ========================================================
          CART POPUP MODAL (DEDICATED MODAL POPUP, NOT SIDEBAR)
          ======================================================== */}
      {isCartPopupOpen && (
        <div
          className="pos-cart-modal-backdrop"
          onClick={() => setIsCartPopupOpen(false)}
        >
          <div
            className="pos-device-frame pos-cart-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- Top Header Bar ---- */}
            <header className="pos-header-bar">
              <button
                type="button"
                className="pos-icon-btn"
                onClick={() => setIsDrawerOpen(true)}
                title="Open Customers & Drafts"
              >
                <FaBars />
              </button>

              <div className="pos-header-title">
                <span className="pos-header-station-name">Cart Station</span>
                {carts.length > 1 && (
                  <span
                    className="pos-header-draft-pill"
                    onClick={() => setIsDrawerOpen(true)}
                    title="Switch draft customer"
                  >
                    {carts.length} Drafts
                  </span>
                )}
              </div>

              <button
                type="button"
                className="pos-icon-btn pos-cart-close-btn"
                onClick={() => setIsCartPopupOpen(false)}
                title="Close Cart"
              >
                <FaTimes />
              </button>
            </header>

            {/* ---- Customer & Prep Time Summary Info ---- */}
            <section className="pos-summary-info">
              <div
                className="pos-info-row"
                onClick={() => setIsCustomerModalOpen(true)}
                title="Tap to search or edit customer"
                style={{ cursor: "pointer" }}
              >
                <span className="pos-info-label">Customer Detail:</span>
                <span className="pos-info-value">
                  {selectedCart?.customer_name || "Walk-In Customer"}
                  {selectedCart?.customer_phone
                    ? ` / ${selectedCart.customer_phone.replace("+91", "")}`
                    : ""}
                </span>
                {selectedCart?.customer_trust_score !== undefined && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: selectedCart.customer_trust_score < 80 ? "#fee2e2" : "#ecfdf5",
                      color: selectedCart.customer_trust_score < 80 ? "#b91c1c" : "#047857",
                    }}
                  >
                    {selectedCart.customer_trust_score} pts
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--pos-primary)",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <FaEdit />
                </span>
              </div>

              <div
                className="pos-info-row"
                onClick={() => setIsPrepModalOpen(true)}
                title="Tap to edit prep time & notes"
              >
                <span className="pos-info-label">Mode:</span>
                <span
                  className="pos-info-value"
                  style={{
                    flex: "none",
                    fontWeight: 700,
                    color: orderType === "call" ? "#c2410c" : "#15803d",
                  }}
                >
                  {orderType === "call" ? "📞 Call" : "🚶 Walk-In"}
                </span>
                <span className="pos-info-label" style={{ marginLeft: 8 }}>
                  Prep:
                </span>
                <span className="pos-info-value" style={{ flex: "none" }}>
                  {prepTime}
                </span>
                <span className="pos-info-label" style={{ marginLeft: 8 }}>
                  Note:
                </span>
                <span className="pos-info-value">{orderNotes || "None"}</span>
              </div>
            </section>

            {/* ---- Active Cart Table ---- */}
            <section className="pos-cart-section">
              <div className="pos-cart-table">
                <div className="pos-table-head">
                  <span className="pos-th-item">ITEM</span>
                  <span className="pos-th-price">PRICE</span>
                  <span className="pos-th-qty">QTY</span>
                  <span className="pos-th-amt">AMT</span>
                  <span className="pos-th-action"></span>
                </div>

                <div className="pos-cart-items-scroll">
                  {!selectedCart?.items || selectedCart.items.length === 0 ? (
                    <div className="pos-cart-empty">
                      No items in cart. Tap items to add.
                    </div>
                  ) : (
                    selectedCart.items.map((item) => {
                      const { base, variant } = getItemDisplayName(item);

                      return (
                        <div key={item.id} className="pos-cart-row">
                          <div className="pos-cart-item-name" title={item.item_name}>
                            <span className="pos-cart-code-tag">
                              {getVariantShortCode({ name: base }, { name: variant })}
                            </span>
                            <span className="pos-cart-base-name">
                              {base.toUpperCase()}
                            </span>
                            {variant && (
                              <span className="pos-cart-variant-tag">
                                ({variant})
                              </span>
                            )}
                          </div>

                          <span className="pos-cart-item-price">
                            ₹{formatPrice(item.item_price)}
                          </span>

                          <div className="pos-cart-qty-ctrl">
                            <button
                              type="button"
                              className="pos-qty-mini-btn"
                              onClick={() => handleUpdateItemQty(item.id, item.quantity - 1)}
                              title="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span
                              className="pos-qty-num"
                              onClick={() => setEditingItem(item)}
                              title="Tap to type custom quantity"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="pos-qty-mini-btn"
                              onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                              title="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <span className="pos-cart-item-amt">
                            ₹{formatPrice(item.total_price)}
                          </span>

                          <span className="pos-cart-item-action">
                            <button
                              type="button"
                              className="pos-cart-delete-btn"
                              onClick={() => handleUpdateItemQty(item.id, 0)}
                              title="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedCart?.items?.length > 0 && (
                <button
                  className="pos-clear-items-btn"
                  onClick={handleClearAllItems}
                >
                  Clear All Items <FaTimesCircle style={{ fontSize: "0.95rem" }} />
                </button>
              )}
            </section>

            {/* ---- Solid Dark Divider Line ---- */}
            <div className="pos-solid-divider" />

            {/* ---- Controls: [WALK IN | CALL] & [NOW | LATER] ---- */}
            <div className="pos-control-toggles">
              <div className="pos-pill-toggle">
                <button
                  className={`pos-pill-btn ${orderType === "walkin" ? "active" : ""}`}
                  onClick={() => handleToggleOrderTakingMethod("walkin")}
                >
                  WALK IN
                </button>
                <button
                  className={`pos-pill-btn ${orderType === "call" ? "active" : ""}`}
                  onClick={() => handleToggleOrderTakingMethod("call")}
                >
                  CALL
                </button>
              </div>

              <div className="pos-pill-toggle">
                <button
                  className={`pos-pill-btn ${prepTiming === "now" ? "active" : ""}`}
                  onClick={() => handleTogglePrepTiming("now")}
                >
                  NOW
                </button>
                <button
                  className={`pos-pill-btn ${prepTiming === "later" ? "active" : ""}`}
                  onClick={() => handleTogglePrepTiming("later")}
                >
                  LATER
                </button>
              </div>
            </div>

            {/* ---- Fixed Bottom Payment & Action Bar ---- */}
            <footer className="pos-bottom-bar">
              {/* Payment Segmented Pill */}
              <div className="pos-payment-segment">
                {["cash", "upi", "credit", "parts"].map((method) => (
                  <button
                    key={method}
                    className={`pos-payment-btn ${paymentMethod === method ? "active" : ""}`}
                    onClick={() => handleSelectPaymentMethod(method)}
                  >
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Action Buttons: [SAVE] and [BILL - Total] */}
              <div className="pos-action-footer">
                <button
                  className="pos-btn-save"
                  disabled={placingOrder || !selectedCart?.items?.length}
                  onClick={() => handlePlaceOrder(false)}
                >
                  {placingOrder ? (
                    <FaSpinner className="spin" />
                  ) : (
                    "SAVE"
                  )}
                </button>

                <button
                  className="pos-btn-bill"
                  disabled={placingOrder || !selectedCart?.items?.length}
                  onClick={() => handlePlaceOrder(true)}
                >
                  BILL - {grandTotal > 0 ? (grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(1)) : 0}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: EDIT CUSTOMER DETAILS
          ======================================================== */}
      {isCustomerModalOpen && (
        <div
          className="pos-modal-backdrop"
          onClick={() => setIsCustomerModalOpen(false)}
        >
          <div
            className="pos-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <h3>Customer Details</h3>
              <button
                className="pos-modal-close"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="pos-modal-body">
              {/* Phone Number with fixed +91 prefix badge */}
              <div className="pos-form-group">
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Customer Phone Number</span>
                  {isSearchingCust && (
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FaSpinner className="spin" /> Searching...
                    </span>
                  )}
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      border: "1.5px solid #cbd5e1",
                      borderRight: "none",
                      padding: "8px 12px",
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                      fontWeight: 800,
                      color: "#334155",
                      fontSize: "0.9rem",
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      border: "1.5px solid #cbd5e1",
                    }}
                    className="pos-form-input"
                    value={custFormPhone}
                    onChange={(e) => handlePhoneLookup(e.target.value)}
                    placeholder="10-digit mobile number"
                    autoFocus
                  />
                </div>
              </div>

              {/* Status Banner: Existing vs New Customer */}
              {custLookupFound ? (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #10b981",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: "0.85rem",
                    color: "#065f46",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#047857", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>✅ Existing Customer Found</span>
                  </div>
                  <div>Name: <b>{custFormName}</b> &bull; Phone: <b>+91{custFormPhone}</b></div>
                  <div style={{ fontSize: "0.78rem", color: "#059669" }}>
                    Past Orders: <b>{custLookupOrders}</b> &bull; Trust Score: <b>{custLookupTrust ?? 100} pts</b>
                  </div>
                </div>
              ) : custFormPhone.length === 10 ? (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1.5px solid #3b82f6",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: "0.84rem",
                    color: "#1e40af",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#1d4ed8" }}>
                    ✨ New Customer Account Will Be Created
                  </div>
                  <div>• Mobile: <b>+91{custFormPhone}</b></div>
                  <div>• Default Password: <b>{custFormPhone}</b> (same as mobile number)</div>
                  <div style={{ fontSize: "0.76rem", color: "#60a5fa" }}>
                    A new customer profile will be created automatically in system when you save.
                  </div>
                </div>
              ) : null}

              {/* Customer Name */}
              <div className="pos-form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  className="pos-form-input"
                  value={custFormName}
                  onChange={(e) => setCustFormName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                />
              </div>

              {/* Active Draft Switching */}
              <div className="pos-form-group">
                <label>Switch Active Draft Customer</label>
                <select
                  className="pos-form-input"
                  value={selectedCartId || ""}
                  onChange={(e) => setSelectedCartId(Number(e.target.value))}
                >
                  {carts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name || "Walk-In"} ({c.total_items || 0} items)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pos-modal-actions">
                <button
                  className="pos-btn-secondary"
                  onClick={handleCreateNewCustomer}
                >
                  <FaUserPlus style={{ marginRight: 6 }} /> New Draft
                </button>
                <button
                  className="pos-btn-primary"
                  onClick={handleSaveCustomer}
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT PREP TIME & ORDER NOTES
          ======================================================== */}
      {isPrepModalOpen && (
        <div
          className="pos-modal-backdrop"
          onClick={() => setIsPrepModalOpen(false)}
        >
          <div
            className="pos-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <h3>Prep Time & Note</h3>
              <button
                className="pos-modal-close"
                onClick={() => setIsPrepModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="pos-modal-body">
              <div className="pos-form-group">
                <label>Prep Time</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {["NOW", "15 Min", "30 Min", "45 Min"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`pos-pill-btn ${prepTime === t ? "active" : ""}`}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #4a1811",
                        borderRadius: 999,
                        flex: "none",
                      }}
                      onClick={() => setPrepTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="pos-form-input"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="e.g. 02:30 PM or NOW"
                />
              </div>

              <div className="pos-form-group">
                <label>Order Note</label>
                <textarea
                  rows={3}
                  className="pos-form-textarea"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. afghani naan thick chahiye"
                />
              </div>

              {/* Discount Selection */}
              {discounts.length > 0 && (
                <div className="pos-form-group">
                  <label>Apply Discount</label>
                  <select
                    className="pos-form-input"
                    value={selectedDiscountId || ""}
                    onChange={(e) => setSelectedDiscountId(e.target.value || null)}
                  >
                    <option value="">No Discount</option>
                    {discounts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.discount_type === "percentage" ? `${d.value}%` : `₹${d.value}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pos-modal-actions">
                <button
                  className="pos-btn-secondary"
                  onClick={() => setIsPrepModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="pos-btn-primary"
                  onClick={handleSavePrepAndNotes}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2.5: SELECT CATEGORY (Mobile Dock ⊞)
          ======================================================== */}
      {isCategoryModalOpen && (
        <div
          className="pos-modal-backdrop"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            className="pos-modal-card pos-cat-picker-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <h3>Select Category</h3>
              <button
                className="pos-modal-close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="pos-cat-picker-grid">
              <button
                type="button"
                className={`pos-cat-picker-btn ${selectedCategoryId === "all" ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategoryId("all");
                  setIsCategoryModalOpen(false);
                }}
              >
                ALL ({filteredMenuItems.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`pos-cat-picker-btn ${selectedCategoryId === c.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategoryId(c.id);
                    setIsCategoryModalOpen(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: EDIT CART ITEM QUANTITY
          ======================================================== */}
      {editingItem && (
        <div
          className="pos-modal-backdrop"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="pos-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <h3>{editingItem.item_name}</h3>
              <button
                className="pos-modal-close"
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="pos-modal-body">
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <span style={{ fontSize: "0.9rem", color: "#78716c" }}>Price per item: </span>
                <strong style={{ fontSize: "1.1rem", color: "#4a1811" }}>
                  ₹{Number(editingItem.item_price).toFixed(2)}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  margin: "12px 0",
                }}
              >
                <button
                  className="pos-icon-btn"
                  style={{
                    background: "#f5f5f4",
                    border: "1px solid #d6d3d1",
                    borderRadius: 999,
                    width: 44,
                    height: 44,
                  }}
                  onClick={() => {
                    const newQ = editingItem.quantity - 1;
                    handleUpdateItemQty(editingItem.id, newQ);
                    if (newQ <= 0) setEditingItem(null);
                    else setEditingItem({ ...editingItem, quantity: newQ });
                  }}
                >
                  <FaMinus />
                </button>

                <input
                  type="number"
                  min={1}
                  value={editingItem.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0) {
                      handleUpdateItemQty(editingItem.id, val);
                      if (val === 0) setEditingItem(null);
                      else setEditingItem({ ...editingItem, quantity: val });
                    }
                  }}
                  style={{
                    width: 70,
                    textAlign: "center",
                    fontSize: "1.3rem",
                    fontWeight: "800",
                    border: "2px solid #4a1811",
                    borderRadius: 10,
                    padding: "6px 0",
                  }}
                />

                <button
                  className="pos-icon-btn"
                  style={{
                    background: "#f5f5f4",
                    border: "1px solid #d6d3d1",
                    borderRadius: 999,
                    width: 44,
                    height: 44,
                  }}
                  onClick={() => {
                    const newQ = editingItem.quantity + 1;
                    handleUpdateItemQty(editingItem.id, newQ);
                    setEditingItem({ ...editingItem, quantity: newQ });
                  }}
                >
                  <FaPlus />
                </button>
              </div>

              {/* Quick Quantities */}
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {[1, 2, 3, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    className={`pos-pill-btn ${editingItem.quantity === qty ? "active" : ""}`}
                    style={{
                      padding: "5px 12px",
                      border: "1px solid #4a1811",
                      borderRadius: 8,
                      flex: "none",
                    }}
                    onClick={() => {
                      handleUpdateItemQty(editingItem.id, qty);
                      setEditingItem({ ...editingItem, quantity: qty });
                    }}
                  >
                    {qty}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: "1px solid #f0eee9",
                  marginTop: 8,
                }}
              >
                <span>Total for this item:</span>
                <strong style={{ color: "#16a34a", fontSize: "1.1rem" }}>
                  ₹{(Number(editingItem.item_price) * editingItem.quantity).toFixed(2)}
                </strong>
              </div>

              <div className="pos-modal-actions">
                <button
                  className="pos-btn-secondary"
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  onClick={() => {
                    handleUpdateItemQty(editingItem.id, 0);
                    setEditingItem(null);
                  }}
                >
                  <FaTrash style={{ marginRight: 6 }} /> Delete
                </button>
                <button
                  className="pos-btn-primary"
                  onClick={() => setEditingItem(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DRAWER: DRAFTS & NAVIGATION (Hamburger)
          ======================================================== */}
      {isDrawerOpen && (
        <>
          <div
            className="pos-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="pos-drawer-card">
            <div className="pos-drawer-header">
              <h3>Draft Customers</h3>
              <button
                className="pos-icon-btn"
                style={{ color: "#ffffff" }}
                onClick={() => setIsDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="pos-drawer-content">
              <button
                className="pos-btn-primary"
                onClick={handleCreateNewCustomer}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <FaUserPlus /> + New Customer
              </button>

              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#78716c", textTransform: "uppercase" }}>
                Active Carts ({carts.length})
              </div>

              {carts.map((c) => (
                <div
                  key={c.id}
                  className={`pos-drawer-cart-item ${selectedCartId === c.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCartId(c.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "#1c1917" }}>
                      {c.customer_name || "Walk-In Customer"}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                      {c.customer_phone || "No Phone"}
                    </div>
                  </div>
                  <span
                    style={{
                      background: selectedCartId === c.id ? "#4a1811" : "#e7e5e4",
                      color: selectedCartId === c.id ? "#ffffff" : "#44403c",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                    }}
                  >
                    {c.total_items || 0} items
                  </span>
                </div>
              ))}
            </div>

            <div className="pos-drawer-footer">
              <button
                className="pos-btn-secondary"
                style={{ width: "100%", marginBottom: 8 }}
                onClick={() => navigate("/manager/orders")}
              >
                View Orders History
              </button>
              <button
                className="pos-btn-secondary"
                style={{ width: "100%" }}
                onClick={() => navigate("/manager/dashboard")}
              >
                Manager Dashboard
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          RECEIPT PRINTER MODAL
          ======================================================== */}
      {showReceipt && receiptOrderId && (
        <ReceiptPrinter
          orderId={receiptOrderId}
          orderType="walkin"
          onClose={() => {
            setShowReceipt(false);
            setReceiptOrderId(null);
          }}
          onPrinted={() => {
            Toast.fire({ icon: "success", title: "Receipt Printed" });
          }}
        />
      )}
    </div>
  );
}