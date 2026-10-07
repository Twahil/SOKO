import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getProduct, AREAS, SLOTS } from "@/lib/catalog";
import { deliveryFeeFor, formatTsh, PICKUP_ADDRESS } from "@/lib/money";
import { useSokoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createOrder } from "@/lib/orders.server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useSokoStore((s) => s.lines);
  const clear = useSokoStore((s) => s.clear);
  const { user, isPending } = useCurrentUserState();
  const subtotal = useSokoStore((s) => s.subtotal());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [area, setArea] = useState<(typeof AREAS)[number]>("Ilemela");
  const [address, setAddress] = useState("");
  const [slot, setSlot] = useState("afternoon");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"mpesa" | "cash">("mpesa");
  const [error, setError] = useState<string | null>(null);

  const fee = deliveryFeeFor(subtotal, fulfillment);
  const total = subtotal + fee;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Kikapu chako hakina bidhaa.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Jina na namba ya simu vinahitajika.");
      return;
    }
    if (fulfillment === "delivery" && !address.trim()) {
      setError("Weka anwani ya uwasilishaji.");
      return;
    }
    if (!user) {
      setError("Ingia kwenye akaunti yako kwanza ili kuhifadhi oda yako.");
      return;
    }
    try {
      const order = await createOrder({
        data: {
          lines,
          fulfillment,
          payment,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            area: fulfillment === "delivery" ? area : undefined,
            address: fulfillment === "delivery" ? address.trim() : PICKUP_ADDRESS,
            slot: fulfillment === "delivery" ? slot : undefined,
            notes: notes.trim() || undefined,
          },
        },
      });
      clear();
      void navigate({ to: "/orders/$id", params: { id: order.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Oda haikuweza kuhifadhiwa. Jaribu tena.");
    }
  }

  if (isPending) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted">Inapakia…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Ingia kwanza</h1>
        <p className="mt-2 text-muted">Oda zako zitahifadhiwa kwenye akaunti yako ya SOKO.</p>
        <Button asChild className="mt-6"><Link to="/login">Ingia / Fungua akaunti</Link></Button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Hakuna cha kuagiza</h1>
        <p className="mt-2 text-muted">Ongeza bidhaa kwenye kikapu kwanza, kisha urudi hapa.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Angalia bidhaa</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Kamilisha oda</p>
          <h1 className="mt-1 font-display text-4xl tracking-tight">Oda ipelekwe wapi?</h1>
        </div>

        {error ? (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Jina</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Simu</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="07xx xxx xxx"
              autoComplete="tel"
              required
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Njia ya kupokea</legend>
          <div className="grid grid-cols-2 gap-3">
            <Choice
              active={fulfillment === "delivery"}
              title="Uwasilishaji"
              hint="Siku hiyo hiyo ndani ya Tanzania"
              onClick={() => setFulfillment("delivery")}
            />
            <Choice
              active={fulfillment === "pickup"}
              title="Kuchukua"
              hint="Bure · Soko la Mwanza"
              onClick={() => setFulfillment("pickup")}
            />
          </div>
        </fieldset>

        {fulfillment === "delivery" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">Eneo</Label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value as (typeof AREAS)[number])}
                className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-fg shadow-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Mtaa na jengo</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Namba ya nyumba, jengo au geti"
                required={fulfillment === "delivery"}
              />
            </div>
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Muda wa uwasilishaji</legend>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlot(s.id)}
                    className={cn(
                      "rounded-md border px-2 py-3 text-center",
                      slot === s.id
                        ? "border-primary bg-primary text-primary-fg"
                        : "border-border bg-surface",
                    )}
                  >
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="mt-0.5 block text-xs opacity-80">{s.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        ) : (
          <p className="rounded-md bg-surface-2 px-4 py-3 text-sm text-muted">
            Chukua kutoka {PICKUP_ADDRESS}. Tayari kuanzia saa 10:00 siku hiyo hiyo.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Maelekezo ya oda</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Mfano: chagua maembe yaliyoiva, usiweke vitunguu…"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-fg shadow-border placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          />
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Malipo wakati wa kupokea</legend>
          <div className="grid grid-cols-2 gap-3">
            <Choice
              active={payment === "mpesa"}
              title="M-Pesa"
              hint="Till shown on delivery"
              onClick={() => setPayment("mpesa")}
            />
            <Choice
              active={payment === "cash"}
              title="Taslimu"
              hint="Exact notes help"
              onClick={() => setPayment("cash")}
            />
          </div>
        </fieldset>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Weka oda · {formatTsh(total)}
        </Button>
      </form>

      <aside className="h-fit rounded-xl bg-surface p-5 shadow-border">
        <h2 className="font-display text-xl tracking-tight">Kikapu chako</h2>
        <ul className="mt-4 space-y-3">
          {lines.map((line) => {
            const p = getProduct(line.productId);
            if (!p) return null;
            return (
              <li key={line.productId} className="flex justify-between gap-3 text-sm">
                <span>
                  {p.name}
                  <span className="text-muted"> × {line.qty}</span>
                </span>
                <span className="tabular-nums">{formatTsh(p.price * line.qty)}</span>
              </li>
            );
          })}
        </ul>
        <Separator className="my-4" />
        <Row label="Jumla ndogo" value={formatTsh(subtotal)} />
        <Row label="Delivery" value={fee === 0 ? "Bure" : formatTsh(fee)} />
        <div className="mt-3 flex justify-between font-medium">
          <span>Jumla</span>
          <span className="tabular-nums">{formatTsh(total)}</span>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Choice({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-3 text-left",
        active ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface",
      )}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs opacity-80">{hint}</span>
    </button>
  );
}
