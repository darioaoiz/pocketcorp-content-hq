import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-paper border-brutal shadow-brutal p-5", className)}
      style={style}
      {...props}
    />
  );
}
