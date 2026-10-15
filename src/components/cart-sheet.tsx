import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { getPublishedProducts } from "@/lib/products";
import { useSokoStore } from "@/lib/store";
import { formatTsh } from "@/lib/money";

type CartProduct = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  unit: string;
};

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({
  open,
  onOpenChange,
}: CartSheetProps) {
  const lines = useSokoStore((state) => state.lines);
  const setQty = useSokoStore((state) => state.setQty);
  const remove = useSokoStore((state) => state.remove);

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const rows = await getPublishedProducts();

        if (cancelled) return;

        setProducts(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            image_url: row.image_url,
            price: Number(row.price),
            unit: row.unit,
          })),
        );
      } catch {
        if (!cancelled) {
          setError(
            "Imeshindikana kupakia bidhaa. Tafadhali jaribu tena.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const cartProducts = lines.map((line) => ({
    line,
    product: products.find(
      (product) => product.id === line.productId,
    ),
  }));

  const subtotal = cartProducts.reduce((total, item) => {
    if (!item.product) return total;

    return total + item.product.price * item.line.qty;
  }, 0);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Funga kikapu"
        className="absolute inset-0 size-full bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg text-fg shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h2 id="cart-title" className="text-lg font-semibold">
            Kikapu changu
          </h2>

          <button
            type="button"
            aria-label="Funga"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-surface"
          >
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="size-12 text-muted" />

            <p className="font-medium">
              Kikapu chako bado hakina bidhaa.
            </p>

            <p className="text-sm text-muted">
              Chagua bidhaa unazohitaji kutoka sokoni.
            </p>

            <Link
              to="/shop"
              onClick={() => onOpenChange(false)}
              className="rounded-md bg-primary px-5 py-3 text-primary-fg"
            >
              Endelea kununua
            </Link>
          </div>
        ) : loading ? (
          <p className="p-6 text-center text-muted">
            Inapakia bidhaa...
          </p>
        ) : error ? (
          <div className="space-y-4 p-6 text-center">
            <p role="alert">{error}</p>

            <button
              type="button"
              onClick={() => {
                setProducts([]);
                setError("");
                setLoading(true);

                void getPublishedProducts()
                  .then((rows) => {
                    setProducts(
                      rows.map((row) => ({
                        id: row.id,
                        name: row.name,
                        image_url: row.image_url,
                        price: Number(row.price),
                        unit: row.unit,
                      })),
                    );
                  })
                  .catch(() => {
                    setError(
                      "Imeshindikana kupakia bidhaa. Tafadhali jaribu tena.",
                    );
                  })
                  .finally(() => setLoading(false));
              }}
              className="rounded-md bg-primary px-4 py-2 text-primary-fg"
            >
              Jaribu tena
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {cartProducts.map(({ line, product }) => {
                if (!product) {
                  return (
                    <article
                      key={line.productId}
                      className="border-b border-border pb-4"
                    >
                      <p className="font-medium">
                        Bidhaa hii haipatikani kwa sasa.
                      </p>

                      <button
                        type="button"
                        onClick={() => remove(line.productId)}
                        className="mt-2 text-sm text-red-600"
                      >
                        Ondoa kwenye kikapu
                      </button>
                    </article>
                  );
                }

                return (
                  <article
                    key={line.productId}
                    className="flex gap-3 border-b border-border pb-4"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="size-20 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-md bg-muted/20">
                        <ShoppingBag className="size-7 text-muted" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">
                        {product.name}
                      </h3>

                      <p className="text-sm text-muted">
                        {formatTsh(product.price)} / {product.unit}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Punguza ${product.name}`}
                          onClick={() =>
                            setQty(line.productId, line.qty - 1)
                          }
                          className="rounded border border-border p-1"
                        >
                          <Minus className="size-4" />
                        </button>

                        <span>{line.qty}</span>

                        <button
                          type="button"
                          aria-label={`Ongeza ${product.name}`}
                          onClick={() =>
                            setQty(line.productId, line.qty + 1)
                          }
                          className="rounded border border-border p-1"
                        >
                          <Plus className="size-4" />
                        </button>

                        <button
                          type="button"
                          aria-label={`Ondoa ${product.name}`}
                          onClick={() => remove(line.productId)}
                          className="ml-auto rounded p-1 text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatTsh(product.price * line.qty)}
                    </p>
                  </article>
                );
              })}
            </div>

            <footer className="space-y-4
