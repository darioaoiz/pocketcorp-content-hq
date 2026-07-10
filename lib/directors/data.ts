import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DirectorRow } from "@/types/database";

export async function listDirectors(): Promise<DirectorRow[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("directors").select("*").order("name", { ascending: true });
  if (error) throw new Error(`No se pudo leer el catalogo de directores: ${error.message}`);
  return data ?? [];
}

export async function getDirectorsByIds(ids: string[]): Promise<DirectorRow[]> {
  if (ids.length === 0) return [];
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("directors").select("*").in("id", ids);
  if (error) throw new Error(`No se pudo leer directores: ${error.message}`);
  return data ?? [];
}

export interface DirectorUpdateInput {
  role: string | null;
  color_hex: string;
  reference_image_urls?: string[];
}

export async function updateDirector(id: string, input: DirectorUpdateInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("directors").update(input).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el director: ${error.message}`);
}
