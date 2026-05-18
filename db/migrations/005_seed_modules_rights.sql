-- 005_seed_modules_rights.sql

insert into app_module (code, name, description) values
  ('Sales_Mod', 'Sales Module', 'Manage sales transactions and dashboard views'),
  ('SD_Mod', 'Sales Detail Module', 'Manage sales detail line items'),
  ('Lookup_Mod', 'Lookup Module', 'Manage customers, employees, products, and prices'),
  ('Adm_Mod', 'Admin Module', 'Manage administrative users and rights');

insert into rights (code, name, description) values
  ('SALES_VIEW', 'Sales View', 'View sales records'),
  ('SALES_ADD', 'Sales Add', 'Create sales records'),
  ('SALES_EDIT', 'Sales Edit', 'Edit sales records'),
  ('SALES_DEL', 'Sales Delete', 'Delete sales records'),
  ('SD_VIEW', 'Sales Detail View', 'View sales detail records'),
  ('SD_ADD', 'Sales Detail Add', 'Create sales detail line items'),
  ('SD_EDIT', 'Sales Detail Edit', 'Edit sales detail line items'),
  ('SD_DEL', 'Sales Detail Delete', 'Delete sales detail line items'),
  ('CUST_LOOKUP', 'Customer Lookup', 'Search and view customers'),
  ('EMP_LOOKUP', 'Employee Lookup', 'Search and view employees'),
  ('PROD_LOOKUP', 'Product Lookup', 'Search and view products'),
  ('PRICE_LOOKUP', 'Price Lookup', 'Search and view pricing history'),
  ('ADM_USER', 'Admin User', 'Manage administrative users and module access');

insert into app_user (email, full_name, record_status) values
  ('jcesperanza@neu.edu.ph', 'Jeremias Esperanza', 'ACTIVE'),
  ('brix.delossantos@neu.edu.ph', 'Brix de los Santos', 'ACTIVE');

insert into user_module (user_id, module_id)
select 1, id from app_module;

insert into user_module_rights (user_module_id, rights_id, can)
select um.id, r.id,
  case
    when r.code = 'SALES_VIEW' then true
    when r.code = 'SD_VIEW' then true
    when r.code in ('CUST_LOOKUP', 'EMP_LOOKUP', 'PROD_LOOKUP', 'PRICE_LOOKUP') then true
    else false
  end
from user_module um
join rights r on (
  (um.module_id = (select id from app_module where code = 'Sales_Mod') and r.code in ('SALES_VIEW', 'SALES_ADD', 'SALES_EDIT', 'SALES_DEL'))
  or (um.module_id = (select id from app_module where code = 'SD_Mod') and r.code in ('SD_VIEW', 'SD_ADD', 'SD_EDIT', 'SD_DEL'))
  or (um.module_id = (select id from app_module where code = 'Lookup_Mod') and r.code in ('CUST_LOOKUP', 'EMP_LOOKUP', 'PROD_LOOKUP', 'PRICE_LOOKUP'))
  or (um.module_id = (select id from app_module where code = 'Adm_Mod') and r.code = 'ADM_USER')
);
