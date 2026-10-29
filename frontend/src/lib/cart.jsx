import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'craving.cart';
const CartContext = createContext(null);

function readCart() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [isOpen, setIsOpen] = useState(false);

  const update = useCallback((updater) => {
    setItems((current) => {
      const next = updater(current);
      persist(next);
      return next;
    });
  }, []);

  const addItem = useCallback(
    (item) => {
      const key = `${item.restaurantId}-${item.name}-${item.portion}`;

      update((current) => {
        const existing = current.find((entry) => entry.key === key);

        if (existing) {
          return current.map((entry) =>
            entry.key === key ? { ...entry, qty: entry.qty + item.qty } : entry,
          );
        }

        return [...current, { ...item, key }];
      });

      setIsOpen(true);
    },
    [update],
  );

  const increment = useCallback(
    (key) => {
      update((current) =>
        current.map((entry) => (entry.key === key ? { ...entry, qty: entry.qty + 1 } : entry)),
      );
    },
    [update],
  );

  const decrement = useCallback(
    (key) => {
      update((current) =>
        current
          .map((entry) => (entry.key === key ? { ...entry, qty: entry.qty - 1 } : entry))
          .filter((entry) => entry.qty > 0),
      );
    },
    [update],
  );

  const remove = useCallback(
    (key) => {
      update((current) => current.filter((entry) => entry.key !== key));
    },
    [update],
  );

  const clear = useCallback(() => {
    update(() => []);
  }, [update]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      addItem,
      increment,
      decrement,
      remove,
      clear,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, count, subtotal, isOpen, addItem, increment, decrement, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
