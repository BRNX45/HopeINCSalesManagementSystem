import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getMonthlySalesTrend,
  getTopProducts,
  getSalesByCustomer,
  getSalesByEmployee,
} from '../data/mockData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Curated color palette for charts (accessible, balanced)
const COLORS = ['#2563eb', '#059669', '#eab308', '#ef4444', '#7c3aed', '#db2777', '#0ea5a4', '#f97316'];
const MAX_ITEMS = 8;

function withOthers<T extends Record<string, any>>(data: T[], nameKey: string, valueKey: string) {
  if (data.length <= MAX_ITEMS) return data;
  const top = data.slice(0, MAX_ITEMS);
  const otherTotal = data.slice(MAX_ITEMS).reduce((s, r) => s + (r[valueKey] || 0), 0);
  return [...top, { [nameKey]: 'Others', [valueKey]: otherTotal } as unknown as T];
}

export function DashboardPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(t);
  }, []);

  const monthly = useMemo(() => getMonthlySalesTrend(), []);
  const topProducts = useMemo(() => getTopProducts(), []);
  const customers = useMemo(() => getSalesByCustomer(), []);
  const employees = useMemo(() => getSalesByEmployee(), []);

  const productsForChart = useMemo(() => withOthers(topProducts, 'productName', 'totalRevenue'), [topProducts]);
  const customersForChart = useMemo(() => withOthers(customers, 'customerName', 'totalSpend'), [customers]);
  const employeesForChart = useMemo(() => employees.slice(0, MAX_ITEMS), [employees]);

  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>Dashboard</h1>
        <p className="text-muted">Welcome to the Sales Management System overview.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Quick insights</h2>
          <p>Track sales performance, inventory status, and customer activity from one screen.</p>
        </div>
        <div className="dashboard-card">
          <h2>Recent activity</h2>
          <p>Transactions, new customers, and product updates are all kept in the app shell.</p>
        </div>
      </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Reports</h2>
          {loading ? (
            <div className="chart-skeleton">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="chart-skeleton__bar" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 260 }}>
                  <h4>Revenue Trend (Line)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `$${Number(v) >= 1000 ? (Number(v)/1000).toFixed(1)+'k' : v}`} />
                      <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                      <Legend />
                      <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 260 }}>
                  <h4>Transaction Count (Bar)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transactionCount" fill="#10b981" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 320 }}>
                  <h4>Revenue by Product (Column)</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productsForChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="productName" type="category" width={160} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                      <Bar dataKey="totalRevenue" fill={COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 320 }}>
                  <h4>Product Distribution (Pie)</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={productsForChart} dataKey="totalRevenue" nameKey="productName" cx="50%" cy="50%" outerRadius={90} label>
                        {productsForChart.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 320 }}>
                  <h4>Customer Spending (Bar)</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={customersForChart} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="customerName" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                      <Bar dataKey="totalSpend" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8, minHeight: 320 }}>
                  <h4>Customer Distribution (Donut)</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={customersForChart} dataKey="totalSpend" nameKey="customerName" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                        {customersForChart.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 8 }}>
                <h4>Sales Leaderboard - Top Performers</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeesForChart} margin={{ bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employeeName" angle={-30} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(v: any) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                    <Bar dataKey="totalRevenue" fill={COLORS[0]}>
                      {employeesForChart.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
    </section>
  );
}
