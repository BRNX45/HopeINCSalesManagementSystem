import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeletedItemsPage } from './pages/DeletedItemsPage';
import { EmployeeLookupPage } from './pages/EmployeeLookupPage';
import { LoginPage } from './pages/LoginPage';
import { MonthlySalesTrendPage } from './pages/MonthlySalesTrendPage';
import { PriceHistoryPage } from './pages/PriceHistoryPage';
import { ProductLookupPage } from './pages/ProductLookupPage';
import { RegisterPage } from './pages/RegisterPage';
import { SalesByCustomerPage } from './pages/SalesByCustomerPage';
import { SalesByEmployeePage } from './pages/SalesByEmployeePage';
import { SalesDetailPage } from './pages/SalesDetailPage';
import { SalesListPage } from './pages/SalesListPage';
import { TopProductsPage } from './pages/TopProductsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { CustomerLookupPage } from './pages/CustomerLookupPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/sales" element={<Navigate to="/app/transactions" replace />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<SalesListPage />} />
        <Route path="transactions/:id" element={<SalesDetailPage />} />
        <Route path="customers" element={<CustomerLookupPage />} />
        <Route path="employees" element={<EmployeeLookupPage />} />
        <Route path="products" element={<ProductLookupPage />} />
        <Route path="prices" element={<PriceHistoryPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="sales-by-employee" element={<SalesByEmployeePage />} />
        <Route path="sales-by-customer" element={<SalesByCustomerPage />} />
        <Route path="top-products" element={<TopProductsPage />} />
        <Route path="monthly-trend" element={<MonthlySalesTrendPage />} />
        <Route path="reports" element={<DashboardPage />} />
        <Route path="admin" element={<DashboardPage />} />
        <Route path="deleted" element={<Navigate to="deleted-items" replace />} />
        <Route path="deleted-items" element={<DeletedItemsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
