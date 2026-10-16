import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { getPublishedProducts } from "@/lib/products";
import type { Product } from "@/lib/catalog";
import { useSokoStore } from "@/lib/store";
import { formatTsh } from "@/lib/money";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  category: string;
  image_url: string | null;
  audio_url: string | null;
  origin: string | null;
};

function ProductDetail() {
  const { id } = Route.useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useSokoStore((state) => state.add);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const rows = (await getPublishedProducts()) as ProductRow[];
        const row = rows.find((item) => String(item.id) === String(id));

        if (!active) return;

        if (!row) {
          setProduct(null);
          setError("Bidhaa hii haijapatikana.");
          return;
        }

        const mappedProduct: Product = {
          id: row.id,
          name: row.name,
          kicker: row.category || "Bidhaa nyingine",
          description: row.description ?? "",
          category: (
            row.category?.trim() || "Bidhaa nyingine"
          ) as Product["category"],
          image: row.image_url ?? "",
          audio: row.audio_url,
          unit: row.unit,
          price: Number(row.price),
          origin: row.origin || "Haijatajwa",
        };

        setProduct(mappedProduct);
      } catch (err) {
        console.error("Imeshindwa kupakia bidhaa:", err);

        if (active) {
          setError("Imeshindikana kupakia bidhaa. Tafadhali jaribu tena.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-center">
        Inapakia maelezo ya bidhaa...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p role="alert" className="text-danger">
          {error || "Bidhaa haijapatikana."}
        </p>

        <Link to="/shop" className="mt-4 inline-block underline">
          Rudi dukani
        </Link>
      </main>
    );
  }

const currentProduct = product;
const total = currentProduct.price * qty;

function addProductToCart() {
  addToCart(currentProduct.id, qty, currentProduct.price);
  setAdded(true);  

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Link to="/shop" className="mb-6 inline-block underline">
        ← Rudi dukani
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="aspect-square w-full rounded-xl bg-muted/20 object-contain"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-muted/20 text-muted">
              Picha ya bidhaa haipatikani
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm text-muted">{product.kicker}</p>

            <h1 className="mt-1 text-3xl font-bold">
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-semibold">
              {formatTsh(product.price)}
              <span className="text-base font-normal text-muted">
                {" "}
                / {product.unit}
              </span>
            </p>

            <p className="mt-2 text-sm text-muted">
              Eneo: {product.origin}
            </p>
          </div>

          <section>
            <h2 className="text-lg font-semibold">
              Maelezo ya bidhaa
            </h2>

            <p className="mt-2 whitespace-pre-wrap leading-7 text-muted">
              {product.description || "Hakuna maelezo yaliyowekwa."}
            </p>
          </section>

          {product.audio ? (
            <section>
              <h2 className="mb-2 text-lg font-semibold">
                Tangazo la sauti la muuzaji
              </h2>

              <audio
                controls
                preload="none"
                src={product.audio}
                className="w-full"
              >
                Kifaa chako hakiwezi kucheza sauti hii.
              </audio>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Idadi</p>

                <div className="mt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Punguza idadi"
                    onClick={() =>
                      setQty((current) => Math.max(1, current - 1))
                    }
                  >
                    <Minus className="size-4" />
                  </Button>

                  <span className="min-w-8 text-center text-lg font-semibold">
                    {qty}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Ongeza idadi"
                    onClick={() =>
                      setQty((current) => current + 1)
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted">Jumla</p>

                <p className="mt-1 text-lg font-bold tabular-nums">
                  {formatTsh(total)}
                </p>
              </div>
            </div>

            <Button
              className="mt-5 w-full"
              onClick={addProductToCart}
            >
              <ShoppingCart className="size-4" />
              {added
                ? "Imeongezwa kwenye kikapu ✓"
                : "Weka kwenye kikapu"}
            </Button>

            {added ? (
              <Button
                asChild
                variant="outline"
                className="mt-3 w-full"
              >
                <Link to="/cart">Fungua kikapu</Link>
              </Button>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
