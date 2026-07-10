import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth/session";

/** Para usar en Route Handlers: nunca redirige, devuelve 401 JSON si no hay sesion. */
export async function requireApiSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  return session;
}

export function isSession(value: SessionPayload | NextResponse): value is SessionPayload {
  return !(value instanceof NextResponse);
}
