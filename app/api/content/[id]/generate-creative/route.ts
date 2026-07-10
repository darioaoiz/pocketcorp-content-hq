import { NextResponse } from "next/server";
import { requireApiSession, isSession } from "@/lib/api-session";
import { getContentItem, saveGeneratedCreative, setCreativeJobStatus, assertCreativeCanStart } from "@/lib/content/data";
import { getDirectorsByIds } from "@/lib/directors/data";
import { buildImagePrompt } from "@/lib/imagegen/prompt";
import { generateImage } from "@/lib/imagegen/client";
import { getGeminiRatio } from "@/lib/imagegen/formats";
import { DEFAULT_VISUAL_STYLE } from "@/lib/imagegen/default-style";
import { fetchImageAsBase64, uploadGeneratedImage } from "@/lib/supabase/storage";
import { getCurrentBrandBible } from "@/lib/brand-bible/data";

export async function POST(request: Request, ctx: RouteContext<"/api/content/[id]/generate-creative">) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await ctx.params;
  const item = await getContentItem(id);
  if (!item) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { formatId?: string };
  const aspectRatio = getGeminiRatio(body.formatId ?? "");

  try {
    await assertCreativeCanStart(item);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Transicion invalida." }, { status: 409 });
  }

  const directors = await getDirectorsByIds(item.director_ids);
  const primaryDirector = directors[0] ?? null;

  const referenceImages: { base64: string; mimeType: string }[] = [];
  for (const url of primaryDirector?.reference_image_urls ?? []) {
    try {
      referenceImages.push(await fetchImageAsBase64(url));
    } catch {
      // seguimos con las demas referencias en vez de romper la generacion
    }
  }

  const brandBible = await getCurrentBrandBible();
  const visualStyle = brandBible?.visual_style?.trim() || DEFAULT_VISUAL_STYLE;

  const prompt = buildImagePrompt({
    visualStyle,
    copy: item.copy ?? "",
    pilar: item.pilar,
    director: primaryDirector,
    referenceImageCount: referenceImages.length,
  });

  try {
    const generated = await generateImage({ prompt, referenceImages, aspectRatio });
    const { publicUrl, storagePath } = await uploadGeneratedImage({
      base64Data: generated.base64Data,
      mimeType: generated.mimeType,
      contentItemId: id,
    });
    const updated = await saveGeneratedCreative({ item, imageUrl: publicUrl, imageStoragePath: storagePath });
    return NextResponse.json({ status: "completed", item: updated });
  } catch (err) {
    await setCreativeJobStatus(id, "failed");
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generando el creativo." },
      { status: 502 }
    );
  }
}
