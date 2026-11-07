-- CUTTING CREW Barbershop: painel dos barbeiros (Supabase).
-- Correr UMA vez em Supabase > SQL Editor > New query > Run. Ver README.md, secção "Painel dos barbeiros".
-- Segurança: cada barbeiro só consegue ler e alterar o SEU perfil, as SUAS fotos e a SUA pasta de ficheiros.
-- Os links de marcação do Fresha não estão aqui: ficam no código e ninguém os altera pelo painel.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  member_id text not null unique,
  nome text check (nome is null or char_length(nome) between 1 and 40),
  funcao text check (funcao is null or char_length(funcao) <= 40),
  bio text check (bio is null or char_length(bio) <= 600),
  instagram text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  avatar_path text check (avatar_path is null or avatar_path like id::text || '/%'),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  path text not null check (path like profile_id::text || '/%'),
  legenda text check (legenda is null or char_length(legenda) <= 120),
  -- O barbeiro confirma, ao enviar, que tem autorização das pessoas que aparecem na foto.
  consentimento boolean not null check (consentimento),
  -- Só o responsável (pelo painel do Supabase) pode esconder uma foto do site.
  visivel boolean not null default true,
  criado_em timestamptz not null default now()
);
create index if not exists photos_profile_idx on public.photos (profile_id, criado_em desc);

alter table public.profiles enable row level security;
alter table public.photos enable row level security;

-- Perfis: leitura pública; cada barbeiro só altera o seu e só estes campos. Perfis criam-se pelo responsável (SQL abaixo).
drop policy if exists profiles_leitura on public.profiles;
create policy profiles_leitura on public.profiles for select using (true);
drop policy if exists profiles_atualizar on public.profiles;
create policy profiles_atualizar on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (nome, funcao, bio, instagram, avatar_path, atualizado_em) on public.profiles to authenticated;

-- Fotos: o público vê as visíveis; o dono vê e gere as suas (máximo 24 por barbeiro).
drop policy if exists photos_leitura on public.photos;
create policy photos_leitura on public.photos for select using (visivel or profile_id = auth.uid());
drop policy if exists photos_inserir on public.photos;
create policy photos_inserir on public.photos for insert to authenticated
  with check (
    profile_id = auth.uid()
    and visivel
    and (select count(*) from public.photos p where p.profile_id = auth.uid()) < 24
  );
drop policy if exists photos_atualizar on public.photos;
create policy photos_atualizar on public.photos for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists photos_apagar on public.photos;
create policy photos_apagar on public.photos for delete to authenticated using (profile_id = auth.uid());
revoke insert, update, delete on public.photos from anon, authenticated;
grant select on public.photos to anon, authenticated;
grant insert (profile_id, path, legenda, consentimento) on public.photos to authenticated;
grant update (legenda) on public.photos to authenticated;
grant delete on public.photos to authenticated;

-- Ficheiros: balde público para leitura; cada barbeiro só escreve na pasta com o seu id. Máx. 2 MB por imagem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('perfis', 'perfis', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists perfis_ver_proprios on storage.objects;
create policy perfis_ver_proprios on storage.objects for select to authenticated
  using (bucket_id = 'perfis' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists perfis_enviar on storage.objects;
create policy perfis_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'perfis' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists perfis_apagar on storage.objects;
create policy perfis_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'perfis' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------------------------
-- DEPOIS de criares cada utilizador em Authentication > Users (Add user, com "Auto Confirm User"),
-- liga-o a um barbeiro. Troca o email e o member_id (almeida, ruben, hiago ou cutting-gu):
--
-- insert into public.profiles (id, member_id)
-- select id, 'hiago' from auth.users where email = 'email-do-hiago@exemplo.com';
-- ---------------------------------------------------------------------------------------------
