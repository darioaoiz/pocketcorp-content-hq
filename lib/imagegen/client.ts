// Generador de creativos: Gemini 3.1 Flash Image ("Nano Banana 2"). Se
// eligio en vez de Higgsfield porque Higgsfield no ofrece API key de
// autoservicio (hay que pedirla a su equipo de Enterprise). Gemini si tiene
// key gratis en https://aistudio.google.com/apikey y buena consistencia de
// personaje pasando una imagen de referencia junto con el prompt.
// Nano Banana 2 (vs. la version anterior 2.5) mejora especificamente eso:
// consistencia de personaje entre generaciones.

const MODEL = "gemini-3.1-flash-image-preview";

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY no esta configurado.");
    this.name = "GeminiNotConfiguredError";
  }
}

export interface GeneratedImage {
  base64Data: string;
  mimeType: string;
}

export async function generateImage(params: {
  prompt: string;
  referenceImages?: { base64: string; mimeType: string }[];
  aspectRatio?: string;
}): Promise<GeneratedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiNotConfiguredError();

  const parts: Array<Record<string, unknown>> = [{ text: params.prompt }];
  for (const ref of params.referenceImages ?? []) {
    parts.push({ inline_data: { mime_type: ref.mimeType, data: ref.base64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: params.aspectRatio ?? "4:5" },
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini respondio ${res.status} al generar la imagen: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
  };

  const imagePart = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini no devolvio ninguna imagen (puede haber bloqueado el prompt).");
  }

  return {
    base64Data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
  };
}
