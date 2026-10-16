import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock, Leaf } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { getPublishedProducts } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const rows = await getPublishedProducts();

        const mapped: Product[] = rows.map((row) => ({
          id: String(row.id),
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
        }));

        if (active) {
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Imeshindikana kupakia bidhaa:", err);

        if (active) {
          setError("Bidhaa hazijapakiwa. Tafadhali jaribu tena baadaye.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const featured = products.slice(0, 8);

  const crates = products
    .filter((product) => {
      const category = product.category.toLowerCase();
      const name = product.name.toLowerCase();

      return (
        category.includes("kifurushi") ||
        category.includes("vifurushi") ||
        category.includes("crate") ||
        name.includes("kifurushi") ||
        name.includes("vifurushi")
      );
    })
    .slice(0, 3);

  return (
    <div>
      <section className="relative isolate min-h-[28rem] overflow-hidden sm:min-h-[32rem]">
        <img
          src="/images/hero.jpg"
          alt="Mazao safi ya sokoni Tanzania"
          className="absolute inset-0 size-full object-cover"
        />

        <div className="absolute inset-0 bg-fg/55" />

        <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col justify-end gap-5 px-4 py-12 sm:min-h-[32rem] sm:py-16">
          <p className="text-xs font-medium tracking-[0.2em] text-primary-fg/80 uppercase">
            Tanzania · bidhaa safi kila siku
          </p>

          <h1 className="max-w-xl font-display text-4xl leading-none tracking-tight text-primary-fg sm:text-6xl">
            Soko lako la Tanzania, likufikie kwa urahisi.
          </h1>

          <p className="max-w-md text-base text-primary-fg/85 sm:text-lg">
            Mboga, matunda na mazao ya Tanzania — kutoka sokoni hadi mlangoni kwako.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">
                Nunua bidhaa
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-fg/30 bg-fg/20 text-primary-fg hover:bg-fg/35"
            >
              <Link to="/shop" search={{ cat: "crates" }}>
                Vifurushi vya asubuhi
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-3 sm:grid-cols-3">
          <Fact
            icon={Leaf}
            title="Huchaguliwa asubuhi"
            body="Mboga na matunda safi kutoka maeneo mbalimbali ya Tanzania huandaliwa kila siku."
          />

          <Fact
            icon={Clock}
            title="Uwasilishaji wa siku hiyo"
            body="Weka oda mapema na tunakuletea kulingana na eneo lako."
          />

          <Fact
            icon={Bike}
            title="Soko la Mwanza"
            body="Wateja wanaweza kuchagua kuchukua bidhaa wenyewe sokoni."
          />
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
              Leo
            </p>

            <h2 className="font-display text-3xl tracking-tight">
              Kutoka sokoni
            </h2>
          </div>

          <Button asChild variant="ghost">
            <Link to="/shop">
              Tazama zote
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="mt-6 text-muted">Inapakia bidhaa...</p>
        ) : error ? (
          <p role="alert" className="mt-6 text-danger">
            {error}
          </p>
        ) : featured.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-surface p-6 text-center">
            <p>Hakuna bidhaa zilizochapishwa kwa sasa.</p>

            <Button asChild className="mt-4">
              <Link to="/shop">Fungua duka</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-fg sm:px-10">
          <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-80">
            Vifurushi vya wiki
          </p>

          <h2 className="mt-2 max-w-lg font-display text-3xl tracking-tight sm:text-4xl">
            Vifurushi vyako, safari moja pungufu ya kwenda sokoni.
          </h2>

          <p className="mt-3 max-w-lg text-primary-fg/80">
            Angalia bidhaa zinazopatikana na uchague unazohitaji.
          </p>

          {crates.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {crates.map((crate) => (
                <Link
                  key={crate.id}
                  to="/product/$id"
                  params={{ id: crate.id }}
                  className="rounded-xl bg-primary-hover p-5 transition-transform duration-150 motion-safe:hover:-translate-y-0.5"
                >
                  <p className="text-sm opacity-80">{crate.kicker}</p>

                  <p className="mt-1 font-display text-2xl tracking-tight">
                    {crate.name}
                  </p>

                  <p className="mt-3 text-sm">
                    {crate.price.toLocaleString("sw-TZ")} TSh / {crate.unit}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-primary-fg/80">
              Vifurushi vitaonekana vitakapowekwa na wauzaji.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="font-display text-3xl tracking-tight">
          Nunua kwa kundi
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ cat: category.id }}
              className="rounded-xl bg-surface p-5 shadow-border hover:shadow-lift"
            >
              <p className="font-display text-xl tracking-tight">
                {category.label}
              </p>

              <p className="mt-1 text-sm text-muted">
                {category.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Fact({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Leaf;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl bg-surface p-5 shadow-border">
      <Icon className="size-5 text-primary" />

      <p className="mt-3 font-medium">{title}</p>

      <p className="mt-1 text-sm text-muted">{body}</p>
    </li>
  );
}
