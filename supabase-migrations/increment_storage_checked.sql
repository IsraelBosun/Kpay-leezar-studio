create or replace function increment_storage_checked(
  p_studio_id uuid,
  p_bytes bigint,
  p_limit bigint
)
returns boolean
language plpgsql
as $$
declare
  current_bytes bigint;
begin
  select coalesce(storage_used_bytes, 0)
  into current_bytes
  from studios
  where id = p_studio_id
  for update;

  if current_bytes + p_bytes > p_limit then
    return false;
  end if;

  update studios
  set storage_used_bytes = current_bytes + p_bytes
  where id = p_studio_id;

  return true;
end;
$$;
