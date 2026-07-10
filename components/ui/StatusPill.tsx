import type { ContentEstado } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const ESTADO_META: Record<ContentEstado, { label: string; color: string }> = {
  borrador: { label: "Borrador", color: "var(--state-borrador)" },
  copy_generado: { label: "Copy generado", color: "var(--state-copy)" },
  creativo_generado: { label: "Creativo generado", color: "var(--state-creativo)" },
  pendiente_aprobacion: { label: "Pendiente de aprobacion", color: "var(--state-pendiente)" },
  aprobado: { label: "Aprobado", color: "var(--state-aprobado)" },
};

export function StatusPill({ estado, className }: { estado: ContentEstado; className?: string }) {
  const meta = ESTADO_META[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-brutal-pill border-brutal-thick px-3 py-1 font-label text-[11px] uppercase tracking-wide text-ink",
        className
      )}
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  );
}
