import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product, ProductCategory } from "../data/products";
import type { CartItem, DeliveryPlan } from "../lib/delivery";
import type { CustomerLocation } from "../lib/geo";

type Screen = "home" | "categories" | "cart" | "checkout" | "confirmed" | "cupons" | "conta";

export type ConfirmedOrder = {
  orderId: string;
  plan: DeliveryPlan;
  customer: CustomerLocation;
  deliveryOption: "split" | "full";
  storeMode: "rapida" | "programada";
  storeSchedule: { date: string; slot: string } | null;
  otherStoreSchedules: Record<string, { date: string; slot: string }>;
  cdSchedule: { date: string; slot: string } | null;
  fullSchedule: { date: string; slot: string } | null;
  totalProducts: number;
  totalShipping: number;
  totalFinal: number;
  confirmedAt: Date;
  items: CartItem[];
};

type AppState = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  customer: CustomerLocation | null;
  setCustomer: (c: CustomerLocation | null) => void;
  selectedCategory: ProductCategory | null;
  setSelectedCategory: (c: ProductCategory | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  confirmedOrder: ConfirmedOrder | null;
  setConfirmedOrder: (o: ConfirmedOrder | null) => void;
};

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        customer,
        setCustomer,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        confirmedOrder,
        setConfirmedOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
