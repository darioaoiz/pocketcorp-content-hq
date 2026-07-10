// Formatos de salida ofrecidos en la UI. El "geminiRatio" es el valor que
// entiende la API de Gemini (image_config.aspect_ratio); no siempre coincide
// exacto con el pixel-perfect de cada red porque Gemini solo acepta un set
// fijo de relaciones — usamos la mas cercana.
export interface ImageFormat {
  id: string;
  label: string;
  geminiRatio: string;
}

export const IMAGE_FORMATS: ImageFormat[] = [
  { id: "feed_vertical", label: "Feed vertical — 4:5 (1080×1350)", geminiRatio: "4:5" },
  { id: "square", label: "Cuadrado — 1:1 (1080×1080)", geminiRatio: "1:1" },
  { id: "stories", label: "Stories / Reels — 9:16 (1080×1920)", geminiRatio: "9:16" },
  { id: "horizontal", label: "Horizontal — 16:9 aprox. (feed apaisado / LinkedIn 1200×627)", geminiRatio: "16:9" },
];

export const DEFAULT_IMAGE_FORMAT_ID = "feed_vertical";

export function getGeminiRatio(formatId: string): string {
  return IMAGE_FORMATS.find((f) => f.id === formatId)?.geminiRatio ?? "4:5";
}
