import type { NextConfig } from "next";

function supabaseStorageHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseStorageHostname();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default de Next.js es 1MB; las fotos de referencia de los
      // directores (subidas via server action) necesitan mas margen.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
