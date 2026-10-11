import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
variant?: "default" | "outline" | "ghost";
size?: "default" | "sm" | "lg" | "icon";
asChild?: boolean;
};

export function Button({
className,
variant = "default",
size = "default",
asChild = false,
type = "button",
...props
}: ButtonProps) {
const Component = asChild ? Slot : "button";

return (
<Component
type={asChild ? undefined : type}
className={cn(
"inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
variant === "default" && "bg-primary text-primary-fg hover:opacity-90",
variant === "outline" && "border border-border bg-bg hover:bg-surface",
variant === "ghost" && "hover:bg-surface",
size === "default" && "h-10 px-4 py-2",
size === "sm" && "h-9 px-3 text-sm",
size === "lg" && "h-11 px-6",
size === "icon" && "size-10",
className
)}
{...props}
/>
);
}
