"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createContentItem } from "@/lib/content/data";
import type { Platform } from "@/types/database";

export interface CreateContentItemState {
  error: string | null;
}

export async function createContentItemAction(
  _prevState: CreateContentItemState,
  formData: FormData
): Promise<CreateContentItemState> {
  await requireSession();

  const platform = String(formData.get("platform") ?? "") as Platform;
  const pilar = String(formData.get("pilar") ?? "").trim();
  const fecha = String(formData.get("fecha_planificada") ?? "").trim();
  const directorIds = formData.getAll("director_ids").map(String);
  const ideaBreve = String(formData.get("idea_breve") ?? "").trim() || null;

  if (platform !== "instagram" && platform !== "linkedin") {
    return { error: "Elegi una plataforma valida." };
  }
  if (!pilar) return { error: "El pilar de contenido es obligatorio." };
  if (!fecha) return { error: "La fecha planificada es obligatoria." };

  let created;
  try {
    created = await createContentItem({
      platform,
      pilar,
      fecha_planificada: fecha,
      director_ids: directorIds,
      idea_breve: ideaBreve,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }

  redirect(`/content/${created.id}`);
}
