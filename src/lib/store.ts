import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  qty: number;
  price?: number;
};

export type OrderStatus =
  | "packing"
  | "on-the-way"
  | "ready"
  | "delivered";

export function statusLabel(status: OrderStatus) {
  switch (status) {
    case "packing":
      return "Inaandaliwa";
    case "on-the-way":
      return "Iko njiani";
    case "ready":
      return "Tayari kuchukuliwa";
    case "delivered":
      return "Imefikishwa";
  }
}

type SokoState = {
  lines: CartLine[];
  add: (productId: string, qty?: number, price?: number) => void;
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

      add: (productId, qty = 1, price) => {
        if (!productId || qty <= 0) return;

        set((state) => {
          const existing = state.lines.find(
            (line) => line.productId === productId,
          );

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.productId === productId
                  ? {
                      ...line,
                      qty: line.qty + qty,
                      price: price ?? line.price,
                    }
                  : line,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                productId,
                qty,
                ...(price !== undefined ? { price } : {}),
              },
            ],
          };
        });
      },

      setQty: (productId, qty) => {
        set((state) => {
          if (qty <= 0) {
            return {
              lines: state.lines.filter(
                (line) => line.productId !== productId,
              ),
            };
          }

          return {
            lines: state.lines.map((line) =>
              line.productId === productId
                ? { ...line, qty }
                : line,
            ),
          };
        });
      },

      remove: (productId) => {
        set((state) => ({
          lines: state.lines.filter(
            (line) => line.productId !== productId,
          ),
        }));
      },

      clear: () => set({ lines: [] }),

      qtyOf: (productId) =>
        get().lines.find((line) => line.productId === productId)?.qty ?? 0,

      count: () =>
        get().lines.reduce((total, line) => total + line.qty, 0),

      subtotal: () =>
        get().lines.reduce(
          (total, line) =>
            total + (line.price ?? 0) * line.qty,
          0,
        ),
    }),
    {
      name: "soko-market",
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
