import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublishedProducts } from "@/lib/products";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { useSokoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/product/$id")({
component: ProductDetail,
});

type ProductRow = {
id: string;
name: string;
description: string;
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

const addToCart = useSokoStore((state) => state.add);

useEffect(() => {
let active = true;

async function loadProduct() {
  try {
    setLoading(true);
    setError("");

    const rows = (await getPublishedProducts()) as ProductRow[];
    const row = rows.find((item) => String(item.id) === String(id));

    if (!row) {
      if (active) setError("Bidhaa hii haijapatikana.");
      return;
    }

    const mappedProduct: Product = {
      id: row.id,
      name: row.name,
      kicker: row.category,
      description: row.description,
      category: CATEGORIES.some((item) => item.id === row.category)
        ? (row.category as Product["category"])
        : CATEGORIES[0].id,
      image: row.image_url || "",
      audio: row.audio_url,
      unit: row.unit,
      price: Number(row.price),
      origin: row.origin || "Haijatajwa",
    };

    if (active) setProduct(mappedProduct);
  } catch {
    if (active) setError("Imeshindikana kupakia bidhaa. Jaribu tena.");
  } finally {
    if (active) setLoading(false);
  }
}

loadProduct();

return () => {
  active = false;
};

}, [id]);

if (loading) {
return <main className="p-6">Inapakia maelezo ya bidhaa...</main>;
}

if (error || !product) {
return (
<main className="p-6">
<p className="text-red-600">{error || "Bidhaa haijapatikana."}</p>
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

  <div className="space-y-5">
    {product.image ? (
      <img
        src={product.image}
        alt={product.name}
        className="max-h-[420px] w-full rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-56 items-center justify-center rounded-xl bg-gray-100">
        Picha haipo
      </div>
    )}

    <div>
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="mt-2 text-xl font-semibold">
        TSh {product.price.toLocaleString("en-TZ")} / {product.unit}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Eneo: {product.origin}
      </p>
    </div>

    <section>
      <h2 className="text-lg font-semibold">Maelezo ya bidhaa</h2>
      <p className="mt-2 whitespace-pre-wrap">{product.description}</p>
    </section>

    {product.audio && (
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
    )}

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
