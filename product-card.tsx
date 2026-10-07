import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatTsh } from "@/lib/money";
import { useSokoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";
import { Badge } from "./ui/badge";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const qty = useSokoStore((s) => s.qtyOf(product.id));
  const add = useSokoStore((s) => s.add);
  const setQty = useSokoStore((s) => s.setQty);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl bg-surface shadow-border",
        className,
      )}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        {product.collage ? (
          <CrateCollage ids={product.collage} alt={product.name} />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.compareAt ? (
            <Badge variant="deal">Bei maalum</Badge>
          ) : null}
          {product.organic ? <Badge>Asili</Badge> : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {product.origin}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug tracking-tight">
            <Link to="/product/$id" params={{ id: product.id }} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted">{product.kicker}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-medium tabular-nums">
              {formatTsh(product.price)}
              <span className="ml-1 text-sm font-normal text-muted">/ {product.unit}</span>
            </p>
            {product.compareAt ? (
              <p className="text-sm text-subtle line-through tabular-nums">
                {formatTsh(product.compareAt)}
              </p>
            ) : null}
          </div>
          {qty > 0 ? (
            <QuantityStepper size="sm" value={qty} onChange={(n) => setQty(product.id, n)} />
          ) : (
            <button
              type="button"
              onClick={() => add(product.id, 1)}
              className="inline-flex size-11 items-center justify-center rounded-md bg-primary text-primary-fg hover:bg-primary-hover motion-safe:active:scale-[0.96]"
              aria-label={`Ongeza ${product.name} kwenye kikapu`}
            >
              <Plus className="size-5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function CrateCollage({ ids, alt }: { ids: string[]; alt: string }) {
  return (
    <div className="grid size-full grid-cols-2" aria-label={alt}>
      {ids.slice(0, 4).map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src.startsWith("/") ? src : `/products/${src}.jpg`}
          alt=""
          className="size-full object-cover"
        />
      ))}
    </div>
  );
}
