import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { getPublishedProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

type SokoSearch = {
  q?: string;
  cat?: string;
};

type CategoryOption = {
  id: string;
  label: string;
};

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
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(q ?? "");
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const rows = (await getPublishedProducts()) as ProductRow[];

        if (cancelled) return;

        const mapped: Product[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
          kicker: row.category || "Bidhaa nyingine",
          description: row.description ?? "",
          // Tunahifadhi kundi halisi kutoka Supabase.
          // Hatulazimishi kila bidhaa kuwa "leafy".
          category: (
            row.category?.trim() || "Bidhaa nyingine"
          ) as Product["category"],
          image: row.image_url ?? "",
          audio: row.audio_url,
          unit: row.unit,
          price: Number(row.price),
          origin: row.origin ?? "Tanzania",
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Imeshindwa kupakia bidhaa:", err);

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
  }, []);

  // Makundi yanayotumika kwenye ukurasa na makundi halisi
  // yaliyotumwa na wauzaji kutoka Supabase.
  const categories: CategoryOption[] = [
    ...CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
    })),
    ...Array.from(
      new Map(
        items
          .map((item) => {
            const value = String(item.category).trim();

            return [
              value.toLowerCase(),
              {
                id: value,
                label: value,
              },
            ] as const;
          })
          .filter(([key]) => key.length > 0),
      ).values(),
    ).filter(
      (category) =>
        !CATEGORIES.some(
          (existing) => existing.id === category.id,
        ),
    ),
  ];

  const filteredItems = items.filter((item) => {
    const itemCategory = String(item.category).toLowerCase();
    const selectedCategory = cat?.toLowerCase();

    const matchesCategory =
      !selectedCategory || itemCategory === selectedCategory;

    const query = q?.trim().toLowerCase();

    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      String(item.category).toLowerCase().includes(query) ||
      item.origin.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  const active = cat ?? "all";

  const selectedCategory = categories.find(
    (category) => category.id === cat,
  );

  const label =
    selectedCategory?.label ??
    (q ? `Matokeo ya "${q}"` : "Soko la leo");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void navigate({
      search: (previous) => ({
        ...previous,
        q: draft.trim() || undefined,
      }),
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
        Soko
      </p>

      <h1 className="mt-1 font-display text-4xl tracking-tight">
        {label}
      </h1>

      <p className="mt-2 max-w-xl text-muted">
        Matunda, mboga na bidhaa mbalimbali kutoka Tanzania.
        Bei zote ni kwa Shilingi ya Tanzania (TSh).
      </p>

      <form
        onSubmit={onSearch}
        className="relative mt-6 max-w-xl"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />

        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tafuta bidhaa, mfano nyanya..."
          className="pl-9"
          aria-label="Tafuta bidhaa sokoni"
        />
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <FilterChip
          active={active === "all"}
          onClick={() =>
            void navigate({
              search: {
                q,
                cat: undefined,
              },
            })
          }
        >
          Bidhaa zote
        </FilterChip>

        {categories.map((category) => (
          <FilterChip
            key={category.id}
            active={active === category.id}
            onClick={() =>
              void navigate({
                search: {
                  q,
                  cat: category.id,
                },
              })
            }
          >
            {category.label}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <p className="mt-16 text-center text-muted">
          Inapakia bidhaa...
        </p>
      ) : error ? (
        <div className="mt-16 text-center">
          <p className="text-muted">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-fg"
          >
            Jaribu tena
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Hakuna bidhaa zinazolingana na utafutaji wako.
          Jaribu jina lingine au chagua kundi tofauti.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
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
        active
          ? "bg-primary text-primary-fg"
          : "border border-border bg-surface text-fg",
      )}
    >
      {children}
    </button>
  );
}
