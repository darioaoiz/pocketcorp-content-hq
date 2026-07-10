import type { ContentItemRow } from "@/types/database";

export interface CalendarGroup {
  key: string;
  label: string;
  items: ContentItemRow[];
}

function parseDate(value: string): Date {
  // fecha_planificada es date puro (YYYY-MM-DD); parsear en UTC evita
  // corrimientos de un dia por huso horario.
  return new Date(`${value}T00:00:00Z`);
}

function isoWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay() || 7; // domingo -> 7
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const MONTH_LABELS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function groupByWeek(items: ContentItemRow[]): CalendarGroup[] {
  const groups = new Map<string, CalendarGroup>();

  for (const item of items) {
    const date = parseDate(item.fecha_planificada);
    const start = isoWeekStart(date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const key = start.toISOString().slice(0, 10);

    if (!groups.has(key)) {
      const label = `Semana del ${start.getUTCDate()} al ${end.getUTCDate()} de ${MONTH_LABELS[end.getUTCMonth()]}`;
      groups.set(key, { key, label, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function groupByMonth(items: ContentItemRow[]): CalendarGroup[] {
  const groups = new Map<string, CalendarGroup>();

  for (const item of items) {
    const date = parseDate(item.fecha_planificada);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    if (!groups.has(key)) {
      const label = `${MONTH_LABELS[date.getUTCMonth()][0].toUpperCase()}${MONTH_LABELS[date.getUTCMonth()].slice(1)} ${date.getUTCFullYear()}`;
      groups.set(key, { key, label, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function formatPlannedDate(value: string): string {
  const date = parseDate(value);
  return date.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}
