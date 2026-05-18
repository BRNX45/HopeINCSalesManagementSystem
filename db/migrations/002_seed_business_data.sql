-- 002_seed_business_data.sql

insert into customer (first_name, last_name, email, phone, street, city)
select
  format('Customer%s', seq),
  format('Test%s', seq),
  format('customer_%s@example.com', seq),
  format('0917%06s', lpad(seq::text, 6, '0')),
  format('%s Market Street', seq),
  'Metro City'
from generate_series(1,82) as s(seq);

insert into employee (first_name, last_name, email, role)
select
  format('Employee%s', seq),
  format('Staff%s', seq),
  format('employee_%s@example.com', seq),
  (array['Sales Associate', 'Account Manager', 'Support', 'Operations'])[((seq - 1) % 4) + 1]
from generate_series(1,31) as s(seq);

insert into product (name, sku, category)
select
  format('Product %s', seq),
  format('PRD-%04s', seq),
  (array['Electronics', 'Office', 'Software', 'Accessories'])[((seq - 1) % 4) + 1]
from generate_series(1,52) as s(seq);

insert into pricehist (product_id, effective_date, list_price, discount_rate)
select
  ((seq - 1) % 52) + 1,
  current_date - ((seq % 90) || ' days')::interval,
  20 + ((seq % 40) * 2.5),
  ((seq % 4) * 5)::numeric(5,2)
from generate_series(1,70) as s(seq);
