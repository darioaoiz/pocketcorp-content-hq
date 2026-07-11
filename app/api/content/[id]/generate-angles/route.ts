import { NextResponse } from "next/server";
import { requireApiSession, isSession } from "@/lib/api-session";
import { getContentItem } from "@/lib/content/data";
import { getCurrentBrandBible, formatBrandBibleForPrompt } from "@/lib/brand-bible/data";
import { getDirectorsByIds } from "@/lib/directors/data";
import { buildAnglesSystemPrompt, buildAnglesUserPrompt } from "@/lib/llm/angles-prompt";
import { generateChatCompletion } from "@/lib/llm/openrouter";
import type { Platform } from "@/types/database";

interface ContentAngle {
  title: string;
  description: string;
}

function parseAngles(raw: string): ContentAngle[] {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("La respuesta no es un array.");
  return parsed.map((a) => ({
    title: String(a.title ?? "").trim(),
    description: String(a.description ?? "").trim(),
  }));
}

export async function POST(request: Request, ctx: RouteContext<"/api/content/[id]/generate-angles">) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await ctx.params;
  const item = await getContentItem(id);
  if (!item) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });

  const brandBible = await getCurrentBrandBible();
  if (!brandBible) {
    return NextResponse.json(
      { error: "No hay un Brand Bible configurado todavia. Completálo en /brand-bible antes de generar ideas." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    platform?: Platform;
    pilar?: string;
    directorIds?: string[];
  };

  const platform = body.platform ?? item.platform;
  const pilar = (body.pilar ?? item.pilar ?? "").trim();
  const directorIds = body.directorIds ?? item.director_ids;

  if (!pilar) return NextResponse.json({ error: "Elegi un pilar de contenido antes de pedir ideas." }, { status: 400 });

  const directors = await getDirectorsByIds(directorIds);
  const systemPrompt = buildAnglesSystemPrompt(formatBrandBibleForPrompt(brandBible));
  const userPrompt = buildAnglesUserPrompt({ platform, pilar, directors });

  let raw: string;
  try {
    raw = await generateChatCompletion({ system: systemPrompt, user: userPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generando ideas." },
      { status: 502 }
    );
  }

  let angles: ContentAngle[];
  try {
    angles = parseAngles(raw);
  } catch {
    return NextResponse.json({ error: "No pudimos generar ideas, intenta de nuevo." }, { status: 502 });
  }

  return NextResponse.json({ angles });
}
