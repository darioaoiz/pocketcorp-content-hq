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
      ? `Main character: ${director.name}${director.role ? `, ${director.role}` : ""}. ${referenceImageCount} reference image(s) of this character are attached (different angles/crops of the SAME person) — use them ONLY to copy identity: face, hairstyle, proportions, outfit. They are not a menu of options: output exactly ONE character in ONE pose, never a grid or multiple copies, redrawn in the style described above. Use accent color ${director.color_hex} on the character's outfit or on a graphic accent element (badge, speech bubble border, offset shadow) to tie them to their brand color.`
      : `Main character: ${director.name}${director.role ? `, ${director.role}` : ""}. No reference image available yet — design a consistent corporate-styled character (a single person, one pose) in the style described above. Use accent color ${director.color_hex} on the character's outfit or on a graphic accent element.`
    : "No specific character required — focus on the photographic scene and graphic accents, still following the style described above.";

  const contextLine = `Content pillar: ${pilar}. This is the FULL social post copy, given only so you understand the topic/mood — do NOT attempt to render this text (or any long excerpt of it) inside the image, remember the 4-6 word max text rule from the style instructions above: "${copy.slice(0, 300)}"`;

  return [
    `Illustration style and technique — follow this EXACTLY, it is non-negotiable brand identity:\n${visualStyle}`,
    directorLine,
    contextLine,
  ].join("\n\n");
}
