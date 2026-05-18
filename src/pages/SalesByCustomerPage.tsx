import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSalesByCustomer } from '../data/mockData';

const CUSTOMER_COLORS = ['#ec4899', '#f97316', '#6366f1', '#06b6d4', '#8b5cf6', '#14b8a6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function SalesByCustomerPage() {
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<'customerName' | 'transactionCount' | 'totalSpend'>('totalSpend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, []);

  const rawData = useMemo(() => getSalesByCustomer(), []);
  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      const compare = typeof first === 'number' ? first - (second as number) : String(first).localeCompare(String(second));
      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [rawData, sortKey, sortDirection]);

  const topCustomer = sortedData[0];

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>Sales by Customer</h1>
        <p className="text-muted">Analyze customer spending patterns and identify your most valuable customers.</p>
      </div>

      {loading ? (
        <div className="chart-skeleton">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="chart-skeleton__bar" />
          ))}
        </div>
      ) : sortedData.length === 0 ? (
        <div className="empty-state">No customer sales data for this period.</div>
      ) : (
        <>
          {topCustomer ? (
            <div className="dashboard-grid">
              <div className="dashboard-card dashboard-card--highlight">
                <h2>Top customer</h2>
                <p>{topCustomer.customerName}</p>
                <p>{topCustomer.transactionCount} transactions</p>
                <p>${topCustomer.totalSpend.toFixed(2)} total spend</p>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Customer Spending (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={sortedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="customerName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value} />
                  <Bar dataKey="totalSpend" fill="#ec4899" name="Total Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Customer Distribution (Donut Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sortedData}
                    dataKey="totalSpend"
                    nameKey="customerName"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={false}
                  >
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Customer Details</h3>
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('customerName')} className="sortable">
                    Customer
                  </th>
                  <th onClick={() => handleSort('transactionCount')} className="sortable">
                    Transactions
                  </th>
                  <th onClick={() => handleSort('totalSpend')} className="sortable">
                    Total Spend
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={item.customerId} className={index === 0 ? 'table-row--highlight' : ''}>
                    <td>{item.customerName}</td>
                    <td>{item.transactionCount}</td>
                    <td>${item.totalSpend.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
