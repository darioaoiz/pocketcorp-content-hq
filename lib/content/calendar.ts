import type { ContentItemRow } from "@/types/database";

export interface DayCell {
  iso: string;
  day: number;
  weekday: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  items: ContentItemRow[];
}

export interface MonthGrid {
  label: string;
  weeks: DayCell[][];
}

export interface WeekRow {
  label: string;
  days: DayCell[];
}

const MONTH_LABELS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const WEEKDAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export function parseDate(value: string): Date {
  // fecha_planificada es date puro (YYYY-MM-DD); parsear en UTC evita
  // corrimientos de un dia por huso horario.
  return new Date(`${value}T00:00:00Z`);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

function isoWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay() || 7; // domingo -> 7
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function itemsByDate(items: ContentItemRow[]): Map<string, ContentItemRow[]> {
  const map = new Map<string, ContentItemRow[]>();
  for (const item of items) {
    const key = item.fecha_planificada;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

function buildDayCell(date: Date, inCurrentMonth: boolean, todayKey: string, byDate: Map<string, ContentItemRow[]>): DayCell {
  const iso = toIsoDate(date);
  return {
    iso,
    day: date.getUTCDate(),
    weekday: WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7],
    inCurrentMonth,
    isToday: iso === todayKey,
    items: byDate.get(iso) ?? [],
  };
}

/** Grilla de mes: filas de 7 dias (lunes a domingo), incluyendo dias del mes anterior/siguiente para completar semanas. */
export function buildMonthGrid(referenceIso: string, items: ContentItemRow[]): MonthGrid {
  const ref = parseDate(referenceIso);
  const year = ref.getUTCFullYear();
  const month = ref.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const gridStart = isoWeekStart(firstOfMonth);

  const byDate = itemsByDate(items);
  const todayKey = todayIso();

  const weeks: DayCell[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(buildDayCell(cursor, cursor.getUTCMonth() === month, todayKey, byDate));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
    // Si ya completamos el mes y la semana siguiente es integramente del mes que viene, no hace falta otra fila.
    if (week[6].day >= 1 && cursor.getUTCMonth() !== month && w >= 3) break;
  }

  return {
    label: `${MONTH_LABELS[month][0].toUpperCase()}${MONTH_LABELS[month].slice(1)} ${year}`,
    weeks,
  };
}

/** Fila de 7 dias (lunes a domingo) de la semana que contiene referenceIso. */
export function buildWeekRow(referenceIso: string, items: ContentItemRow[]): WeekRow {
  const ref = parseDate(referenceIso);
  const start = isoWeekStart(ref);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  const byDate = itemsByDate(items);
  const todayKey = todayIso();

  const days: DayCell[] = [];
  const cursor = new Date(start);
  for (let d = 0; d < 7; d++) {
    days.push(buildDayCell(cursor, true, todayKey, byDate));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const label = sameMonth
    ? `${start.getUTCDate()} al ${end.getUTCDate()} de ${MONTH_LABELS[end.getUTCMonth()]} ${end.getUTCFullYear()}`
    : `${start.getUTCDate()} de ${MONTH_LABELS[start.getUTCMonth()]} al ${end.getUTCDate()} de ${MONTH_LABELS[end.getUTCMonth()]}`;

  return { label: `Semana del ${label}`, days };
}

export function shiftMonth(referenceIso: string, delta: number): string {
  const ref = parseDate(referenceIso);
  const shifted = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + delta, 1));
  return toIsoDate(shifted);
}

export function shiftWeek(referenceIso: string, delta: number): string {
  const ref = parseDate(referenceIso);
  ref.setUTCDate(ref.getUTCDate() + delta * 7);
  return toIsoDate(ref);
}

export function formatPlannedDate(value: string): string {
  const date = parseDate(value);
  return date.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}
