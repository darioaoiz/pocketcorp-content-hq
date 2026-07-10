import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { BrandBibleVersionRow } from "@/types/database";

export async function getCurrentBrandBible(): Promise<BrandBibleVersionRow | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("brand_bible_versions")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el Brand Bible vigente: ${error.message}`);
  return data;
}

export async function listBrandBibleVersions(): Promise<BrandBibleVersionRow[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("brand_bible_versions")
    .select("*")
    .order("version_number", { ascending: false });

  if (error) throw new Error(`No se pudo leer el historial del Brand Bible: ${error.message}`);
  return data ?? [];
}

export interface BrandBibleInput {
  identity: string;
  offering: string;
  target_audience: string;
  voice_tone: string;
  content_pillars: string[];
  prohibitions: string[];
  raw_notes: string | null;
  visual_style: string;
}

export async function createBrandBibleVersion(input: BrandBibleInput): Promise<BrandBibleVersionRow> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_brand_bible_version", {
    p_identity: input.identity,
    p_offering: input.offering,
    p_target_audience: input.target_audience,
    p_voice_tone: input.voice_tone,
    p_content_pillars: input.content_pillars,
    p_prohibitions: input.prohibitions,
    p_raw_notes: input.raw_notes,
    p_visual_style: input.visual_style,
  });

  if (error) throw new Error(`No se pudo guardar la nueva version del Brand Bible: ${error.message}`);
  return data as BrandBibleVersionRow;
}

/** Texto plano listo para inyectar en el prompt del LLM. Nunca contiene datos hardcodeados: viene 100% de la DB. */
export function formatBrandBibleForPrompt(bb: BrandBibleVersionRow): string {
  const pillars = bb.content_pillars.length ? bb.content_pillars.map((p) => `- ${p}`).join("\n") : "(sin pilares definidos)";
  const prohibitions = bb.prohibitions.length ? bb.prohibitions.map((p) => `- ${p}`).join("\n") : "(sin prohibiciones explicitas registradas)";

  return `# BRAND BIBLE — PocketCorp (version ${bb.version_number})

## Identidad
${bb.identity || "(no definida)"}

## Oferta
${bb.offering || "(no definida)"}

## Publico objetivo
${bb.target_audience || "(no definido)"}

## Voz y tono
${bb.voice_tone || "(no definido)"}

## Pilares de contenido
${pillars}

## Prohibiciones explicitas (que NO decir/prometer)
${prohibitions}

${bb.raw_notes ? `## Notas adicionales\n${bb.raw_notes}` : ""}`.trim();
}
