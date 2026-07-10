import type { ContentEstado } from "@/types/database";

export class InvalidTransitionError extends Error {
  constructor(action: string, from: ContentEstado, required: ContentEstado[]) {
    super(`No se puede "${action}" desde el estado "${from}". Se requiere estar en: ${required.join(" o ")}.`);
    this.name = "InvalidTransitionError";
  }
}

/**
 * Unico lugar del codigo que decide que transiciones de estado son validas.
 * En particular: 'aprobado' SOLO se alcanza vía assertCanApprove, que exige
 * estar en 'pendiente_aprobacion' — nunca se fija automaticamente en ningun
 * otro flujo (generar copy, generar creativo, webhooks, etc).
 */
export function assertCanGenerateCopy(estado: ContentEstado): void {
  if (estado === "aprobado") {
    throw new InvalidTransitionError("generar copy", estado, ["borrador", "copy_generado", "creativo_generado", "pendiente_aprobacion"]);
  }
}

export function assertCanGenerateCreative(estado: ContentEstado, hasCopy: boolean): void {
  if (estado === "aprobado") {
    throw new InvalidTransitionError("generar creativo", estado, ["copy_generado", "creativo_generado", "pendiente_aprobacion"]);
  }
  if (!hasCopy) {
    throw new Error("Genera el copy antes de generar el creativo.");
  }
}

export function assertCanSendForApproval(estado: ContentEstado): void {
  if (estado !== "creativo_generado") {
    throw new InvalidTransitionError("enviar a aprobacion", estado, ["creativo_generado"]);
  }
}

export function assertCanApprove(estado: ContentEstado): void {
  if (estado !== "pendiente_aprobacion") {
    throw new InvalidTransitionError("aprobar", estado, ["pendiente_aprobacion"]);
  }
}

export function nextEstadoAfterCopy(current: ContentEstado): ContentEstado {
  return current === "borrador" ? "copy_generado" : current;
}

export function nextEstadoAfterCreative(current: ContentEstado): ContentEstado {
  return current === "copy_generado" ? "creativo_generado" : current;
}
