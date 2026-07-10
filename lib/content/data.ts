import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentItemRow, CreativeJobStatus, Platform } from "@/types/database";
import {
  assertCanApprove,
  assertCanGenerateCopy,
  assertCanGenerateCreative,
  assertCanSendForApproval,
  nextEstadoAfterCopy,
  nextEstadoAfterCreative,
} from "@/lib/content/state-machine";

export async function listContentItems(): Promise<ContentItemRow[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .order("fecha_planificada", { ascending: true });
  if (error) throw new Error(`No se pudo leer el calendario: ${error.message}`);
  return data ?? [];
}

export async function getContentItem(id: string): Promise<ContentItemRow | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("content_items").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo leer la pieza de contenido: ${error.message}`);
  return data;
}

export interface EditableContentFields {
  platform: Platform;
  pilar: string;
  director_ids: string[];
  idea_breve: string | null;
}

export async function updateEditableFields(id: string, input: EditableContentFields): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("content_items").update(input).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar la pieza: ${error.message}`);
}

export interface CreateContentItemInput {
  platform: Platform;
  pilar: string;
  fecha_planificada: string;
  director_ids: string[];
  idea_breve: string | null;
}

export async function createContentItem(input: CreateContentItemInput): Promise<ContentItemRow> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .insert({ ...input, estado: "borrador" })
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo crear la pieza de contenido: ${error.message}`);
  return data;
}

export async function updateUserNotes(id: string, notes: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("content_items").update({ user_notes: notes || null }).eq("id", id);
  if (error) throw new Error(`No se pudieron guardar las notas: ${error.message}`);
}

export async function saveGeneratedCopy(params: {
  item: ContentItemRow;
  copy: string;
  brandBibleVersionId: string;
}): Promise<ContentItemRow> {
  assertCanGenerateCopy(params.item.estado);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .update({
      copy: params.copy,
      brand_bible_version_id: params.brandBibleVersionId,
      estado: nextEstadoAfterCopy(params.item.estado),
    })
    .eq("id", params.item.id)
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo guardar el copy generado: ${error.message}`);
  return data;
}

export async function assertCreativeCanStart(item: ContentItemRow): Promise<void> {
  assertCanGenerateCreative(item.estado, Boolean(item.copy));
}

export async function setCreativeJobStatus(id: string, status: CreativeJobStatus): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("content_items").update({ creative_job_status: status }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el estado del creativo: ${error.message}`);
}

export async function saveGeneratedCreative(params: {
  item: ContentItemRow;
  imageUrl: string;
  imageStoragePath: string;
}): Promise<ContentItemRow> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .update({
      image_url: params.imageUrl,
      image_storage_path: params.imageStoragePath,
      creative_job_status: "completed",
      estado: nextEstadoAfterCreative(params.item.estado),
    })
    .eq("id", params.item.id)
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo guardar el creativo generado: ${error.message}`);
  return data;
}

export async function sendForApproval(item: ContentItemRow): Promise<ContentItemRow> {
  assertCanSendForApproval(item.estado);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .update({ estado: "pendiente_aprobacion" })
    .eq("id", item.id)
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo enviar a aprobacion: ${error.message}`);
  return data;
}

/**
 * Unico camino en todo el codebase que fija estado = 'aprobado'. Requiere
 * estar en 'pendiente_aprobacion' y solo se llama desde una accion disparada
 * a mano por el usuario (boton "Aprobar" en /content/[id]).
 */
export async function approveContentItem(item: ContentItemRow): Promise<ContentItemRow> {
  assertCanApprove(item.estado);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .update({ estado: "aprobado", approved_at: new Date().toISOString() })
    .eq("id", item.id)
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo aprobar la pieza: ${error.message}`);
  return data;
}
