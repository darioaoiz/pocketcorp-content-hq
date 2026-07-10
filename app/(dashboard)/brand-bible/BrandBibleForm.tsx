"use client";

import { useActionState } from "react";
import { saveBrandBibleAction, type SaveBrandBibleState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/fields";
import { DEFAULT_VISUAL_STYLE } from "@/lib/imagegen/default-style";
import type { BrandBibleVersionRow } from "@/types/database";

const initialState: SaveBrandBibleState = { error: null, success: false };

export function BrandBibleForm({ current }: { current: BrandBibleVersionRow | null }) {
  const [state, formAction, pending] = useActionState(saveBrandBibleAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="identity">Identidad</Label>
        <Textarea id="identity" name="identity" defaultValue={current?.identity ?? ""} placeholder="Quien es PocketCorp, su mision, su personalidad de marca..." />
      </div>
      <div>
        <Label htmlFor="offering">Oferta</Label>
        <Textarea id="offering" name="offering" defaultValue={current?.offering ?? ""} placeholder="Que vende/ofrece PocketCorp exactamente..." />
      </div>
      <div>
        <Label htmlFor="target_audience">Publico objetivo</Label>
        <Textarea id="target_audience" name="target_audience" defaultValue={current?.target_audience ?? ""} placeholder="A quien le habla PocketCorp..." />
      </div>
      <div>
        <Label htmlFor="voice_tone">Voz y tono</Label>
        <Textarea id="voice_tone" name="voice_tone" defaultValue={current?.voice_tone ?? ""} placeholder="Como suena PocketCorp: formal/informal, humor, ritmo..." />
      </div>
      <div>
        <Label htmlFor="content_pillars">Pilares de contenido (uno por linea)</Label>
        <Textarea
          id="content_pillars"
          name="content_pillars"
          defaultValue={current?.content_pillars.join("\n") ?? ""}
          placeholder={"Educacion financiera\nDetras de camara\nCasos de uso"}
        />
      </div>
      <div>
        <Label htmlFor="prohibitions">Prohibiciones explicitas — que NO decir/prometer (una por linea)</Label>
        <Textarea
          id="prohibitions"
          name="prohibitions"
          defaultValue={current?.prohibitions.join("\n") ?? ""}
          placeholder={"No prometer rentabilidad garantizada\nNo usar cifras de clientes sin fuente"}
        />
      </div>
      <div>
        <Label htmlFor="raw_notes">Notas adicionales (opcional)</Label>
        <Input id="raw_notes" name="raw_notes" defaultValue={current?.raw_notes ?? ""} />
      </div>
      <div>
        <Label htmlFor="visual_style">
          Estilo visual de los creativos — instrucciones exactas que recibe la IA de imagenes en cada generacion
        </Label>
        <Textarea
          id="visual_style"
          name="visual_style"
          defaultValue={current?.visual_style?.trim() || DEFAULT_VISUAL_STYLE}
          className="min-h-64 font-label text-xs"
        />
      </div>

      {state.error && (
        <p className="border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{state.error}</p>
      )}
      {state.success && (
        <p className="border-brutal bg-state-aprobado px-3 py-2 font-label text-xs uppercase text-ink">
          Guardado como nueva version.
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando..." : "Guardar como nueva version"}
      </Button>
    </form>
  );
}
