import { cn } from "@/lib/utils/cn";

export function DirectorTag({
  name,
  colorHex,
  className,
}: {
  name: string;
  colorHex: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-brutal-director shadow-brutal-director bg-paper px-2.5 py-1 font-label text-[11px] uppercase tracking-wide text-ink",
        className
      )}
      style={{ "--director": colorHex } as React.CSSProperties}
    >
      {name}
    </span>
  );
}
