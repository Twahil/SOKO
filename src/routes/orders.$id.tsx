import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getOrder, type StoredOrder } from "@/lib/orders";
import { formatTsh, formatWhen } from "@/lib/money";
import { statusLabel } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const result = await getOrder({
          data: { id },
        });

        if (active) {
          setOrder(result);
        }
      } catch (err) {
        console.error("Imeshindwa kupakia oda:", err);

        if (active) {
          setError("Imeshindikana kupakia oda. Tafadhali jaribu tena.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-center">
        Inapakia maelezo ya oda...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p role="alert" className="text-danger">
          {error || "Oda haijapatikana."}
        </p>

        <Button asChild className="mt-4">
          <Link to="/orders">Rudi kwenye oda zangu</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link to="/orders" className="text-sm underline">
        ← Rudi kwenye oda zangu
      </Link>

      <section className="rounded-xl bg-surface p-5 shadow-border">
        <p className="text-sm text-muted">Namba ya oda</p>

        <h1 className="mt-1 break-all font-display text-2xl">
          {order.id}
        </h1>

        <p className="mt-2 text-sm text-muted">
          Tarehe: {formatWhen(order.placedAt)}
        </p>

        <p className="mt-3 font-medium">
          Hali ya oda: {statusLabel(order.status)}
        </p>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-border">
        <h2 className="text-lg font-semibold">Bidhaa zilizoagizwa</h2>

        <ul className="mt-4 space-y-4">
          {order.items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>

                <p className="mt-1 text-sm text-muted">
                  {item.qty} × {item.unit}
                </p>

                <p className="mt-1 text-sm">
                  Bei: {formatTsh(item.price)}
                </p>
              </div>

              <p className="shrink-0 font-medium">
                {formatTsh(item.price * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted">Jumla ya bidhaa</span>
            <span>{formatTsh(order.subtotal)}</span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted">Usafirishaji</span>
            <span>
              {order.deliveryFee === 0
                ? "Bure"
                : formatTsh(order.deliveryFee)}
            </span>
          </div>

          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
            <span>Jumla ya kulipa</span>
            <span>{formatTsh(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-border">
        <h2 className="text-lg font-semibold">Taarifa za mteja</h2>

        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="text-muted">Jina: </span>
            {order.customer.name}
          </p>

          <p>
            <span className="text-muted">Simu: </span>
            {order.customer.phone}
          </p>

          <p>
            <span className="text-muted">Njia ya kupokea: </span>
            {order.fulfillment === "delivery"
              ? "Uwasilishaji"
              : "Kuchukua mwenyewe"}
          </p>

          {order.customer.area && (
            <p>
              <span className="text-muted">Eneo: </span>
              {order.customer.area}
            </p>
          )}

          {order.customer.address && (
            <p>
              <span className="text-muted">Anwani: </span>
              {order.customer.address}
            </p>
          )}

          {order.customer.slot && (
            <p>
              <span className="text-muted">Muda: </span>
              {order.customer.slot}
            </p>
          )}

          <p>
            <span className="text-muted">Malipo: </span>
            {order.payment === "mpesa" ? "M-Pesa" : "Taslimu"}
          </p>

          {order.customer.notes && (
            <p>
              <span className="text-muted">Maelekezo: </span>
              {order.customer.notes}
            </p>
          )}
        </div>
      </section>

      <Button asChild className="w-full">
        <Link to="/shop">Endelea kununua</Link>
      </Button>
    </main>
  );
}
