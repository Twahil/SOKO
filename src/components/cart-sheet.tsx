import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { useSokoStore } from "@/lib/store";

type CartSheetProps = {
open: boolean;
onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
const lines = useSokoStore((state) => state.lines);
const setQty = useSokoStore((state) => state.setQty);
const remove = useSokoStore((state) => state.remove);
const subtotal = useSokoStore((state) => state.subtotal());

if (!open) return null;

return (
<div className="fixed inset-0 z-50">
<button
type="button"
aria-label="Funga kikapu"
className="absolute inset-0 size-full bg-black/40"
onClick={() => onOpenChange(false)}
/>

  <section
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-title"
    className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg text-fg shadow-xl"
  >
    <header className="flex items-center justify-between border-b border-border p-4">
      <h2 id="cart-title" className="text-lg font-semibold">
        Kikapu changu
      </h2>
      <button
        type="button"
        aria-label="Funga"
        onClick={() => onOpenChange(false)}
        className="rounded-md p-2 hover:bg-surface"
      >
        <X className="size-5" />
      </button>
    </header>

    {lines.length === 0 ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBag className="size-12 text-muted" />
        <p className="font-medium">Kikapu chako bado hakina bidhaa.</p>
        <p className="text-sm text-muted">
          Chagua bidhaa unazohitaji kutoka sokoni.
        </p>
        <Link
          to="/shop"
          onClick={() => onOpenChange(false)}
          className="rounded-md bg-primary px-5 py-3 text-primary-fg"
        >
          Endelea kununua
        </Link>
      </div>
    ) : (
      <>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {lines.map((line) => {
            const product = getProduct(line.productId);
            if (!product) return null;

            return (
              <article
                key={line.productId}
                className="flex gap-3 border-b border-border pb-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-20 rounded-md object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted">
                    TSh {product.price.toLocaleString("en-US")} / {product.unit}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Punguza ${product.name}`}
                      onClick={() => setQty(line.productId, line.qty - 1)}
                      className="rounded border border-border p-1"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span>{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Ongeza ${product.name}`}
                      onClick={() => setQty(line.productId, line.qty + 1)}
                      className="rounded border border-border p-1"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Ondoa ${product.name}`}
                      onClick={() => remove(line.productId)}
                      className="ml-auto rounded p-1 text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-semibold">
                  TSh {(product.price * line.qty).toLocaleString("en-US")}
                </p>
              </article>
            );
          })}
        </div>

        <footer className="space-y-4 border-t border-border p-4">
          <div className="flex justify-between gap-4 font-semibold">
            <span>Jumla ya bidhaa</span>
            <span>TSh {subtotal.toLocaleString("en-US")}</span>
          </div>
          <p className="text-xs text-muted">
            Gharama ya usafirishaji, ikiwa ipo, inaweza kuongezwa wakati wa kuthibitisha oda.
          </p>
          <Link
            to="/checkout"
            onClick={() => onOpenChange(false)}
            className="block rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-fg"
          >
            Endelea kulipia
          </Link>
        </footer>
      </>
    )}
  </section>
</div>

);
}
