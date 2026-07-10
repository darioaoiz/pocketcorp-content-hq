"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { approveContentItem, getContentItem, sendForApproval, updateUserNotes } from "@/lib/content/data";

export interface ActionState {
  error: string | null;
}

export async function sendForApprovalAction(id: string): Promise<ActionState> {
  await requireSession();
  const item = await getContentItem(id);
  if (!item) return { error: "Pieza no encontrada." };

  try {
    await sendForApproval(item);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }

  revalidatePath(`/content/${id}`);
  return { error: null };
}

/**
 * Unica accion en toda la UI que puede marcar una pieza como 'aprobado'.
 * Se dispara exclusivamente por un click manual del usuario en el boton
 * "Aprobar" — no hay ningun otro flujo (generacion de copy, de creativo,
 * webhook) que llegue a este estado.
 */
export async function approveAction(id: string): Promise<ActionState> {
  await requireSession();
  const item = await getContentItem(id);
  if (!item) return { error: "Pieza no encontrada." };

  try {
    await approveContentItem(item);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }

  revalidatePath(`/content/${id}`);
  return { error: null };
}

export async function updateNotesAction(id: string, notes: string): Promise<ActionState> {
  await requireSession();
  try {
    await updateUserNotes(id, notes);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }
  revalidatePath(`/content/${id}`);
  return { error: null };
}
