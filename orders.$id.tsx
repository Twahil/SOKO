import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTsh, formatWhen, PICKUP_ADDRESS } from "@/lib/money";
import { statusLabel } from "@/lib/store";
import { getOrder, type StoredOrder } from "@/lib/orders.server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useEffect, useState } from "react";
import { SLOTS } from "@/lib/catalog";

export const Route = createFileRoute("/orders/$id")({ component: OrderDetailPage });

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [order, setOrder] = useState<StoredOrder | null | undefined>(undefined);
  useEffect(() => {
    if (!user) { setOrder(null); return; }
    void getOrder({ data: { id } }).then(setOrder);
  }, [id, user]);

  if (isPending || order === undefined) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted">Inapakia oda…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Ingia kwanza</h1>
        <Button asChild className="mt-6"><Link to="/login">Ingia / Fungua akaunti</Link></Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Oda haikupatikana</h1>
        <p className="mt-2 text-muted">Oda hii haipo kwenye akaunti yako au haijapatikana.</p>
        <Button asChild className="mt-6">
          <Link to="/orders">Oda zote</Link>
        </Button>
      </div>
    );
  }

  const slot = SLOTS.find((s) => s.id === order.customer.slot);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Oda imepokelewa</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">{order.id}</h1>
      <p className="mt-2 text-muted">
        {formatWhen(order.placedAt)}
      </p>

      <div className="mt-8 rounded-xl bg-primary px-5 py-4 text-primary-fg">
        <p className="text-sm opacity-80">Hali ya oda</p>
        <p className="font-display text-2xl tracking-tight">{statusLabel(order.status)}</p>
        <p className="mt-1 text-sm opacity-80">
          {order.fulfillment === "pickup"
            ? "Tutakujulisha oda yako ikiwa tayari kuchukuliwa."
            : "Muwasilishaji atakuletea oda kwa muda uliochagua. Malipo wakati wa kupokea."}
        </p>
      </div>

      <section className="mt-8 rounded-xl bg-surface p-5 shadow-border">
        <h2 className="font-display text-xl tracking-tight">
          {order.fulfillment === "pickup" ? "Kuchukua" : "Uwasilishaji"}
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Info label="Jina" value={order.customer.name} />
          <Info label="Simu" value={order.customer.phone} />
          {order.fulfillment === "delivery" ? (
            <>
              <Info label="Eneo" value={order.customer.area ?? "—"} />
              <Info label="Anwani" value={order.customer.address ?? "—"} />
              <Info label="Muda" value={slot ? `${slot.label} · ${slot.hint}` : "—"} />
            </>
          ) : (
            <Info label="Mahali pa kuchukua" value={PICKUP_ADDRESS} />
          )}
          <Info label="Malipo" value={order.payment === "mpesa" ? "M-Pesa wakati wa kupokea" : "Taslimu"} />
          {order.customer.notes ? <Info label="Maelekezo" value={order.customer.notes} /> : null}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-surface p-5 shadow-border">
        <h2 className="font-display text-xl tracking-tight">Imeandaliwa</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <img
                src={item.image}
                alt=""
                className="size-14 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted">
                  {item.qty} × {item.unit}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatTsh(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm">
          <span className="text-muted">Jumla ndogo</span>
          <span className="tabular-nums">{formatTsh(order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted">Uwasilishaji</span>
          <span className="tabular-nums">
            {order.deliveryFee === 0 ? "Bure" : formatTsh(order.deliveryFee)}
          </span>
        </div>
        <div className="mt-3 flex justify-between font-medium">
          <span>Jumla</span>
          <span className="tabular-nums">{formatTsh(order.total)}</span>
        </div>
      </section>

      <Button asChild variant="outline" className="mt-8">
        <Link to="/shop">Nunua tena</Link>
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
