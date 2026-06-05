-- US-005 review follow-up: keep individual kit timestamps current on updates.

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_kits_updated_at on public.kits;

create trigger set_kits_updated_at
  before update on public.kits
  for each row
  execute function private.set_updated_at();
