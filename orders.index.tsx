import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTsh, formatWhen } from "@/lib/money";
import { listOrders, type StoredOrder } from "@/lib/orders.server";
import { statusLabel } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/orders/")({ component: OrdersPage });

function OrdersPage() {
  const { user, isPending } = useCurrentUserState();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    void listOrders().then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (isPending || loading) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">Inapakia oda…</div>;
  if (!user) return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Ingia kuona oda zako</h1>
      <p className="mt-2 text-muted">Oda zako zinahifadhiwa kwenye akaunti yako ya SOKO.</p>
      <Button asChild className="mt-6"><Link to="/login">Ingia / Fungua akaunti</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Oda</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Oda zako</h1>
      {orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <ClipboardList className="size-10 text-subtle" strokeWidth={1.5} />
          <p className="mt-4 max-w-sm text-muted">Bado huna oda. Ukikamilisha oda, itaonekana hapa ili uweze kuifuatilia.</p>
          <Button asChild className="mt-6"><Link to="/shop">Nunua sokoni</Link></Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to="/orders/$id" params={{ id: order.id }} className="flex items-center justify-between gap-4 rounded-xl bg-surface px-5 py-4 shadow-border hover:shadow-lift">
                <div><p className="font-medium">{order.id}</p><p className="text-sm text-muted">{formatWhen(order.placedAt)}<span className="mx-2">·</span>{order.fulfillment === "pickup" ? "Kuchukua" : "Uwasilishaji"}</p></div>
                <div className="text-right"><p className="tabular-nums">{formatTsh(order.total)}</p><p className="text-sm text-muted">{statusLabel(order.status)}</p></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
