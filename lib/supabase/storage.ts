import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "content-creatives";

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  return "png";
}

/** Sube el resultado (base64) de la generacion de imagen al bucket publico. */
export async function uploadGeneratedImage(params: {
  base64Data: string;
  mimeType: string;
  contentItemId: string;
}): Promise<{ publicUrl: string; storagePath: string }> {
  const { base64Data, mimeType, contentItemId } = params;
  const bytes = Buffer.from(base64Data, "base64");
  const storagePath = `${contentItemId}/${Date.now()}.${extensionForMimeType(mimeType)}`;

  const supabase = getSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: mimeType, upsert: true });

  if (uploadError) {
    throw new Error(`No se pudo guardar la imagen en Supabase Storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

/** Sube una foto de referencia (slot 0-3) de un director (para consistencia de personaje). */
export async function uploadDirectorReferenceImage(params: {
  file: File;
  directorId: string;
  slot: number;
}): Promise<string> {
  const { file, directorId, slot } = params;
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || "image/png";
  const storagePath = `directors/${directorId}/${slot}-${Date.now()}.${extensionForMimeType(mimeType)}`;

  const supabase = getSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    throw new Error(`No se pudo guardar la imagen de referencia: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Descarga una URL externa y la vuelve a codificar en base64 (para pasarla como referencia a Gemini). */
export async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar la imagen de referencia (${res.status})`);
  const mimeType = res.headers.get("content-type") ?? "image/png";
  const arrayBuffer = await res.arrayBuffer();
  return { base64: Buffer.from(arrayBuffer).toString("base64"), mimeType };
}
