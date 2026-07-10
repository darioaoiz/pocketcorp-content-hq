"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalable de todas formas via "Agregar a pantalla de inicio"; el
        // SW es un extra, no bloqueante si falla el registro.
      });
    }
  }, []);

  return null;
}
