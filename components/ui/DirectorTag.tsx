import { cn } from "@/lib/utils/cn";

export function DirectorTag({
  name,
  colorHex,
  avatarUrl,
  className,
}: {
  name: string;
  colorHex: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-brutal-pill border-brutal-director shadow-brutal-director bg-paper py-1 pl-1 pr-3 font-label text-[11px] uppercase tracking-wide text-ink",
        className
      )}
      style={{ "--director": colorHex } as React.CSSProperties}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full border border-ink object-cover" />
      ) : (
        <span className="h-5 w-5 rounded-full border border-ink" style={{ backgroundColor: colorHex }} aria-hidden />
      )}
      {name}
    </span>
  );
}
