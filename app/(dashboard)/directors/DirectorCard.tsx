"use client";

import { useActionState, useState } from "react";
import { updateDirectorAction, type UpdateDirectorState } from "./actions";
import { MAX_REFERENCE_IMAGES } from "@/lib/directors/constants";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";
import type { DirectorRow } from "@/types/database";

const initialState: UpdateDirectorState = { error: null, success: false };

export function DirectorCard({ director }: { director: DirectorRow }) {
  const [state, formAction, pending] = useActionState(updateDirectorAction, initialState);
  const slots = Array.from({ length: MAX_REFERENCE_IMAGES }, (_, i) => director.reference_image_urls[i] ?? null);

  return (
    <div
      className="rounded-brutal border-brutal-director shadow-brutal-director bg-paper p-5"
      style={{ "--director": director.color_hex } as React.CSSProperties}
    >
      <div className="mb-4 flex flex-col items-center text-center">
        {slots[0] ? (
          <img
            src={slots[0]}
            alt={director.name}
            className="mb-3 h-24 w-24 rounded-full border-[3px] object-cover"
            style={{ borderColor: director.color_hex }}
          />
        ) : (
          <span
            className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-[3px] font-comic text-3xl text-ink"
            style={{ borderColor: director.color_hex, backgroundColor: `${director.color_hex}33` }}
          >
            {director.name.slice(0, 1)}
          </span>
        )}
        <h3 className="font-display text-xl font-extrabold uppercase text-ink">{director.name}</h3>
        {director.role && <p className="font-label text-[11px] uppercase text-ink-muted">{director.role}</p>}
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={director.id} />
        <div>
          <Label htmlFor={`role-${director.id}`}>Rol</Label>
          <Input id={`role-${director.id}`} name="role" defaultValue={director.role ?? ""} placeholder="Por definir" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Color oficial"
            defaultValue={director.color_hex}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-full border-brutal p-0"
            onChange={(e) => {
              const hexInput = document.getElementById(`color-${director.id}`) as HTMLInputElement | null;
              if (hexInput) hexInput.value = e.target.value.toUpperCase();
            }}
          />
          <Input
            id={`color-${director.id}`}
            name="color_hex"
            defaultValue={director.color_hex}
            className="font-label text-xs"
          />
        </div>

        <div>
          <Label>Fotos de referencia (hasta {MAX_REFERENCE_IMAGES} — cara, cuerpo completo, otros angulos)</Label>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((url, slot) => (
              <ReferenceSlot key={slot} slot={slot} url={url} directorId={director.id} />
            ))}
          </div>
        </div>

        {state.error && (
          <p className="rounded-brutal-sm border-brutal bg-[#FF2E93] px-2 py-1.5 font-label text-[11px] uppercase text-white">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-brutal-sm border-brutal bg-state-aprobado px-2 py-1.5 font-label text-[11px] uppercase text-ink">
            Guardado.
          </p>
        )}

        <Button type="submit" variant="secondary" disabled={pending} className="self-start">
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}

function ReferenceSlot({ slot, url, directorId }: { slot: number; url: string | null; directorId: string }) {
  const [remove, setRemove] = useState(false);
  const inputId = `ref-${directorId}-${slot}`;

  return (
    <div className="rounded-brutal-sm border-brutal bg-cream p-1.5">
      <input type="hidden" name={`existing_url_${slot}`} value={remove ? "" : (url ?? "")} />
      {url && !remove ? (
        <div className="mb-1 flex items-center justify-between gap-1">
          <img src={url} alt={`Referencia ${slot + 1}`} className="h-14 w-14 rounded-brutal-sm border-brutal object-cover" />
          <label className="flex items-center gap-1 font-label text-[9px] uppercase text-ink-muted">
            <input
              type="checkbox"
              name={`remove_reference_${slot}`}
              value="1"
              checked={remove}
              onChange={(e) => setRemove(e.target.checked)}
            />
            Quitar
          </label>
        </div>
      ) : (
        <p className="mb-1 font-label text-[9px] uppercase text-ink-muted">Foto {slot + 1}</p>
      )}
      <label htmlFor={inputId} className="mb-1 block font-label text-[9px] uppercase text-ink-muted">
        {url && !remove ? "Reemplazar por otra:" : "Subir:"}
      </label>
      <input
        id={inputId}
        type="file"
        name={`reference_image_${slot}`}
        accept="image/*"
        className="w-full text-[10px]"
      />
    </div>
  );
}
