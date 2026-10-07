import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { deliveryFeeFor, formatTsh, FREE_DELIVERY_OVER } from "@/lib/money";
import { useSokoStore } from "@/lib/store";
import { QuantityStepper } from "./quantity-stepper";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Separator } from "./ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const lines = useSokoStore((s) => s.lines);
  const setQty = useSokoStore((s) => s.setQty);
  const subtotal = useSokoStore((s) => s.subtotal());
  const fee = deliveryFeeFor(subtotal, "delivery");
  const remaining = Math.max(0, FREE_DELIVERY_OVER - subtotal);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Kikapu</SheetTitle>
          <SheetDescription>
            {lines.length === 0
              ? "Kikapu chako hakina bidhaa."
              : `${lines.length} ${lines.length === 1 ? "item" : "items"} from today's market.`}
          </SheetDescription>
        </SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-16 text-center">
            <ShoppingBag className="size-10 text-subtle" strokeWidth={1.5} />
            <p className="max-w-xs text-sm text-muted">
              Ongeza mboga, matunda au kifurushi; tutakuletea kwa wakati uliopangwa.
            </p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link to="/shop">Angalia bidhaa</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="flex flex-col gap-5">
                {lines.map((line) => {
                  const product = getProduct(line.productId);
                  if (!product) return null;
                  return (
                    <li key={line.productId} className="flex gap-3">
                      <Link
                        to="/product/$id"
                        params={{ id: product.id }}
                        onClick={() => onOpenChange(false)}
                        className="size-20 shrink-0 overflow-hidden rounded-md bg-surface-2"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-sm text-muted">
                          {formatTsh(product.price)} / {product.unit}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <QuantityStepper
                            size="sm"
                            value={line.qty}
                            onChange={(n) => setQty(product.id, n)}
                          />
                          <p className="text-sm font-medium tabular-nums">
                            {formatTsh(product.price * line.qty)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-border bg-surface p-6">
              {remaining > 0 ? (
                <p className="mb-3 text-sm text-muted">
                  Ongeza bidhaa za TSh {formatTsh(remaining)} ili upate uwasilishaji wa bure.
                </p>
              ) : (
                <p className="mb-3 text-sm text-primary">Uwasilishaji wa oda hii ni bure.</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Jumla ndogo</span>
                <span className="tabular-nums">{formatTsh(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted">Ada ya uwasilishaji</span>
                <span className="tabular-nums">{fee === 0 ? "Bure" : formatTsh(fee)}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="font-medium">Jumla</span>
                <span className="font-display text-xl tabular-nums">
                  {formatTsh(subtotal + fee)}
                </span>
              </div>
              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/checkout" });
                }}
              >
                Kamilisha oda
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
