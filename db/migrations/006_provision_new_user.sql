-- 006_provision_new_user.sql

create or replace function provision_new_user()
returns trigger as $$
declare
  new_user_id integer;
begin
  insert into app_user (auth_id, email, full_name, record_status)
  values (
    new.id,
    new.email,
    coalesce(new.user_metadata ->> 'full_name', new.email),
    'INACTIVE'
  )
  on conflict (email) do update
    set auth_id = excluded.auth_id
  returning id into new_user_id;

  insert into user_module (user_id, module_id)
  select new_user_id, id from app_module
  on conflict do nothing;

  insert into user_module_rights (user_module_id, rights_id, can)
  select um.id, r.id,
    case
      when m.code = 'Sales_Mod' and r.code = 'SALES_VIEW' then true
      when m.code = 'Sales_Mod' and r.code in ('SALES_ADD', 'SALES_EDIT', 'SALES_DEL') then false
      when m.code = 'SD_Mod' and r.code = 'SD_VIEW' then true
      when m.code = 'SD_Mod' and r.code in ('SD_ADD', 'SD_EDIT', 'SD_DEL') then false
      when m.code = 'Lookup_Mod' and r.code in ('CUST_LOOKUP', 'EMP_LOOKUP', 'PROD_LOOKUP', 'PRICE_LOOKUP') then true
      when m.code = 'Adm_Mod' and r.code = 'ADM_USER' then false
      else false
    end
  from user_module um
  join app_module m on m.id = um.module_id
  join rights r on (
       (m.code = 'Sales_Mod' and r.code in ('SALES_VIEW', 'SALES_ADD', 'SALES_EDIT', 'SALES_DEL'))
    or (m.code = 'SD_Mod' and r.code in ('SD_VIEW', 'SD_ADD', 'SD_EDIT', 'SD_DEL'))
    or (m.code = 'Lookup_Mod' and r.code in ('CUST_LOOKUP', 'EMP_LOOKUP', 'PROD_LOOKUP', 'PRICE_LOOKUP'))
    or (m.code = 'Adm_Mod' and r.code = 'ADM_USER')
  )
  where um.user_id = new_user_id
  on conflict do nothing;

  return new;
end;
$$ language plpgsql;

create trigger provision_new_user_trigger
after insert on auth.users
for each row
execute procedure provision_new_user();
