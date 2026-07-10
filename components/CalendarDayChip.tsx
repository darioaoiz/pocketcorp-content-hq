import Link from "next/link";
import type { ContentItemRow, DirectorRow } from "@/types/database";

export function CalendarDayChip({
  item,
  directorsById,
}: {
  item: ContentItemRow;
  directorsById: Map<string, DirectorRow>;
}) {
  const director = item.director_ids.map((id) => directorsById.get(id)).find(Boolean);
  const color = director?.color_hex ?? "#D9D6CC";

  return (
    <Link
      href={`/content/${item.id}`}
      className="block truncate rounded-full border border-ink px-2 py-0.5 font-label text-[9px] uppercase leading-tight text-ink"
      style={{ backgroundColor: `${color}33` }}
      title={item.pilar}
    >
      {item.pilar}
    </Link>
  );
}
