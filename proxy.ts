import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Chequeo optimista (solo lee/verifica la cookie firmada, sin ir a la base
// de datos) — la autorizacion real se vuelve a validar en cada server
// action / route handler via requireSession().
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// El manifest, el service worker y los iconos deben quedar accesibles sin
// sesion: Chrome evalua la instalabilidad de la PWA (y el propio SW) antes
// de que haya login, y un redirect a /login en esas requests rompe el
// criterio de instalacion ("Agregar app" nunca aparece, solo "acceso directo").
export const config = {
  matcher: [
    "/((?!login|api/auth/login|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon.png|icon-192.png|icon-512.png|icon-maskable.png|logo-pocketcorp.png).*)",
  ],
};
