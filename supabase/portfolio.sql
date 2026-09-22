-- Run in a dedicated Supabase project SQL editor. No private source data here.
begin;
create table if not exists public.portfolio_owners (
  user_id uuid primary key references auth.users(id)
);
alter table public.portfolio_owners enable row level security;
revoke all on public.portfolio_owners from anon, authenticated;
grant select on public.portfolio_owners to authenticated;

create or replace function public.is_portfolio_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt()->'app_metadata'->>'provider' = 'google', false)
    and exists (
      select 1 from public.portfolio_owners o
      join auth.users u on u.id = o.user_id
      join auth.identities i on i.user_id = u.id
      where o.user_id = auth.uid()
        and u.email = 'unistudio@yeongungod.com' and u.email_confirmed_at is not null
        and i.provider = 'google'
        and i.identity_data->>'email' = 'unistudio@yeongungod.com'
        and i.identity_data->>'email_verified' = 'true'
    );
$$;
revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to authenticated;
drop policy if exists owner_read on public.portfolio_owners;
create policy owner_read on public.portfolio_owners for select to authenticated
using (user_id = auth.uid() and public.is_portfolio_owner());

create table if not exists public.portfolio_drafts (
  owner_id uuid primary key references public.portfolio_owners(user_id),
  revision bigint not null check (revision > 0),
  document jsonb not null check (octet_length(document::text) <= 2097152),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_drafts enable row level security;
revoke all on public.portfolio_drafts from anon, authenticated;
grant select on public.portfolio_drafts to authenticated;
drop policy if exists draft_read on public.portfolio_drafts;
create policy draft_read on public.portfolio_drafts for select to authenticated
using (owner_id = auth.uid() and public.is_portfolio_owner());

create or replace function public.save_portfolio(expected_revision bigint, document jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare next_revision bigint;
begin
  if not public.is_portfolio_owner() then raise insufficient_privilege; end if;
  if jsonb_typeof(document->'items') is distinct from 'array'
    or coalesce(document->>'base', '') !~ '^[0-9a-f]{64}$'
    or octet_length(document::text) > 2097152 then raise exception 'Invalid draft'; end if;
  if jsonb_array_length(document->'items') > 500 then raise exception 'Too many items'; end if;
  if expected_revision = 0 then
    insert into public.portfolio_drafts(owner_id, revision, document)
      values(auth.uid(), 1, document) on conflict do nothing returning revision into next_revision;
  else
    update public.portfolio_drafts d set document = save_portfolio.document,
      revision = d.revision + 1, updated_at = now()
      where d.owner_id = auth.uid() and d.revision = expected_revision returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'Draft changed; reload first'; end if;
  return next_revision;
end;
$$;
revoke all on function public.save_portfolio(bigint, jsonb) from public;
grant execute on function public.save_portfolio(bigint, jsonb) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-private', 'portfolio-private', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 8388608,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists portfolio_image_read on storage.objects;
drop policy if exists portfolio_image_insert on storage.objects;
create policy portfolio_image_read on storage.objects for select to authenticated
using (bucket_id = 'portfolio-private' and (storage.foldername(name))[1] = auth.uid()::text and public.is_portfolio_owner());
create policy portfolio_image_insert on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-private' and (storage.foldername(name))[1] = auth.uid()::text and public.is_portfolio_owner());
-- No update/delete policy: uploaded keys are immutable between review and publish.
-- Empty owner table denies everyone. Register only the verified Google user's UUID.
commit;
