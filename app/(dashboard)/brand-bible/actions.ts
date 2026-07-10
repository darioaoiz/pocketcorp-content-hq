"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createBrandBibleVersion } from "@/lib/brand-bible/data";

export interface SaveBrandBibleState {
  error: string | null;
  success: boolean;
}

function splitLines(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function saveBrandBibleAction(
  _prevState: SaveBrandBibleState,
  formData: FormData
): Promise<SaveBrandBibleState> {
  await requireSession();

  try {
    await createBrandBibleVersion({
      identity: String(formData.get("identity") ?? "").trim(),
      offering: String(formData.get("offering") ?? "").trim(),
      target_audience: String(formData.get("target_audience") ?? "").trim(),
      voice_tone: String(formData.get("voice_tone") ?? "").trim(),
      content_pillars: splitLines(formData.get("content_pillars")),
      prohibitions: splitLines(formData.get("prohibitions")),
      raw_notes: String(formData.get("raw_notes") ?? "").trim() || null,
      visual_style: String(formData.get("visual_style") ?? "").trim(),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido.", success: false };
  }

  revalidatePath("/brand-bible");
  return { error: null, success: true };
}
