-- Hasta 4 fotos de referencia por director (cara, cuerpo completo, otros
-- angulos), enviadas a Gemini como imagenes separadas en vez de una sola
-- "character sheet" en grilla (eso confunde al modelo, que tiende a
-- replicar el formato de grilla en la salida).
alter table directors
  drop column if exists reference_image_url,
  add column if not exists reference_image_urls text[] not null default '{}';
