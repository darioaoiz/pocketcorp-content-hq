import type { DirectorRow, Platform } from "@/types/database";
import { PLATFORM_LABEL } from "./prompt";

export function buildAnglesSystemPrompt(brandBibleText: string): string {
  return `Sos el estratega de contenido interno de PocketCorp, escribiendo para Yuju (la agencia que gestiona su marketing).

Tu UNICA fuente de verdad sobre PocketCorp es el Brand Bible completo que te paso a continuacion. No existe ningun otro conocimiento valido sobre PocketCorp.

${brandBibleText}

TU TAREA: proponer exactamente 3 ideas concretas y distintas entre si para un post, dado el pilar de contenido y la plataforma indicados mas abajo. El usuario que va a elegir una de estas 3 ideas no sabe nada de marketing ni de redes — es justamente por eso que usa este servicio. Tu trabajo es pensar por el: dale opciones ya armadas y listas para usar, nunca le pidas que el invente el angulo.

VARIEDAD: las 3 ideas tienen que sentirse realmente distintas entre si (no variaciones de lo mismo). Pensa en enfoques distintos — por ejemplo: una que parta de un problema cotidiano del publico objetivo, una que use una comparacion o contraste simple, una que apele a la curiosidad o a un dato/beneficio concreto del Brand Bible. No nombres ni expliques la tecnica en el resultado, solo aplicala.

REGLA CRITICA DE LENGUAJE: nunca uses jerga tecnica de marketing o negocios (nada de "copy", "friccion", "lead", "conversion", "funnel", "engagement", "CTA", "call to action", "target", "customer journey", "pain point", "propuesta de valor", "awareness" ni equivalentes). Lenguaje simple y cotidiano, como si un emprendedor le explicara la idea a otro.

REGLAS INQUEBRANTABLES:
1. Nunca inventes cifras, estadisticas, testimonios, nombres de clientes, resultados o promesas que no esten explicitamente en el Brand Bible de arriba.
2. Respeta estrictamente la seccion de "Prohibiciones explicitas" del Brand Bible.
3. Segui el tono y la voz descritos en la seccion "Voz y tono".

FORMATO DE SALIDA: devolves SOLO un array JSON valido, sin texto antes ni despues, sin bloques de codigo markdown, con exactamente 3 elementos y esta forma exacta:
[{"title": "titulo corto de 3 a 6 palabras", "description": "1 a 2 frases explicando de que trataria el post, en lenguaje simple"}, ...]`;
}

export function buildAnglesUserPrompt(params: {
  platform: Platform;
  pilar: string;
  directors: DirectorRow[];
}): string {
  const { platform, pilar, directors } = params;
  const directorLine =
    directors.length > 0
      ? `Director(es) protagonista(s) de esta pieza: ${directors.map((d) => `${d.name}${d.role ? ` (${d.role})` : ""}`).join(", ")}. Si es natural, alguna de las ideas puede darle protagonismo a este personaje.`
      : "Esta pieza no tiene un director protagonista asignado todavia.";

  return `Plataforma: ${PLATFORM_LABEL[platform]}
Pilar de contenido: ${pilar}
${directorLine}

Proponeme 3 ideas de post distintas para esta plataforma y este pilar.`;
}
