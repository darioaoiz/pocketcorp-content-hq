import Link from "next/link";
import { listContentItems } from "@/lib/content/data";
import { listDirectors } from "@/lib/directors/data";
import { groupByMonth, groupByWeek } from "@/lib/content/calendar";
import { ContentItemCard } from "@/components/ContentItemCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const mode = view === "semana" ? "semana" : "mes";

  const [items, directors] = await Promise.all([listContentItems(), listDirectors()]);
  const directorsById = new Map(directors.map((d) => [d.id, d]));
  const groups = mode === "semana" ? groupByWeek(items) : groupByMonth(items);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-pop-orange">Planificacion</p>
          <h1 className="font-comic text-3xl uppercase text-ink md:text-4xl">Calendario</h1>
        </div>
        <Link href="/content/new">
          <Button>+ Nueva pieza</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Link
          href="/calendar?view=semana"
          className={cn(
            "border-brutal px-3 py-1.5 font-label text-xs uppercase",
            mode === "semana" ? "bg-pop-orange text-white" : "bg-paper text-ink"
          )}
        >
          Semana
        </Link>
        <Link
          href="/calendar?view=mes"
          className={cn(
            "border-brutal px-3 py-1.5 font-label text-xs uppercase",
            mode === "mes" ? "bg-pop-orange text-white" : "bg-paper text-ink"
          )}
        >
          Mes
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="border-brutal bg-paper p-8 text-center">
          <p className="font-body text-sm text-ink-muted">Todavia no hay piezas planificadas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-3 font-comic text-xl uppercase text-ink">{group.label}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <ContentItemCard key={item.id} item={item} directorsById={directorsById} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
