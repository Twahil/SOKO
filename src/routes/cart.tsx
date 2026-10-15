import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getPublishedProducts } from "@/lib/products";
import { formatTsh } from "@/lib/money";
import { useSokoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

type CartProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
};

function CartPage() {
  const lines = useSokoStore((state) => state.lines);
  const setQty = useSokoStore((state) => state.setQty);
  const remove = useSokoStore((state) => state.remove);

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const rows = await getPublishedProducts();

        if (cancelled) return;

        setProducts(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            unit: row.unit,
            image_url: row.image_url,
          })),
        );
      } catch {
        if (!cancelled) {
          setError("Imeshindikana kupakia bidhaa. Jaribu tena.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = lines.map((line) => ({
    line,
    product: products.find((product) => product.id === line.productId),
  }));

  const subtotal = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price * item.line.qty;
  }, 0);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        Inapakia kikapu chako...
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-danger">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Jaribu tena
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          SOKO · Manunuzi yako
        </p>
        <h1 className="mt-2 font-display text-4xl">Kikapu chako</h1>
        <p className="mt-2 text-muted">
          Kagua bidhaa na idadi kabla ya kuweka oda.
        </p>
      </div>

      {lines.length === 0 ? (
        <section className="rounded-xl bg-surface p-8 text-center shadow-border">
          <ShoppingBag className="mx-auto size-12 text-muted" />
          <h2 className="mt-4 text-xl font-semibold">
            Kikapu chako kiko tupu
          </h2>
          <p className="mt-2 text-muted">
            Chagua bidhaa unazohitaji kutoka sokoni.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Angalia bidhaa</Link>
          </Button>
        </section>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_18rem]">
          <section className="space-y-4">
            {items.map(({ line, product }) => (
              <article
                key={line.productId}
                className="flex gap-4 rounded-xl bg-surface p-4 shadow-border"
              >
                <div className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                  {product?.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted">
                      Hakuna picha
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-medium">
                    {product?.name ?? "Bidhaa haipatikani"}
                  </h2>

                  {product ? (
                    <p className="mt-1 text-sm text-muted">
                      {formatTsh(product.price)} / {product.unit}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-danger">
                      Bidhaa hii haipatikani tena.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Punguza idadi"
                      onClick={() =>
                        setQty(line.productId, line.qty - 1)
                      }
                    >
                      <Minus className="size-4" />
                    </Button>

                    <span className="min-w-8 text-center font-medium">
                      {line.qty}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Ongeza idadi"
                      onClick={() =>
                        setQty(line.productId, line.qty + 1)
                      }
                    >
                      <Plus className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-danger"
                      onClick={() => remove(line.productId)}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Ondoa
                    </Button>
                  </div>
                </div>

                <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
                  {product
                    ? formatTsh(product.price * line.qty)
                    : "—"}
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-xl">Muhtasari wa kikapu</h2>

            <div className="mt-4 flex justify-between gap-3">
              <span className="text-sm text-muted">Bidhaa zote</span>
              <span>{lines.reduce((sum, line) => sum + line.qty, 0)}</span>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between gap-3 font-semibold">
              <span>Jumla ya bidhaa</span>
              <span className="tabular-nums">{formatTsh(subtotal)}</span>
            </div>

            <p className="mt-3 text-xs text-muted">
              Gharama ya usafirishaji itaonyeshwa wakati wa checkout.
            </p>

            {items.some((item) => !item.product) ? (
              <p className="mt-3 text-sm text-danger">
                Ondoa bidhaa zisizopatikana kabla ya kuendelea.
              </p>
            ) : null}

            <Button
              asChild
              className="mt-5 w-full"
              disabled={items.some((item) => !item.product)}
            >
              <Link to="/checkout">Endelea kuweka oda</Link>
            </Button>

            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/shop">Endelea kununua</Link>
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}
