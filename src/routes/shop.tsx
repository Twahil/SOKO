import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, productsIn } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type SokoSearch = { q?: string; cat?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): SokoSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  component: SokoPage,
});

function SokoPage() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [draft, setDraft] = useState(q ?? "");
  const items = productsIn(cat, q);
  const active = cat ?? "all";
  const label =
    CATEGORIES.find((c) => c.id === cat)?.label ?? (q ? `Results for “${q}”` : "Soko la leo");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void navigate({ search: (prev) => ({ ...prev, q: draft.trim() || undefined }) });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Soko</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">{label}</h1>
      <p className="mt-2 max-w-xl text-muted">
        Matunda, mboga na vifurushi vya mazao kutoka Tanzania. Bei zote ni kwa Shilingi ya Tanzania (TSh).
      </p>

      <form onSubmit={onSearch} className="relative mt-6 md:hidden">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tafuta bidhaa…"
          className="pl-9"
          aria-label="Tafuta sokoni"
        />
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={active === "all"}
          onClick={() => void navigate({ search: { q, cat: undefined } })}
        >
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={active === c.id}
            onClick={() => void navigate({ search: { q, cat: c.id } })}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Hakuna bidhaa inayolingana na utafutaji huo. Jaribu nyanya, mboga au vifurushi.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-2 text-sm",
        active ? "bg-primary text-primary-fg" : "border border-border bg-surface text-fg",
      )}
    >
      {children}
    </button>
  );
}
