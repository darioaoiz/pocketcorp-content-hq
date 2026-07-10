import Link from "next/link";
import { listContentItems } from "@/lib/content/data";
import { listDirectors } from "@/lib/directors/data";
import {
  buildMonthGrid,
  buildWeekRow,
  shiftMonth,
  shiftWeek,
  todayIso,
  type DayCell,
} from "@/lib/content/calendar";
import { ContentItemCard } from "@/components/ContentItemCard";
import { CalendarDayChip } from "@/components/CalendarDayChip";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { DirectorRow } from "@/types/database";

const MAX_CHIPS_PER_DAY = 3;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const { view, date } = await searchParams;
  const mode = view === "semana" ? "semana" : "mes";
  const referenceIso = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso();

  const [items, directors] = await Promise.all([listContentItems(), listDirectors()]);
  const directorsById = new Map(directors.map((d) => [d.id, d]));

  const prevDate = mode === "semana" ? shiftWeek(referenceIso, -1) : shiftMonth(referenceIso, -1);
  const nextDate = mode === "semana" ? shiftWeek(referenceIso, 1) : shiftMonth(referenceIso, 1);
  const label = mode === "semana" ? buildWeekRow(referenceIso, items).label : buildMonthGrid(referenceIso, items).label;

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link
            href={`/calendar?view=semana&date=${referenceIso}`}
            className={cn(
              "rounded-brutal-pill border-brutal px-4 py-1.5 font-label text-xs uppercase",
              mode === "semana" ? "bg-pop-orange text-white" : "bg-paper text-ink"
            )}
          >
            Semana
          </Link>
          <Link
            href={`/calendar?view=mes&date=${referenceIso}`}
            className={cn(
              "rounded-brutal-pill border-brutal px-4 py-1.5 font-label text-xs uppercase",
              mode === "mes" ? "bg-pop-orange text-white" : "bg-paper text-ink"
            )}
          >
            Mes
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?view=${mode}&date=${prevDate}`}
            aria-label="Anterior"
            className="rounded-brutal-pill border-brutal bg-paper px-3 py-1.5 font-label text-xs uppercase shadow-brutal-sm"
          >
            ←
          </Link>
          <h2 className="min-w-[10ch] text-center font-comic text-lg uppercase text-ink">{label}</h2>
          <Link
            href={`/calendar?view=${mode}&date=${nextDate}`}
            aria-label="Siguiente"
            className="rounded-brutal-pill border-brutal bg-paper px-3 py-1.5 font-label text-xs uppercase shadow-brutal-sm"
          >
            →
          </Link>
          <Link
            href={`/calendar?view=${mode}&date=${todayIso()}`}
            className="rounded-brutal-pill border-brutal bg-cream px-3 py-1.5 font-label text-xs uppercase"
          >
            Hoy
          </Link>
        </div>
      </div>

      {mode === "mes" ? (
        <MonthView referenceIso={referenceIso} items={items} directorsById={directorsById} />
      ) : (
        <WeekView referenceIso={referenceIso} items={items} directorsById={directorsById} />
      )}
    </div>
  );
}

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function MonthView({
  referenceIso,
  items,
  directorsById,
}: {
  referenceIso: string;
  items: Awaited<ReturnType<typeof listContentItems>>;
  directorsById: Map<string, DirectorRow>;
}) {
  const grid = buildMonthGrid(referenceIso, items);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_HEADERS.map((w) => (
            <div key={w} className="px-1 pb-1 text-center font-label text-[10px] uppercase text-ink-muted">
              {w}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {grid.weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-1.5">
              {week.map((day) => (
                <MonthDayCell key={day.iso} day={day} directorsById={directorsById} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthDayCell({ day, directorsById }: { day: DayCell; directorsById: Map<string, DirectorRow> }) {
  const overflow = day.items.length - MAX_CHIPS_PER_DAY;
  return (
    <div
      className={cn(
        "flex min-h-[92px] flex-col gap-1 rounded-brutal-sm border-brutal p-1.5",
        day.inCurrentMonth ? "bg-paper" : "bg-cream opacity-50",
        day.isToday && "border-pop-orange"
      )}
    >
      <span
        className={cn(
          "self-end font-label text-[10px]",
          day.isToday ? "rounded-full bg-pop-orange px-1.5 py-0.5 text-white" : "text-ink-muted"
        )}
      >
        {day.day}
      </span>
      <div className="flex flex-col gap-1">
        {day.items.slice(0, MAX_CHIPS_PER_DAY).map((item) => (
          <CalendarDayChip key={item.id} item={item} directorsById={directorsById} />
        ))}
        {overflow > 0 && <span className="font-label text-[9px] text-ink-muted">+{overflow} mas</span>}
      </div>
    </div>
  );
}

function WeekView({
  referenceIso,
  items,
  directorsById,
}: {
  referenceIso: string;
  items: Awaited<ReturnType<typeof listContentItems>>;
  directorsById: Map<string, DirectorRow>;
}) {
  const week = buildWeekRow(referenceIso, items);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[980px] gap-3">
        {week.days.map((day) => (
          <div key={day.iso} className="w-[260px] shrink-0">
            <div
              className={cn(
                "mb-2 rounded-brutal-pill border-brutal px-3 py-1.5 text-center font-label text-xs uppercase",
                day.isToday ? "bg-pop-orange text-white" : "bg-paper text-ink"
              )}
            >
              {day.weekday} {day.day}
            </div>
            <div className="flex flex-col gap-3">
              {day.items.length === 0 ? (
                <p className="rounded-brutal-sm border-brutal bg-cream px-3 py-4 text-center font-label text-[10px] uppercase text-ink-muted">
                  Sin piezas
                </p>
              ) : (
                day.items.map((item) => <ContentItemCard key={item.id} item={item} directorsById={directorsById} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
