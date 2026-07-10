-- Bucket publico (solo lectura publica) donde se mirror-ean las imagenes
-- generadas por Higgsfield para que no dependan de una URL externa que
-- puede expirar. La escritura solo ocurre desde el servidor (service role),
-- nunca desde el cliente.
insert into storage.buckets (id, name, public)
values ('content-creatives', 'content-creatives', true)
on conflict (id) do nothing;

create policy if not exists "content-creatives public read"
  on storage.objects for select
  using (bucket_id = 'content-creatives');
