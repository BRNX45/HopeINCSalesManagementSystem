export type Customer = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  payTerm: string;
  record_status: 'ACTIVE' | 'INACTIVE';
};

export type Employee = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female';
  hireDate: string;
  role: string;
  record_status: 'ACTIVE' | 'INACTIVE';
};

export type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  record_status: 'ACTIVE' | 'INACTIVE';
};

export type PriceHistory = {
  id: number;
  productId: number;
  effectiveDate: string;
  unitPrice: number;
};

export type Sale = {
  id: number;
  salesDate: string;
  customerId: number;
  employeeId: number;
  totalAmount: number;
  lineItemCount: number;
  stamp: string;
  record_status: 'ACTIVE' | 'INACTIVE';
};

export type SaleDetail = {
  id: number;
  salesId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stamp: string;
  record_status: 'ACTIVE' | 'INACTIVE';
};

export type AppUser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  user_type: 'USER' | 'ADMIN' | 'SUPERADMIN';
  record_status: 'ACTIVE' | 'INACTIVE';
  blocked: boolean;
};

export type LoginActivity = {
  id: number;
  userId: number | null;
  username: string;
  user_type: 'USER' | 'ADMIN' | 'SUPERADMIN';
  action: 'Logged In' | 'Blocked' | 'Unblocked';
  status: 'SUCCESS' | 'BLOCKED';
  timestamp: string;
};

export const appUsers: AppUser[] = [
  {
    id: 1,
    username: 'jcesperanza',
    email: 'jcesperanza@neu.edu.ph',
    fullName: 'Jeremias Esperanza',
    user_type: 'SUPERADMIN',
    record_status: 'ACTIVE',
    blocked: false,
  },
  {
    id: 2,
    username: 'alina.rodriguez',
    email: 'alina.rodriguez@example.com',
    fullName: 'Alina Rodriguez',
    user_type: 'ADMIN',
    record_status: 'ACTIVE',
    blocked: false,
  },
  {
    id: 3,
    username: 'mario.tan',
    email: 'mario.tan@example.com',
    fullName: 'Mario Tan',
    user_type: 'USER',
    record_status: 'ACTIVE',
    blocked: false,
  },
  {
    id: 4,
    username: 'gwen.lee',
    email: 'gwen.lee@example.com',
    fullName: 'Gwen Lee',
    user_type: 'USER',
    record_status: 'INACTIVE',
    blocked: false,
  },
  {
    id: 5,
    username: 'sam.chung',
    email: 'sam.chung@example.com',
    fullName: 'Sam Chung',
    user_type: 'USER',
    record_status: 'ACTIVE',
    blocked: false,
  },
];

const loginActivityLog: LoginActivity[] = [
  {
    id: 1,
    userId: 3,
    username: 'mario.tan@example.com',
    user_type: 'USER',
    action: 'Logged In',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userId: 2,
    username: 'alina.rodriguez@example.com',
    user_type: 'ADMIN',
    action: 'Logged In',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const loginActivityEventTarget = new EventTarget();

export function getLoginActivityLog() {
  return [...loginActivityLog];
}

export function addLoginActivity(entry: Omit<LoginActivity, 'id'>) {
  const nextId = loginActivityLog.length ? Math.max(...loginActivityLog.map((item) => item.id)) + 1 : 1;
  loginActivityLog.unshift({ id: nextId, ...entry });
  if (loginActivityLog.length > 20) {
    loginActivityLog.splice(20);
  }
  loginActivityEventTarget.dispatchEvent(new Event('loginActivityUpdated'));
}

export function subscribeLoginActivityChanges(handler: () => void) {
  loginActivityEventTarget.addEventListener('loginActivityUpdated', handler);
}

export function unsubscribeLoginActivityChanges(handler: () => void) {
  loginActivityEventTarget.removeEventListener('loginActivityUpdated', handler);
}

export function toggleUserBlocked(userId: number, blocked: boolean) {
  const userIndex = appUsers.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return null;
  }
  appUsers[userIndex] = { ...appUsers[userIndex], blocked };
  loginActivityEventTarget.dispatchEvent(new Event('loginActivityUpdated'));
  return appUsers[userIndex];
}

export function getAppUserByEmail(email: string) {
  return appUsers.find((user) => user.email === email || user.username === email) ?? null;
}

export type EmployeeSalesMetric = {
  employeeId: number;
  employeeName: string;
  transactionCount: number;
  totalRevenue: number;
};

export type CustomerSalesMetric = {
  customerId: number;
  customerName: string;
  transactionCount: number;
  totalSpend: number;
};

export type ProductSalesMetric = {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type MonthlySalesMetric = {
  month: string;
  transactionCount: number;
  totalRevenue: number;
};

const payTerms = ['Net 15', 'Net 30', 'Net 45', 'Net 60'];
const genders: Array<'Male' | 'Female'> = ['Male', 'Female'];
const units = ['pcs', 'box', 'set', 'unit'];
const roles = ['Sales Associate', 'Account Manager', 'Support', 'Operations'];
const customerCities = ['Metro City', 'Oak Valley', 'Lakeside', 'Riverbend'];

export const customers: Customer[] = Array.from({ length: 82 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    code: `CUST${id.toString().padStart(3, '0')}`,
    firstName: `Customer${id}`,
    lastName: `Test${id}`,
    email: `customer_${id}@example.com`,
    phone: `0917${id.toString().padStart(6, '0')}`,
    street: `${id} Market Street`,
    city: customerCities[index % customerCities.length],
    payTerm: payTerms[index % payTerms.length],
    record_status: id % 11 === 0 ? 'INACTIVE' : 'ACTIVE',
  };
});

export const employees: Employee[] = Array.from({ length: 31 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    code: `EMP${id.toString().padStart(3, '0')}`,
    firstName: `Employee${id}`,
    lastName: `Staff${id}`,
    email: `employee_${id}@example.com`,
    gender: genders[index % genders.length],
    hireDate: new Date(Date.now() - id * 86400000 * 30).toISOString().slice(0, 10),
    role: roles[index % roles.length],
    record_status: id % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
  };
});

export const products: Product[] = Array.from({ length: 52 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    code: `PRD-${id.toString().padStart(4, '0')}`,
    name: `Product ${id}`,
    category: ['Electronics', 'Office', 'Software', 'Accessories'][index % 4],
    unit: units[index % units.length],
    record_status: id % 13 === 0 ? 'INACTIVE' : 'ACTIVE',
  };
});

export const priceHistory: PriceHistory[] = Array.from({ length: 70 }, (_, index) => {
  const id = index + 1;
  const productId = ((index % 52) + 1) as number;
  const amount = 20 + ((index % 40) * 1.75);
  const effectiveDate = new Date(Date.now() - index * 86400000).toISOString().slice(0, 10);

  return {
    id,
    productId,
    effectiveDate,
    unitPrice: Number(amount.toFixed(2)),
  };
});

function formatDateOffset(index: number) {
  return new Date(Date.now() - index * 86400000).toISOString().slice(0, 10);
}

export const sales: Sale[] = Array.from({ length: 124 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    salesDate: formatDateOffset(index % 90),
    customerId: ((index % 82) + 1) as number,
    employeeId: ((index % 31) + 1) as number,
    totalAmount: 0,
    lineItemCount: 0,
    stamp: new Date(Date.now() - index * 3600000).toISOString(),
    record_status: id % 9 === 0 ? 'INACTIVE' : 'ACTIVE',
  };
});

export const salesDetails: SaleDetail[] = Array.from({ length: 310 }, (_, index) => {
  const id = index + 1;
  const salesId = ((index % 124) + 1) as number;
  const productId = ((index % 52) + 1) as number;
  const quantity = ((index % 5) + 1) as number;
  const unitPrice = Number((10 + ((index % 20) * 1.75)).toFixed(2));

  return {
    id,
    salesId,
    productId,
    quantity,
    unitPrice,
    lineTotal: Number((quantity * unitPrice).toFixed(2)),
    stamp: new Date(Date.now() - index * 7200000).toISOString(),
    record_status: id % 13 === 0 ? 'INACTIVE' : 'ACTIVE',
  };
});

export const salesWithLookup = sales.map((sale) => {
  const customer = customers.find((item) => item.id === sale.customerId);
  const employee = employees.find((item) => item.id === sale.employeeId);
  const lineItems = salesDetails.filter((detail) => detail.salesId === sale.id && detail.record_status === 'ACTIVE');
  const totalAmount = Number(lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const productNames = lineItems
    .map((item) => products.find((p) => p.id === item.productId)?.name || 'Unknown')
    .join(', ');

  return {
    ...sale,
    customerName: `${customer?.firstName} ${customer?.lastName}`,
    employeeName: `${employee?.lastName}, ${employee?.firstName}`,
    lineItemCount: lineItems.length,
    totalAmount,
    productNames,
  };
});

export function formatTransNo(id: number) {
  return `TR${id.toString().padStart(6, '0')}`;
}

export function getCustomerName(customerId: number) {
  const customer = customers.find((item) => item.id === customerId);
  return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
}

export function getEmployeeName(employeeId: number) {
  const employee = employees.find((item) => item.id === employeeId);
  return employee ? `${employee.lastName}, ${employee.firstName}` : 'Unknown Employee';
}

export function getProductName(productId: number) {
  const product = products.find((item) => item.id === productId);
  return product ? product.name : 'Unknown Product';
}

export function getCurrentPrice(productId: number) {
  const history = priceHistory
    .filter((item) => item.productId === productId)
    .sort((a, b) => (a.effectiveDate < b.effectiveDate ? 1 : -1));
  return history.length ? history[0].unitPrice : 0;
}

export function getSalesByEmployee() {
  const map = new Map<number, EmployeeSalesMetric>();
  salesWithLookup.forEach((sale) => {
    const current = map.get(sale.employeeId) || {
      employeeId: sale.employeeId,
      employeeName: sale.employeeName,
      transactionCount: 0,
      totalRevenue: 0,
    };
    current.transactionCount += 1;
    current.totalRevenue += sale.totalAmount;
    map.set(sale.employeeId, current);
  });
  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getSalesByCustomer() {
  const map = new Map<number, CustomerSalesMetric>();
  salesWithLookup.forEach((sale) => {
    const current = map.get(sale.customerId) || {
      customerId: sale.customerId,
      customerName: sale.customerName,
      transactionCount: 0,
      totalSpend: 0,
    };
    current.transactionCount += 1;
    current.totalSpend += sale.totalAmount;
    map.set(sale.customerId, current);
  });
  return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
}

export function getTopProducts() {
  const map = new Map<number, ProductSalesMetric>();
  salesDetails
    .filter((detail) => detail.record_status === 'ACTIVE')
    .forEach((detail) => {
      const product = products.find((item) => item.id === detail.productId);
      if (!product) return;
      const current = map.get(detail.productId) || {
        productId: detail.productId,
        productName: product.name,
        totalQuantity: 0,
        totalRevenue: 0,
      };
      current.totalQuantity += detail.quantity;
      current.totalRevenue += detail.lineTotal;
      map.set(detail.productId, current);
    });
  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getMonthlySalesTrend() {
  const map = new Map<string, MonthlySalesMetric>();
  salesWithLookup.forEach((sale) => {
    const date = new Date(sale.salesDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = map.get(month) || {
      month,
      transactionCount: 0,
      totalRevenue: 0,
    };
    current.transactionCount += 1;
    current.totalRevenue += sale.totalAmount;
    map.set(month, current);
  });
  return Array.from(map.values()).sort((a, b) => (a.month < b.month ? 1 : -1));
}
