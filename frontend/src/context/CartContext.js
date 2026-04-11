import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "restaurant-cart";
const CartContext = createContext(null);

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      itemCount: count,
      subtotal,
      tax,
      total,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((entry) => entry._id === item._id);
          if (existing) {
            return current.map((entry) => entry._id === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry);
          }
          return [...current, { ...item, quantity: 1 }];
        });
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item._id !== id)),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          setItems((current) => current.filter((item) => item._id !== id));
          return;
        }
        setItems((current) => current.map((item) => item._id === id ? { ...item, quantity } : item));
      },
      clearCart: () => setItems([])
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
