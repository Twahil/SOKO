export function formatTsh(amount: number) {
  return `TSh ${amount.toLocaleString("sw-TZ")}`;
}

export function formatWhen(ts: number) {
  return new Date(ts).toLocaleString("sw-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dar_es_Salaam",
  });
}

export const DELIVERY_FEE = 3000;
export const FREE_DELIVERY_OVER = 30000;
export const PICKUP_ADDRESS = "Soko la Mwanza, Tanzania";

export function deliveryFeeFor(subtotal: number, fulfillment: "delivery" | "pickup") {
  if (fulfillment === "pickup") return 0;
  if (subtotal >= FREE_DELIVERY_OVER) return 0;
  return DELIVERY_FEE;
}
