import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Leaf, Search, ShoppingBag, Store, ClipboardList } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { useSokoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CartSheet } from "./cart-sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SiteShell({ children }: { children: ReactNode }) {
const [cartOpen, setCartOpen] = useState(false);
const [ready, setReady] = useState(false);
const pathname = useRouterState({ select: (s) => s.location.pathname });

useEffect(() => {
void useSokoStore.persist.rehydrate();
setReady(true);
}, []);

const count = useSokoStore((s) => s.count());

return (
<div className="flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg">
<PromoStrip />
<Header
cartCount={ready ? count : 0}
onOpenCart={() => setCartOpen(true)}
pathname={pathname}
/>
<main className="flex-1 pb-24 md:pb-0">{children}</main>
<Footer />
<MobileNav
pathname={pathname}
cartCount={ready ? count : 0}
onOpenCart={() => setCartOpen(true)}
/>
<CartSheet open={cartOpen} onOpenChange={setCartOpen} />
</div>
);
}

function PromoStrip() {
return (
<p className="bg-primary px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-fg sm:text-sm">
Uwasilishaji siku hiyo hiyo · Bure kwa oda zaidi ya TSh 30,000 · Imeandaliwa Tanzania
</p>
);
}

function Header({
cartCount,
onOpenCart,
pathname,
}: {
cartCount: number;
onOpenCart: () => void;
pathname: string;
}) {
const navigate = useNavigate();
const [q, setQ] = useState("");

function onSearch(e: FormEvent) {
e.preventDefault();
void navigate({ to: "/shop", search: { q: q.trim() || undefined, cat: undefined } });
}

return (
<header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-sm">
<div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
<Link to="/" className="flex items-center gap-2 shrink-0">
<span className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-fg">
<Leaf className="size-5" />
</span>
<span className="leading-none">
<span className="font-display text-xl tracking-tight">SOKO</span>
<span className="mt-0.5 hidden text-[10px] tracking-[0.18em] text-muted uppercase sm:block">
Soko la Tanzania
</span>
</span>
</Link>

<form onSubmit={onSearch} className="relative hidden min-w-0 flex-1 md:block">    
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />    
      <Input    
        value={q}    
        onChange={(e) => setQ(e.target.value)}    
        placeholder="Tafuta nyanya, mboga, matunda…"    
        className="pl-9"    
        aria-label="Tafuta sokoni"    
      />    
    </form>    

    <nav className="ml-auto flex items-center gap-1">    
      <Button variant="ghost" asChild className="hidden sm:inline-flex">    
        <Link to="/shop">Soko</Link>    
      </Button>    
      <Button variant="ghost" asChild className="hidden sm:inline-flex">    
        <Link to="/orders">Oda</Link>    
      </Button>    
      <Button    
        variant="outline"    
        size="icon"    
        onClick={onOpenCart}    
        aria-label="Fungua kikapu"    
        className="relative"    
      >    
        <ShoppingBag className="size-5" />    
        {cartCount > 0 ? (    
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-fg tabular-nums">    
            {cartCount}    
          </span>    
        ) : null}    
      </Button>    
    </nav>    
  </div>    
  {pathname === "/" ? (    
    <div className="border-t border-border">    
      <div className="mx-auto flex w-full max-w-6xl min-w-0 gap-2 overflow-x-auto px-4 py-2">    
        <CategoryChip to="/shop" search={{ cat: undefined }} label="Zote" />    
        {CATEGORIES.map((c) => (    
          <CategoryChip    
            key={c.id}    
            to="/shop"    
            search={{ cat: c.id }}    
            label={c.label}    
          />    
        ))}    
      </div>    
    </div>    
  ) : null}    
</header>

);
}

function CategoryChip({
to,
search,
label,
}: {
to: "/shop";
search: { cat?: string; q?: string };
label: string;
}) {
return (
<Link    
to={to}    
search={search}    
className="shrink-0 rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-fg hover:bg-surface-2"    
>
{label}
</Link>
);
}

function Footer() {
return (
<footer className="mt-16 hidden border-t border-border bg-surface md:block">
<div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
<div>
<p className="font-display text-2xl tracking-tight">SOKO</p>
<p className="mt-2 max-w-xs text-sm text-muted">
Soko la mazao ya Tanzania, lenye bidhaa safi na huduma ya uwasilishaji.
</p>
</div>
<div>
<p className="text-xs font-medium tracking-wide text-muted uppercase">Muda wa kazi</p>
<p className="mt-2 text-sm">Tunafungua kila siku, 06:30 – 19:00</p>
<p className="text-sm text-muted">Oda za mapema hutumwa siku hiyo hiyo.</p>
</div>
<div>
<p className="text-xs font-medium tracking-wide text-muted uppercase">Kuchukua</p>
<p className="mt-2 text-sm">Soko la Mwanza</p>
<p className="text-sm text-muted">Tanzania · Lipa kwa M-Pesa au taslimu</p>
</div>
</div>
</footer>
);
}

function MobileNav({
pathname,
cartCount,
onOpenCart,
}: {
pathname: string;
cartCount: number;
onOpenCart: () => void;
}) {
const items = [
{ href: "/", label: "Nyumbani", icon: House, match: (p: string) => p === "/" },
{ href: "/shop", label: "Shop", icon: Store, match: (p: string) => p.startsWith("/shop") || p.startsWith("/product") },
{ href: "/orders", label: "Oda", icon: ClipboardList, match: (p: string) => p.startsWith("/orders") },
] as const;

return (
<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
<ul className="grid grid-cols-4">
{items.map((item) => {
const active = item.match(pathname);
const Icon = item.icon;
return (
<li key={item.href}>
<Link
to={item.href}
className={cn(
"flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]",
active ? "text-primary" : "text-muted",
)}
>
<Icon className="size-5" />
{item.label}
</Link>
</li>
);
})}
<li>
<button    
type="button"    
onClick={onOpenCart}    
className="relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] text-muted"    
>
<ShoppingBag className="size-5" />
Kikapu
{cartCount > 0 ? (
<span className="absolute top-1.5 right-[calc(50%-18px)] inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-fg tabular-nums">
{cartCount}
</span>
) : null}
</button>
</li>
</ul>
</nav>
);
}
