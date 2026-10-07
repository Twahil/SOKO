import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock, Leaf } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { formatTsh } from "@/lib/money";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featured = PRODUCTS.filter((p) => p.featured && p.category !== "crates");
  const crates = PRODUCTS.filter((p) => p.category === "crates");

  return (
    <div>
      <section className="relative isolate min-h-[28rem] overflow-hidden sm:min-h-[32rem]">
        <img
          src="/images/hero.jpg"
          alt="Morning produce stall with crates of mangoes, tomatoes, and greens"
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
                Nunua vifurushi vya leo
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
            body="Weka oda mapema na tunakuletea siku hiyo hiyo kulingana na eneo lako."
          />
          <Fact
            icon={Bike}
            title="Soko la Mwanza"
            body="Ungependa kuchukua mwenyewe? Kuchukua sokoni ni bure."
          />
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Leo</p>
            <h2 className="font-display text-3xl tracking-tight">Kutoka sokoni</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/shop">
              Tazama zote
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-fg sm:px-10">
          <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-80">
            Kifurushi cha wiki
          </p>
          <h2 className="mt-2 max-w-lg font-display text-3xl tracking-tight sm:text-4xl">
            Vifurushi vitatu. Safari moja pungufu ya kwenda sokoni.
          </h2>
          <p className="mt-3 max-w-lg text-primary-fg/80">
            Tunapakia bidhaa kwa uangalifu. Acha maelekezo wakati wa kuagiza kama ungependa kubadilisha bidhaa.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {crates.map((crate) => (
              <Link
                key={crate.id}
                to="/product/$id"
                params={{ id: crate.id }}
                className="rounded-xl bg-primary-hover p-5 transition-transform duration-150 motion-safe:hover:-translate-y-0.5"
              >
                <p className="text-sm opacity-80">{crate.kicker}</p>
                <p className="mt-1 font-display text-2xl tracking-tight">{crate.name}</p>
                <p className="mt-3 text-sm tabular-nums">
                  {formatTsh(crate.price)}
                  {crate.compareAt ? (
                    <span className="ml-2 opacity-60 line-through">{formatTsh(crate.compareAt)}</span>
                  ) : null}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="font-display text-3xl tracking-tight">Nunua kwa kifurushi</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ cat: c.id }}
              className="rounded-xl bg-surface p-5 shadow-border hover:shadow-lift"
            >
              <p className="font-display text-xl tracking-tight">{c.label}</p>
              <p className="mt-1 text-sm text-muted">{c.blurb}</p>
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
