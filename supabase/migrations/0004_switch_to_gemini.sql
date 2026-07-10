-- Higgsfield no ofrece API key de autoservicio (requiere pedirla a
-- Enterprise). Se reemplaza el generador de creativos por Gemini 2.5 Flash
-- Image ("Nano Banana"), que si tiene API key de autoservicio y es fuerte en
-- consistencia de personaje via imagen de referencia (en vez de un
-- "Character ID" de texto).

alter table directors
  drop column if exists higgsfield_character_id,
  add column if not exists reference_image_url text;

alter table content_items
  drop column if exists higgsfield_request_id;
