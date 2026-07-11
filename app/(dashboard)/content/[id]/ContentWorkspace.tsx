"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, Select, Textarea } from "@/components/ui/fields";
import { StatusPill } from "@/components/ui/StatusPill";
import { DirectorTag } from "@/components/ui/DirectorTag";
import { PillarPicker } from "@/components/ui/PillarPicker";
import { AngleSuggestions } from "@/components/AngleSuggestions";
import { approveAction, sendForApprovalAction, updateNotesAction } from "./actions";
import { IMAGE_FORMATS, DEFAULT_IMAGE_FORMAT_ID } from "@/lib/imagegen/formats";
import type { ContentItemRow, DirectorRow, Platform } from "@/types/database";

const PLATFORM_LABEL: Record<Platform, string> = { instagram: "Instagram", linkedin: "LinkedIn" };

export function ContentWorkspace({
  initialItem,
  directors,
  pillarSuggestions,
}: {
  initialItem: ContentItemRow;
  directors: DirectorRow[];
  pillarSuggestions: string[];
}) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const directorsById = new Map(directors.map((d) => [d.id, d]));
  const selectedDirectors = item.director_ids.map((id) => directorsById.get(id)).filter((d): d is DirectorRow => Boolean(d));

  return (
    <div className="flex flex-col gap-6">
      <header
        className="rounded-brutal border-brutal-director shadow-brutal-director bg-paper p-5"
        style={{ "--director": selectedDirectors[0]?.color_hex ?? "var(--ink)" } as React.CSSProperties}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <span className="font-label text-xs uppercase tracking-wide text-ink-muted">
            {PLATFORM_LABEL[item.platform]} · {new Date(`${item.fecha_planificada}T00:00:00Z`).toLocaleDateString("es", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <StatusPill estado={item.estado} />
        </div>
        <h1 className="font-comic text-2xl uppercase text-ink md:text-3xl">{item.pilar}</h1>
        {selectedDirectors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedDirectors.map((d) => (
              <DirectorTag key={d.id} name={d.name} colorHex={d.color_hex} avatarUrl={d.reference_image_urls[0]} />
            ))}
          </div>
        )}
      </header>

      <CopySection item={item} directors={directors} pillarSuggestions={pillarSuggestions} onUpdated={setItem} />
      {item.copy && <CreativeSection item={item} onUpdated={setItem} />}
      {item.estado === "creativo_generado" || item.estado === "pendiente_aprobacion" || item.estado === "aprobado" ? (
        <ApprovalSection item={item} onUpdated={setItem} router={router} />
      ) : null}
      <NotesSection item={item} />
    </div>
  );
}

function CopySection({
  item,
  directors,
  pillarSuggestions,
  onUpdated,
}: {
  item: ContentItemRow;
  directors: DirectorRow[];
  pillarSuggestions: string[];
  onUpdated: (item: ContentItemRow) => void;
}) {
  const [platform, setPlatform] = useState<Platform>(item.platform);
  const [pilar, setPilar] = useState(item.pilar);
  const [directorIds, setDirectorIds] = useState<string[]>(item.director_ids);
  const [ideaBreve, setIdeaBreve] = useState(item.idea_breve ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = item.estado === "aprobado";

  function toggleDirector(id: string) {
    setDirectorIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/content/${item.id}/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, pilar, directorIds, ideaBreve }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error generando el copy.");
      onUpdated(json.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase text-ink">1. Copy</h2>

      <div>
        <Label htmlFor="platform">Plataforma</Label>
        <Select
          id="platform"
          value={platform}
          disabled={locked}
          onChange={(e) => setPlatform(e.target.value as Platform)}
        >
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
        </Select>
      </div>

      <div className="mt-4">
        <Label>Pilar de contenido</Label>
        <PillarPicker pillars={pillarSuggestions} name="pilar-edit" value={pilar} onChange={setPilar} disabled={locked} />
      </div>

      <div className="mt-4">
        <Label>Director(es) protagonista(s)</Label>
        <div className="flex flex-wrap gap-2">
          {directors.map((d) => (
            <label
              key={d.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-brutal-pill border-brutal bg-paper px-3 py-1.5 font-label text-[11px] uppercase has-checked:bg-cream"
              style={{ "--director": d.color_hex } as React.CSSProperties}
            >
              <input
                type="checkbox"
                checked={directorIds.includes(d.id)}
                disabled={locked}
                onChange={() => toggleDirector(d.id)}
                className="accent-[var(--director)]"
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>

      <AngleSuggestions
        contentItemId={item.id}
        platform={platform}
        pilar={pilar}
        directorIds={directorIds}
        disabled={locked}
        onSelect={(angle) => setIdeaBreve(`${angle.title} — ${angle.description}`)}
      />

      <div className="mt-4">
        <Label htmlFor="idea_breve">Tu idea (elegi una sugerencia arriba o escribila vos)</Label>
        <Textarea id="idea_breve" value={ideaBreve} disabled={locked} onChange={(e) => setIdeaBreve(e.target.value)} />
      </div>

      {error && (
        <p className="mt-3 rounded-brutal-sm border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{error}</p>
      )}

      <Button className="mt-4" disabled={locked || loading} onClick={handleGenerate}>
        {loading ? "Generando..." : item.copy ? "Regenerar copy" : "Generar copy"}
      </Button>

      {item.copy && (
        <div className="mt-4 whitespace-pre-wrap rounded-brutal-sm border-brutal bg-cream p-4 font-body text-sm text-ink">
          {item.copy}
        </div>
      )}
    </Card>
  );
}

function CreativeSection({
  item,
  onUpdated,
}: {
  item: ContentItemRow;
  onUpdated: (item: ContentItemRow) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formatId, setFormatId] = useState(DEFAULT_IMAGE_FORMAT_ID);
  const locked = item.estado === "aprobado";

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${item.id}/generate-creative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formatId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error generando el creativo.");
      onUpdated(json.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase text-ink">2. Creativo</h2>

      {item.image_url && (
        <img
          src={item.image_url}
          alt={`Creativo para ${item.pilar}`}
          className="mb-4 w-full max-w-sm rounded-brutal border-brutal shadow-brutal"
        />
      )}

      <div className="mb-4">
        <Label htmlFor="format">Formato</Label>
        <Select id="format" value={formatId} disabled={locked} onChange={(e) => setFormatId(e.target.value)}>
          {IMAGE_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="mb-3 rounded-brutal-sm border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{error}</p>
      )}

      {loading && (
        <p className="mb-3 rounded-brutal-sm border-brutal bg-state-creativo px-3 py-2 font-label text-xs uppercase text-ink">
          Generando la imagen... (puede tardar unos segundos)
        </p>
      )}

      <Button disabled={locked || loading} onClick={handleGenerate}>
        {loading ? "Generando..." : item.image_url ? "Regenerar creativo" : "Generar creativo"}
      </Button>
    </Card>
  );
}

function ApprovalSection({
  item,
  onUpdated,
  router,
}: {
  item: ContentItemRow;
  onUpdated: (item: ContentItemRow) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSendForApproval() {
    startTransition(async () => {
      const result = await sendForApprovalAction(item.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onUpdated({ ...item, estado: "pendiente_aprobacion" });
      router.refresh();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approveAction(item.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onUpdated({ ...item, estado: "aprobado", approved_at: new Date().toISOString() });
      router.refresh();
    });
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase text-ink">3. Aprobacion</h2>

      {error && (
        <p className="mb-3 rounded-brutal-sm border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{error}</p>
      )}

      {item.estado === "creativo_generado" && (
        <Button disabled={pending} onClick={handleSendForApproval}>
          {pending ? "Enviando..." : "Enviar a aprobacion"}
        </Button>
      )}

      {item.estado === "pendiente_aprobacion" && (
        <div className="flex flex-col gap-3">
          <p className="font-body text-sm text-ink-muted">
            Revisa el copy y el creativo arriba. Marcar como aprobado es una accion manual y final — nada la dispara
            automaticamente.
          </p>
          <Button disabled={pending} onClick={handleApprove} className="self-start">
            {pending ? "Aprobando..." : "Aprobar"}
          </Button>
        </div>
      )}

      {item.estado === "aprobado" && <ExportButtons item={item} />}
    </Card>
  );
}

function ExportButtons({ item }: { item: ContentItemRow }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!item.copy) return;
    await navigator.clipboard.writeText(item.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={handleCopy}>
        {copied ? "Copiado!" : "Copiar copy"}
      </Button>
      {item.image_url && (
        <a href={item.image_url} download target="_blank" rel="noreferrer">
          <Button variant="secondary">Descargar imagen</Button>
        </a>
      )}
      <span className="font-label text-[11px] uppercase text-ink-muted">
        Listo para publicar manualmente en {PLATFORM_LABEL[item.platform]}.
      </span>
    </div>
  );
}

function NotesSection({ item }: { item: ContentItemRow }) {
  const [notes, setNotes] = useState(item.user_notes ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateNotesAction(item.id, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase text-ink">Notas</h2>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas sobre esta pieza..." />
      <Button variant="secondary" className="mt-3" disabled={pending} onClick={handleSave}>
        {pending ? "Guardando..." : saved ? "Guardado!" : "Guardar notas"}
      </Button>
    </Card>
  );
}
