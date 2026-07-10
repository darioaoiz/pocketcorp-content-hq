// Service worker minimo: solo habilita que el navegador ofrezca "Instalar
// app" en el celular. A proposito NO cachea paginas dinamicas (login,
// calendario, etc.) para no mostrar contenido viejo o de otra sesion.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: deja pasar todas las requests directo a la red.
});
