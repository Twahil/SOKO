import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatTsh } from "@/lib/money";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
return (
<article className="overflow-hidden rounded-xl bg-surface shadow-border transition-shadow hover:shadow-lift">
<Link
to="/product/$id"
params={{ id: product.id }}
className="block"
>
<div className="relative aspect-square overflow-hidden bg-muted/20">
<img
src={product.image}
alt={product.name}
loading="lazy"
className="size-full object-cover transition-transform duration-200 hover:scale-105"
/>

      {product.compareAt && product.compareAt > product.price ? (
        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-fg">
          Ofa
        </span>
      ) : null}

      {product.organic ? (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-surface/95 px-2 py-1 text-xs">
          <Leaf className="size-3" />
          Safi
        </span>
      ) : null}
    </div>
  </Link>

  <div className="space-y-3 p-3 sm:p-4">
    <div>
      <p className="text-xs text-muted">{product.kicker}</p>

      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="mt-1 block font-medium leading-snug hover:underline"
      >
        {product.name}
      </Link>

      <p className="mt-1 text-xs text-muted">
        {product.origin} · {product.unit}
      </p>
    </div>

    <div>
      <p className="font-semibold tabular-nums">
        {formatTsh(product.price)}
      </p>

      {product.compareAt && product.compareAt > product.price ? (
        <p className="text-xs text-muted line-through">
          {formatTsh(product.compareAt)}
        </p>
      ) : null}
    </div>

    <Button asChild size="sm" className="w-full">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
      >
        Angalia bidhaa
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  </div>
</article>

);
}
