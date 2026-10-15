import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
        if (active) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="p-6 text-center">
        Inapakia maelezo ya bidhaa...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p role="alert" className="text-red-600">
          {error || "Bidhaa haijapatikana."}
        </p>

        <Link to="/shop" className="mt-4 inline-block underline">
          Rudi dukani
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link to="/shop" className="mb-5 inline-block underline">
        ← Rudi dukani
      </Link>

      <div className="space-y-6">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="max-h-[420px] w-full rounded-xl bg-muted/20 object-contain"
          />
        ) : (
          <div className="flex h-56 items-center justify-center rounded-xl bg-muted/20 text-muted">
            Picha ya bidhaa haipatikani
          </div>
        )}

        <section>
          <p className="text-sm text-muted">{product.kicker}</p>

          <h1 className="mt-1 text-2xl font-bold">
            {product.name}
          </h1>

          <p className="mt-3 text-xl font-semibold">
            {formatTsh(product.price)} / {product.unit}
          </p>

          <p className="mt-2 text-sm text-muted">
            Eneo: {product.origin}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            Maelezo ya bidhaa
          </h2>

          <p className="mt-2 whitespace-pre-wrap">
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

        <Button
          className="w-full"
          onClick={() => addToCart(product.id, 1, product.price)}
        >
          Weka kwenye kikapu
        </Button>
      </div>
    </main>
  );
}
