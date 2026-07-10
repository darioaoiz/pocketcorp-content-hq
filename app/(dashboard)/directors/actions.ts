"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { updateDirector } from "@/lib/directors/data";
import { uploadDirectorReferenceImage } from "@/lib/supabase/storage";
import { MAX_REFERENCE_IMAGES } from "@/lib/directors/constants";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface UpdateDirectorState {
  error: string | null;
  success: boolean;
}

export async function updateDirectorAction(
  _prevState: UpdateDirectorState,
  formData: FormData
): Promise<UpdateDirectorState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "").trim() || null;
  const colorHex = String(formData.get("color_hex") ?? "").trim();

  if (!id) return { error: "Falta el director.", success: false };
  if (!HEX_RE.test(colorHex)) return { error: "El color debe ser un hex valido, ej: #FF4F12", success: false };

  try {
    const slots: (string | null)[] = [];

    for (let slot = 0; slot < MAX_REFERENCE_IMAGES; slot++) {
      const removed = String(formData.get(`remove_reference_${slot}`) ?? "") === "1";
      const file = formData.get(`reference_image_${slot}`);
      const existingUrl = String(formData.get(`existing_url_${slot}`) ?? "") || null;

      if (removed) {
        slots.push(null);
      } else if (file instanceof File && file.size > 0) {
        slots.push(await uploadDirectorReferenceImage({ file, directorId: id, slot }));
      } else {
        slots.push(existingUrl);
      }
    }

    const referenceImageUrls = slots.filter((url): url is string => Boolean(url));

    await updateDirector(id, { role, color_hex: colorHex, reference_image_urls: referenceImageUrls });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido.", success: false };
  }

  revalidatePath("/directors");
  return { error: null, success: true };
}
