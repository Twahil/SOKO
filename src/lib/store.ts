import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct } from "./catalog";

export type CartLine = { productId: string; qty: number };

export type OrderStatus = "packing" | "on-the-way" | "ready" | "delivered";

export function statusLabel(status: OrderStatus) {
  switch (status) {
    case "packing": return "Inaandaliwa Tanzania";
    case "on-the-way": return "Iko njiani";
    case "ready": return "Tayari kuchukuliwa";
    case "delivered": return "Imefikishwa";
  }
}

type SokoState = {
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
  count: () => number;
  subtotal: () => number;
};

export const useSokoStore = create<SokoState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId, qty = 1) => {
        if (!getProduct(productId)) return;
        set((state) => {
          const existing = state.lines.find((l) => l.productId === productId);
          if (existing) {
            return { lines: state.lines.map((l) => l.productId === productId ? { ...l, qty: l.qty + qty } : l) };
          }
          return { lines: [...state.lines, { productId, qty }] };
        });
      },
      setQty: (productId, qty) => set((state) => {
        if (qty <= 0) return { lines: state.lines.filter((l) => l.productId !== productId) };
        const existing = state.lines.find((l) => l.productId === productId);
        if (!existing) return { lines: [...state.lines, { productId, qty }] };
        return { lines: state.lines.map((l) => l.productId === productId ? { ...l, qty } : l) };
      }),
      remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      qtyOf: (productId) => get().lines.find((l) => l.productId === productId)?.qty ?? 0,
      count: () => get().lines.reduce((n, l) => n + l.qty, 0),
      subtotal: () => get().lines.reduce((sum, l) => {
        const p = getProduct(l.productId);
        return p ? sum + p.price * l.qty : sum;
      }, 0),
    }),
    { name: "soko-market", skipHydration: true, partialize: (state) => ({ lines: state.lines }) },
  ),
);
