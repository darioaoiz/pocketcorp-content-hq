export class OpenRouterNotConfiguredError extends Error {
  constructor() {
    super("OPENROUTER_API_KEY no esta configurado.");
    this.name = "OpenRouterNotConfiguredError";
  }
}

export async function generateChatCompletion(params: {
  system: string;
  user: string;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new OpenRouterNotConfiguredError();

  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "PocketCorp Content HQ",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter respondio ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter no devolvio contenido.");
  return content.trim();
}
