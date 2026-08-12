"use client";

// Cart context for the /payment-test North (EPX) shop. Ported from North's
// own shopping-cart tutorial (CartContext.jsx) — see
// https://developer.north.com/blog/embedded-payments-react-app-shopping-cart
// — extended so each size/format/color variant is its own line item (the
// original tutorial's cart only keyed on a single product id).

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CartLineItem = {
  /** The variant id (e.g. "logo-tee-M") — unique cart line-item key. */
  id: string;
  productId: string;
  title: string;
  variantLabel: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
};

type CartContextValue = {
  items: CartLineItem[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  getCartItemQuantity: (variantId: string) => number;
  addOneItemToCart: (item: Omit<CartLineItem, "quantity">) => void;
  removeOneItemFromCart: (variantId: string) => void;
  deleteItemFromCart: (variantId: string) => void;
  getTotalCost: () => number;
  getNumberOfCartItems: () => number;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "7h_north_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

function readCartFromStorage(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function NorthCartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount. Intentionally deferred to an
  // effect rather than a useState lazy initializer: reading localStorage
  // during the initial client render would make that render's output (cart
  // count, etc.) diverge from the server-rendered markup and trigger a
  // hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartItems(readCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  const getCartItemQuantity = (variantId: string) => {
    return cartItems.find((item) => item.id === variantId)?.quantity ?? 0;
  };

  const addOneItemToCart = (item: Omit<CartLineItem, "quantity">) => {
    const existingQuantity = getCartItemQuantity(item.id);
    if (existingQuantity === 0) {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    } else {
      setCartItems(
        cartItems.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    }
  };

  const deleteItemFromCart = (variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== variantId));
  };

  const removeOneItemFromCart = (variantId: string) => {
    const quantity = getCartItemQuantity(variantId);
    if (quantity <= 1) {
      deleteItemFromCart(variantId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === variantId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const getTotalCost = () => {
    return cartItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  };

  const getNumberOfCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const value: CartContextValue = useMemo(() => ({
    items: cartItems,
    loading,
    setLoading,
    getCartItemQuantity,
    addOneItemToCart,
    removeOneItemFromCart,
    deleteItemFromCart,
    getTotalCost,
    getNumberOfCartItems,
    clearCart,
  }), [cartItems, loading]);

  // eslint-disable-next-line react-doctor/context-provider-value-from-unmemoized-local-literal
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useNorthCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useNorthCart must be used within a NorthCartProvider");
  }
  return ctx;
}
