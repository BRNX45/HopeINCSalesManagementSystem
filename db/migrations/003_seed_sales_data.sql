-- 003_seed_sales_data.sql

insert into sales (customer_id, employee_id, sale_date, total_amount, status)
select
  ((seq - 1) % 82) + 1,
  ((seq - 1) % 31) + 1,
  current_date - ((seq % 90) || ' days')::interval,
  0,
  case
    when seq % 5 = 0 then 'CANCELLED'
    when seq % 5 = 1 then 'PROCESSING'
    else 'COMPLETED'
  end
from generate_series(1,124) as s(seq);

insert into salesdetail (sales_id, product_id, quantity, unit_price)
select
  ((seq - 1) % 124) + 1,
  ((seq - 1) % 52) + 1,
  ((seq % 5) + 1),
  10 + ((seq % 20) * 1.75)
from generate_series(1,310) as s(seq);

update sales
set total_amount = details.total_amount
from (
  select sales_id, sum(line_total) as total_amount
  from salesdetail
  group by sales_id
) as details
where sales.id = details.sales_id;
