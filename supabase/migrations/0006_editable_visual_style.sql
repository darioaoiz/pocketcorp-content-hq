-- El "prompt maestro" de estilo visual pasa a ser un campo editable del
-- Brand Bible (antes vivia hardcodeado en el codigo, invisible para el
-- usuario). Se versiona igual que el resto del Brand Bible.
alter table brand_bible_versions
  add column if not exists visual_style text not null default '';

create or replace function create_brand_bible_version(
  p_identity text,
  p_offering text,
  p_target_audience text,
  p_voice_tone text,
  p_content_pillars text[],
  p_prohibitions text[],
  p_raw_notes text,
  p_visual_style text
) returns brand_bible_versions as $$
declare
  next_version integer;
  new_row brand_bible_versions;
begin
  update brand_bible_versions set is_current = false where is_current = true;

  select coalesce(max(version_number), 0) + 1 into next_version from brand_bible_versions;

  insert into brand_bible_versions (
    version_number, identity, offering, target_audience, voice_tone,
    content_pillars, prohibitions, raw_notes, visual_style, is_current
  )
  values (
    next_version, p_identity, p_offering, p_target_audience, p_voice_tone,
    p_content_pillars, p_prohibitions, p_raw_notes, p_visual_style, true
  )
  returning * into new_row;

  return new_row;
end;
$$ language plpgsql;
