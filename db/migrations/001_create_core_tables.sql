-- 001_create_core_tables.sql

create table customer (
  id serial primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  street text,
  city text,
  created_at timestamptz not null default now()
);

create table employee (
  id serial primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  hired_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table product (
  id serial primary key,
  name text not null,
  sku text not null unique,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table pricehist (
  id serial primary key,
  product_id integer not null references product(id),
  effective_date date not null,
  list_price numeric(12,2) not null,
  discount_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table sales (
  id serial primary key,
  customer_id integer not null references customer(id),
  employee_id integer not null references employee(id),
  sale_date date not null default current_date,
  total_amount numeric(12,2) not null,
  status text not null default 'PENDING',
  record_status text not null default 'ACTIVE',
  stamp timestamptz not null default now()
);

create table salesdetail (
  id serial primary key,
  sales_id integer not null references sales(id),
  product_id integer not null references product(id),
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  record_status text not null default 'ACTIVE',
  stamp timestamptz not null default now()
);
