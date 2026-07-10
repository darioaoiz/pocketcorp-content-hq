import Link from "next/link";
import { StatusPill } from "@/components/ui/StatusPill";
import { DirectorTag } from "@/components/ui/DirectorTag";
import { formatPlannedDate } from "@/lib/content/calendar";
import type { ContentItemRow, DirectorRow, Platform } from "@/types/database";

const PLATFORM_LABEL: Record<Platform, string> = { instagram: "Instagram", linkedin: "LinkedIn" };

export function ContentItemCard({
  item,
  directorsById,
}: {
  item: ContentItemRow;
  directorsById: Map<string, DirectorRow>;
}) {
  const directors = item.director_ids.map((id) => directorsById.get(id)).filter((d): d is DirectorRow => Boolean(d));
  const accentDirector = directors[0];

  return (
    <Link
      href={`/content/${item.id}`}
      className="block rounded-brutal border-brutal-director shadow-brutal-director bg-paper p-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
      style={{ "--director": accentDirector?.color_hex ?? "var(--ink)" } as React.CSSProperties}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-label text-[11px] uppercase tracking-wide text-ink-muted">
          {formatPlannedDate(item.fecha_planificada)} · {PLATFORM_LABEL[item.platform]}
        </span>
        <StatusPill estado={item.estado} />
      </div>
      <h3 className="font-display text-base font-extrabold uppercase text-ink">{item.pilar}</h3>
      {item.idea_breve && <p className="mt-1 line-clamp-2 font-body text-sm text-ink-muted">{item.idea_breve}</p>}
      {directors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {directors.map((d) => (
            <DirectorTag key={d.id} name={d.name} colorHex={d.color_hex} avatarUrl={d.reference_image_urls[0]} />
          ))}
        </div>
      )}
    </Link>
  );
}
