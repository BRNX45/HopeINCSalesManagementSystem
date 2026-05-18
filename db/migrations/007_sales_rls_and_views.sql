-- 007_sales_rls_and_views.sql

-- Helper functions for user rights resolution
create or replace function current_app_user_id()
returns integer language sql stable as $$
  select id from app_user where auth_id = auth.uid();
$$;

create or replace function has_user_right(right_code text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from app_user au
    join user_module um on um.user_id = au.id
    join user_module_rights umr on umr.user_module_id = um.id
    join rights r on r.id = umr.rights_id
    where au.auth_id = auth.uid()
      and umr.can
      and r.code = right_code
  );
$$;

create or replace function is_admin_user()
returns boolean language sql stable as $$
  select has_user_right('ADM_USER');
$$;

-- Sales RLS policies
alter table sales enable row level security;

create policy sales_select_policy on sales
  for select
  using (
    auth.role() = 'authenticated'
    and (
      is_admin_user()
      or (has_user_right('SALES_VIEW') and record_status = 'ACTIVE')
    )
  );

create policy sales_insert_policy on sales
  for insert
  with check (
    is_admin_user() or has_user_right('SALES_ADD')
  );

create policy sales_update_policy on sales
  for update
  using (
    auth.role() = 'authenticated'
    and (
      has_user_right('SALES_EDIT')
      or (record_status = 'ACTIVE' and has_user_right('SALES_DEL'))
      or (record_status = 'INACTIVE' and is_admin_user())
    )
  )
  with check (
    (
      new.record_status = old.record_status
      and has_user_right('SALES_EDIT')
    )
    or (
      old.record_status = 'ACTIVE'
      and new.record_status = 'INACTIVE'
      and has_user_right('SALES_DEL')
    )
    or (
      old.record_status = 'INACTIVE'
      and new.record_status = 'ACTIVE'
      and is_admin_user()
    )
  );

-- Sales detail RLS policies
alter table salesdetail enable row level security;

create policy salesdetail_select_policy on salesdetail
  for select
  using (
    auth.role() = 'authenticated'
    and (
      is_admin_user()
      or (has_user_right('SD_VIEW') and record_status = 'ACTIVE')
    )
  );

create policy salesdetail_insert_policy on salesdetail
  for insert
  with check (
    is_admin_user() or has_user_right('SD_ADD')
  );

create policy salesdetail_update_policy on salesdetail
  for update
  using (
    auth.role() = 'authenticated'
    and (
      has_user_right('SD_EDIT')
      or (record_status = 'ACTIVE' and has_user_right('SD_DEL'))
      or (record_status = 'INACTIVE' and is_admin_user())
    )
  )
  with check (
    (
      new.record_status = old.record_status
      and has_user_right('SD_EDIT')
    )
    or (
      old.record_status = 'ACTIVE'
      and new.record_status = 'INACTIVE'
      and has_user_right('SD_DEL')
    )
    or (
      old.record_status = 'INACTIVE'
      and new.record_status = 'ACTIVE'
      and is_admin_user()
    )
  );

-- Lookup tables: select only for authenticated users, no write access policies are created
alter table customer enable row level security;
create policy customer_select_policy on customer
  for select
  using (auth.role() = 'authenticated');

alter table employee enable row level security;
create policy employee_select_policy on employee
  for select
  using (auth.role() = 'authenticated');

alter table product enable row level security;
create policy product_select_policy on product
  for select
  using (auth.role() = 'authenticated');

alter table pricehist enable row level security;
create policy pricehist_select_policy on pricehist
  for select
  using (auth.role() = 'authenticated');

-- Cascade soft delete and recovery from sales to salesdetail
create or replace function sales_record_status_cascade()
returns trigger language plpgsql as $$
begin
  if old.record_status <> new.record_status then
    if new.record_status = 'INACTIVE' then
      update salesdetail
      set record_status = 'INACTIVE'
      where sales_id = new.id;
    elsif new.record_status = 'ACTIVE' then
      update salesdetail
      set record_status = 'ACTIVE'
      where sales_id = new.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger sales_record_status_cascade_trigger
  after update of record_status on sales
  for each row
  execute procedure sales_record_status_cascade();

-- Enriched SQL views
create or replace view sales_with_lookup as
select
  s.id as sales_id,
  s.customer_id,
  c.first_name || ' ' || c.last_name as customer_name,
  s.employee_id,
  e.first_name || ' ' || e.last_name as employee_name,
  s.sale_date,
  s.total_amount,
  s.status,
  s.record_status as sales_record_status,
  s.stamp as sales_stamp,
  sd.id as salesdetail_id,
  sd.product_id,
  p.name as product_name,
  sd.quantity,
  sd.unit_price,
  sd.line_total,
  sd.record_status as salesdetail_record_status,
  sd.stamp as salesdetail_stamp,
  ph.list_price as pricehist_list_price,
  ph.discount_rate as pricehist_discount_rate,
  ph.effective_date as pricehist_effective_date,
  ph.created_at as pricehist_created_at
from sales s
join customer c on c.id = s.customer_id
join employee e on e.id = s.employee_id
join salesdetail sd on sd.sales_id = s.id
join product p on p.id = sd.product_id
left join lateral (
  select ph2.*
  from pricehist ph2
  where ph2.product_id = sd.product_id
  order by ph2.effective_date desc
  limit 1
) ph on true;

create or replace view salesdetail_with_product as
select
  sd.id as salesdetail_id,
  sd.sales_id,
  sd.product_id,
  p.name as product_name,
  p.sku as product_sku,
  p.category as product_category,
  p.active as product_active,
  sd.quantity,
  sd.unit_price,
  sd.line_total,
  sd.record_status as salesdetail_record_status,
  sd.stamp as salesdetail_stamp,
  ph.list_price as current_list_price,
  ph.discount_rate as current_discount_rate,
  ph.effective_date as current_price_effective_date,
  ph.created_at as current_price_created_at
from salesdetail sd
join product p on p.id = sd.product_id
left join lateral (
  select ph2.*
  from pricehist ph2
  where ph2.product_id = p.id
  order by ph2.effective_date desc
  limit 1
) ph on true;
