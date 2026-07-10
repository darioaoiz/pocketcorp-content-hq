import { NextResponse } from "next/server";
import { requireApiSession, isSession } from "@/lib/api-session";
import { getContentItem, saveGeneratedCopy, updateEditableFields } from "@/lib/content/data";
import { assertCanGenerateCopy } from "@/lib/content/state-machine";
import { getCurrentBrandBible, formatBrandBibleForPrompt } from "@/lib/brand-bible/data";
import { getDirectorsByIds } from "@/lib/directors/data";
import { buildCopySystemPrompt, buildCopyUserPrompt } from "@/lib/llm/prompt";
import { generateChatCompletion } from "@/lib/llm/openrouter";
import type { Platform } from "@/types/database";

export async function POST(request: Request, ctx: RouteContext<"/api/content/[id]/generate-copy">) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await ctx.params;
  const item = await getContentItem(id);
  if (!item) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });

  try {
    assertCanGenerateCopy(item.estado);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Transicion invalida." }, { status: 409 });
  }

  const brandBible = await getCurrentBrandBible();
  if (!brandBible) {
    return NextResponse.json(
      { error: "No hay un Brand Bible configurado todavia. Completálo en /brand-bible antes de generar copy." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    platform?: Platform;
    pilar?: string;
    directorIds?: string[];
    ideaBreve?: string;
  };

  const platform = body.platform ?? item.platform;
  const pilar = (body.pilar ?? item.pilar ?? "").trim();
  const directorIds = body.directorIds ?? item.director_ids;
  const ideaBreve = (body.ideaBreve ?? item.idea_breve ?? "").trim();

  if (!pilar) return NextResponse.json({ error: "El pilar de contenido es obligatorio." }, { status: 400 });
  if (!ideaBreve) return NextResponse.json({ error: "La idea breve es obligatoria para generar copy." }, { status: 400 });

  await updateEditableFields(id, { platform, pilar, director_ids: directorIds, idea_breve: ideaBreve });

  const directors = await getDirectorsByIds(directorIds);
  const systemPrompt = buildCopySystemPrompt(formatBrandBibleForPrompt(brandBible));
  const userPrompt = buildCopyUserPrompt({ platform, pilar, ideaBreve, directors });

  let copy: string;
  try {
    copy = await generateChatCompletion({ system: systemPrompt, user: userPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generando el copy." },
      { status: 502 }
    );
  }

  const updated = await saveGeneratedCopy({
    item: { ...item, platform, pilar, director_ids: directorIds, idea_breve: ideaBreve },
    copy,
    brandBibleVersionId: brandBible.id,
  });

  return NextResponse.json({ item: updated });
}
