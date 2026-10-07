import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CrateCollage, ProductCard } from "@/components/product-card";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getProduct, PRODUCTS } from "@/lib/catalog";
import { formatTsh } from "@/lib/money";
import { useSokoStore } from "@/lib/store";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = getProduct(id);
  const inCart = useSokoStore((s) => (product ? s.qtyOf(product.id) : 0));
  const add = useSokoStore((s) => s.add);
  const [draft, setDraft] = useState(1);

  useEffect(() => {
    setDraft(1);
  }, [id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Bidhaa hii haipatikani sokoni kwa sasa.</h1>
        <p className="mt-2 text-muted">Huenda imekwisha kuuzwa leo.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Rudi kwenye bidhaa</Link>
        </Button>
      </div>
    );
  }

  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, 4);
  const categoryLabel =
    CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category;

  function addNow() {
    add(product.id, draft);
    toast.success(`Added ${product.name}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-muted">
        <Link to="/shop" className="hover:text-fg">
          Soko
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" search={{ cat: product.category }} className="hover:text-fg">
          {categoryLabel}
        </Link>
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-surface-2">
          {product.collage ? (
            <div className="aspect-square">
              <CrateCollage ids={product.collage} alt={product.name} />
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.organic ? <Badge>Asili</Badge> : null}
            {product.compareAt ? <Badge variant="muted">Bei maalum</Badge> : null}
          </div>
          <p className="mt-4 text-xs font-medium tracking-[0.18em] text-muted uppercase">
            {product.origin}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{product.name}</h1>
          <p className="mt-1 text-muted">{product.kicker}</p>
          <div className="mt-6 flex items-baseline gap-3">
            <p className="font-display text-3xl tabular-nums">{formatTsh(product.price)}</p>
            <p className="text-muted">/ {product.unit}</p>
            {product.compareAt ? (
              <p className="text-subtle line-through tabular-nums">{formatTsh(product.compareAt)}</p>
            ) : null}
          </div>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-fg">{product.description}</p>

          {product.contents ? (
            <ul className="mt-6 space-y-1.5 text-sm">
              {product.contents.map((line) => (
                <li key={line} className="flex gap-2 text-muted">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantityStepper value={draft} min={1} onChange={setDraft} />
            <Button size="lg" onClick={addNow}>
              Ongeza kwenye kikapu
            </Button>
          </div>
          {inCart > 0 ? (
            <p className="mt-3 text-sm text-muted">
              {inCart} kwenye kikapu chako
            </p>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight">Bidhaa nyingine sokoni</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
