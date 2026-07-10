import type { DirectorRow } from "@/types/database";

export function buildImagePrompt(params: {
  visualStyle: string;
  copy: string;
  pilar: string;
  director: DirectorRow | null;
  referenceImageCount: number;
}): string {
  const { visualStyle, copy, pilar, director, referenceImageCount } = params;

  const directorLine = director
    ? referenceImageCount > 0
      ? `Main character: ${director.name}${director.role ? `, ${director.role}` : ""}. ${referenceImageCount} reference image(s) of this character are attached (different angles/crops of the same person) — treat them as reference photos ONLY, to copy the face, hairstyle, proportions and outfit. Do NOT reproduce them as a grid/collage/sheet — output a single normal scene with one character, redrawn in the style described above. Use accent color ${director.color_hex} on the character's outfit or on a graphic accent element (badge, speech bubble border, offset shadow) to tie them to their brand color.`
      : `Main character: ${director.name}${director.role ? `, ${director.role}` : ""}. No reference image available yet — design a consistent corporate-styled character in the style described above. Use accent color ${director.color_hex} on the character's outfit or on a graphic accent element.`
    : "No specific character required — focus on the photographic scene and graphic accents, still following the style described above.";

  const contextLine = `Content pillar: ${pilar}. Visual context derived from this social post copy: "${copy.slice(0, 500)}"`;

  return [
    `Illustration style and technique — follow this EXACTLY, it is non-negotiable brand identity:\n${visualStyle}`,
    directorLine,
    contextLine,
  ].join("\n\n");
}
