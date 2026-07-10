"use client";

import { useActionState } from "react";
import { createContentItemAction, type CreateContentItemState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import type { DirectorRow } from "@/types/database";

const initialState: CreateContentItemState = { error: null };

export function NewContentForm({ directors, pillarSuggestions }: { directors: DirectorRow[]; pillarSuggestions: string[] }) {
  const [state, formAction, pending] = useActionState(createContentItemAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="platform">Plataforma</Label>
        <Select id="platform" name="platform" defaultValue="instagram" required>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="pilar">Pilar de contenido</Label>
        <Input id="pilar" name="pilar" list="pillar-suggestions" required placeholder="Ej: Educacion financiera" />
        <datalist id="pillar-suggestions">
          {pillarSuggestions.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="fecha_planificada">Fecha planificada</Label>
        <Input id="fecha_planificada" name="fecha_planificada" type="date" defaultValue={today} required />
      </div>

      <div>
        <Label>Director(es) protagonista(s) (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {directors.map((d) => (
            <label
              key={d.id}
              className="flex cursor-pointer items-center gap-1.5 border-brutal bg-paper px-2.5 py-1.5 font-label text-[11px] uppercase has-checked:bg-cream"
              style={{ "--director": d.color_hex } as React.CSSProperties}
            >
              <input type="checkbox" name="director_ids" value={d.id} className="accent-[var(--director)]" />
              {d.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="idea_breve">Idea breve (opcional en este paso, se puede completar despues)</Label>
        <Textarea id="idea_breve" name="idea_breve" placeholder="De que va este post..." />
      </div>

      {state.error && (
        <p className="border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando..." : "Crear pieza"}
      </Button>
    </form>
  );
}
