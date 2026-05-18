import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTopProducts } from '../data/mockData';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

export function TopProductsPage() {
  const [loading, setLoading] = useState(true);
  const [limit] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const data = useMemo(() => getTopProducts().slice(0, limit), [limit]);

  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>Top Products</h1>
        <p className="text-muted">Compare products by quantity sold and revenue. See which products drive your sales.</p>
      </div>

      {loading ? (
        <div className="chart-skeleton">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="chart-skeleton__bar" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">No product sales were found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Revenue by Product (Column Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productName" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value} />
                <Bar dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Product Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} dataKey="totalRevenue" nameKey="productName" cx="50%" cy="50%" outerRadius={80} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
