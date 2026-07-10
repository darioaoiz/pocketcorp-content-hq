import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PocketCorp Content HQ",
    short_name: "Content HQ",
    description: "Estrategia y contenido de redes sociales para PocketCorp.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F5",
    theme_color: "#FF4F12",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
