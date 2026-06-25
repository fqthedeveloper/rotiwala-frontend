import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  createWalkInCart,
  getWalkInCarts,
  getWalkInCart,
  updateWalkInCart,
  placeWalkInCart,
  updateWalkInOrder,
} from "../service/walkInService";

const createDefaultCartPayload = () => ({
  customer_name: "Walk-In Customer",
  customer_phone: "",
  payment_method: "cash",
  notes: "",
});

const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  let normalized = phone.trim().replace(/[^\d+]/g, "");
  if (normalized.startsWith("91") && !normalized.startsWith("+91")) {
    normalized = `+${normalized}`;
  }
  if (!normalized.startsWith("+91")) {
    normalized = `+91${normalized.replace(/^\+/, "")}`;
  }
  return normalized;
};

export default function useWalkInCart() {
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const selectedCartIdRef = useRef(null);

  useEffect(() => {
    selectedCartIdRef.current = selectedCartId;
  }, [selectedCartId]);

  const loadCarts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWalkInCarts();
      const list = data || [];
      setCarts(list);
      if (list.length === 0) {
        const cart = await createWalkInCart(createDefaultCartPayload());
        setCarts([cart]);
        setSelectedCartId(cart.id);
        return [cart];
      }
      if (!selectedCartId || !list.some((cart) => cart.id === selectedCartId)) {
        setSelectedCartId(list[0].id);
      }
      return list;
    } catch (error) {
      Swal.fire("Error", "Unable to load draft carts.", "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedCartId]);

  const loadSelectedCart = useCallback(async (cartId) => {
    if (!cartId) return null;
    setLoading(true);
    try {
      const cart = await getWalkInCart(cartId);
      setSelectedCart(cart || null);
      setSelectedCartId(cart?.id || null);
      return cart;
    } catch (error) {
      Swal.fire("Error", "Unable to load the selected cart.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSelectedCart = useCallback(async () => {
    if (!selectedCartIdRef.current) return null;
    return await loadSelectedCart(selectedCartIdRef.current);
  }, [loadSelectedCart]);

  const createCart = useCallback(async () => {
    setLoading(true);
    try {
      const cart = await createWalkInCart(createDefaultCartPayload());
      await loadCarts();
      setSelectedCartId(cart.id);
      return cart;
    } catch (error) {
      Swal.fire("Error", "Unable to create draft cart.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadCarts]);

  const saveCustomerDetails = useCallback(
    async ({ cartId, customer_name, customer_phone, payment_method, notes }) => {
      if (!cartId) return null;

      const payload = {
        customer_name,
        customer_phone: normalizePhoneNumber(customer_phone),
        payment_method,
        notes,
      };

      try {
        if (selectedCart?.order_id) {
          return await updateWalkInOrder(selectedCart.order_id, payload);
        }
        return await updateWalkInCart(cartId, payload);
      } catch (error) {
        Swal.fire("Error", "Unable to save customer details.", "error");
        return null;
      }
    },
    [selectedCart],
  );

  const placeOrder = useCallback(async (cartId) => {
    if (!cartId) return null;
    setLoading(true);
    try {
      const result = await placeWalkInCart(cartId);
      await loadCarts();
      return result;
    } catch (error) {
      Swal.fire("Error", "Unable to place order.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadCarts]);

  const activeOrderId = useMemo(() => {
    return selectedCart?.order_id || selectedCart?.walkin_order?.id || null;
  }, [selectedCart]);

  const cartItems = useMemo(() => selectedCart?.items || [], [selectedCart]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.item_price || 0);
      const quantity = Number(item.quantity || 0);
      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  return {
    carts,
    selectedCartId,
    selectedCart,
    cartItems,
    cartSubtotal,
    activeOrderId,
    loading,
    setSelectedCartId,
    setSelectedCart,
    loadCarts,
    loadSelectedCart,
    refreshSelectedCart,
    createCart,
    saveCustomerDetails,
    placeOrder,
    normalizePhoneNumber,
  };
}
