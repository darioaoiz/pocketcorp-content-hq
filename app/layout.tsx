import type { Metadata, Viewport } from "next";
import { Archivo, Anton, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo-raw",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const anton = Anton({
  variable: "--font-anton-raw",
  subsets: ["latin"],
  weight: ["400"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono-raw",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PocketCorp Content HQ",
  description: "Estrategia y contenido de redes sociales para PocketCorp — herramienta interna de Yuju.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Content HQ",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF4F12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${anton.variable} ${hankenGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
