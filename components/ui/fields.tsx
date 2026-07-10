import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase =
  "w-full rounded-brutal-sm border-brutal bg-paper px-3 py-2.5 font-body text-ink placeholder:text-ink-muted focus:outline-none focus:shadow-brutal-sm focus:translate-x-[1px] focus:translate-y-[1px] transition-all disabled:opacity-50";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block font-label text-[11px] uppercase tracking-wide text-ink-muted mb-1.5", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-y min-h-24", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "cursor-pointer", className)} {...props} />;
}
