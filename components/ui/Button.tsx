import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-pop-orange text-white",
  secondary: "bg-paper text-ink",
  ghost: "bg-cream text-ink",
  danger: "bg-[#FF2E93] text-white",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-brutal font-label text-xs uppercase tracking-wide px-4 py-2.5 transition-all",
        variantClasses[variant],
        disabled
          ? "opacity-40 cursor-not-allowed shadow-none translate-x-0 translate-y-0"
          : "shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
