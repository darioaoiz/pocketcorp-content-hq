"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/types/database";

interface ContentAngle {
  title: string;
  description: string;
}

export function AngleSuggestions({
  contentItemId,
  platform,
  pilar,
  directorIds,
  disabled,
  onSelect,
}: {
  contentItemId: string;
  platform: Platform;
  pilar: string;
  directorIds: string[];
  disabled?: boolean;
  onSelect: (angle: ContentAngle) => void;
}) {
  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = !disabled && pilar.trim().length > 0;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/content/${contentItemId}/generate-angles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, pilar, directorIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error generando ideas.");
      setAngles(json.angles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  function handlePick(index: number, angle: ContentAngle) {
    setSelected(index);
    onSelect(angle);
  }

  return (
    <div className="mt-4">
      <Button variant="secondary" disabled={!canGenerate || loading} onClick={handleGenerate} type="button">
        {loading ? "Pensando ideas..." : angles.length > 0 ? "Generar otras 3 ideas" : "Sugerime 3 ideas"}
      </Button>
      {!canGenerate && !loading && (
        <p className="mt-2 font-label text-[11px] uppercase text-ink-muted">Elegi un pilar de contenido primero.</p>
      )}

      {error && (
        <p className="mt-3 rounded-brutal-sm border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{error}</p>
      )}

      {angles.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {angles.map((angle, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handlePick(i, angle)}
              className={cn(
                "flex flex-col gap-1.5 rounded-brutal border-brutal bg-paper p-3.5 text-left transition-all",
                selected === i
                  ? "border-pop-orange bg-cream shadow-brutal-sm"
                  : "hover:shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px]"
              )}
            >
              <span className="font-display text-sm font-extrabold uppercase text-ink">{angle.title}</span>
              <span className="font-body text-sm text-ink-muted">{angle.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
