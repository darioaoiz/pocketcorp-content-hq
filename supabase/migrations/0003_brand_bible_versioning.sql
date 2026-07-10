-- Guardar el Brand Bible = crear una version nueva y marcarla vigente.
-- Se hace con una funcion (transaccion implicita) para no violar nunca el
-- indice unico parcial que garantiza una sola fila con is_current = true.
create or replace function create_brand_bible_version(
  p_identity text,
  p_offering text,
  p_target_audience text,
  p_voice_tone text,
  p_content_pillars text[],
  p_prohibitions text[],
  p_raw_notes text
) returns brand_bible_versions as $$
declare
  next_version integer;
  new_row brand_bible_versions;
begin
  update brand_bible_versions set is_current = false where is_current = true;

  select coalesce(max(version_number), 0) + 1 into next_version from brand_bible_versions;

  insert into brand_bible_versions (
    version_number, identity, offering, target_audience, voice_tone,
    content_pillars, prohibitions, raw_notes, is_current
  )
  values (
    next_version, p_identity, p_offering, p_target_audience, p_voice_tone,
    p_content_pillars, p_prohibitions, p_raw_notes, true
  )
  returning * into new_row;

  return new_row;
end;
$$ language plpgsql;
