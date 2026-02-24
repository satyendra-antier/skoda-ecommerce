import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

/** Cart stored by productId + quantity so persistence survives refresh and we merge with API for current prices/stock */
export interface CartEntry {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = "skoda-cart-wishlist";

function migrateCart(raw: unknown): CartEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    if (item && typeof item === "object" && "productId" in item && "quantity" in item) {
      return { productId: String((item as CartEntry).productId), quantity: Number((item as CartEntry).quantity) || 0 };
    }
    if (item && typeof item === "object" && "product" in item && typeof (item as { product: { id?: string } }).product === "object") {
      const p = (item as { product: { id: string }; quantity: number }).product;
      const q = (item as { quantity: number }).quantity;
      return { productId: p?.id ?? "", quantity: Number(q) || 0 };
    }
    return null;
  }).filter((e): e is CartEntry => e !== null && e.quantity > 0 && !!e.productId);
}

interface StoreState {
  cart: CartEntry[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: () => number;
}

const maxQuantityForProduct = (p: Product) => Math.max(0, p.stockQuantity ?? 999);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      addToCart: (product, quantity = 1) =>
        set((state) => {
          const maxQty = maxQuantityForProduct(product);
          if (maxQty <= 0) return state;
          const existing = state.cart.find((i) => i.productId === product.id);
          const currentQty = existing?.quantity ?? 0;
          const newQty = Math.min(currentQty + quantity, maxQty);
          if (newQty <= 0) return state;
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === product.id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return { cart: [...state.cart, { productId: product.id, quantity: newQty }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
      clearCart: () => set({ cart: [] }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((i) => i.productId !== productId) };
          }
          return {
            cart: state.cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          };
        }),
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      isInWishlist: (productId) => get().wishlist.includes(productId),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
      merge: (persisted, current) => {
        const raw = persisted as { cart?: unknown; wishlist?: string[] } | undefined;
        const cart = migrateCart(raw?.cart);
        const wishlist = Array.isArray(raw?.wishlist) ? raw.wishlist.filter((id) => typeof id === "string") : current.wishlist;
        return { ...current, cart, wishlist };
      },
    }
  )
);

/** Merge cart entries with product list for display. Caps quantity by current stock. */
export function getCartItemsWithProducts(cart: CartEntry[], products: Product[]): CartItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return cart
    .map((entry) => {
      const product = byId.get(entry.productId);
      if (!product) return null;
      const maxQty = Math.max(0, product.stockQuantity ?? 999);
      const quantity = Math.min(entry.quantity, maxQty);
      if (quantity <= 0) return null;
      return { product, quantity };
    })
    .filter((x): x is CartItem => x !== null);
}
