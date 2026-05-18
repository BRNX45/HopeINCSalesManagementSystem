import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthlySalesTrend } from '../data/mockData';

export function MonthlySalesTrendPage() {
  const [loading, setLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState('2024-01');
  const [rangeEnd, setRangeEnd] = useState('2024-06');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 390);
    return () => window.clearTimeout(timer);
  }, []);

  const allTrend = useMemo(() => getMonthlySalesTrend(), []);
  const filteredTrend = useMemo(() => {
    return allTrend.filter((item) => item.month >= rangeStart && item.month <= rangeEnd);
  }, [allTrend, rangeStart, rangeEnd]);

  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>Monthly Sales Trend</h1>
        <p className="text-muted">Track sales revenue growth over months with line and bar charts.</p>
      </div>

      <div className="toolbar">
        <div className="toolbar__filters">
          <label>
            Start month
            <input type="month" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
          </label>
          <label>
            End month
            <input type="month" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="chart-skeleton">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="chart-skeleton__bar" />
          ))}
        </div>
      ) : filteredTrend.length === 0 ? (
        <div className="empty-state">No data for this period.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Revenue Trend (Line Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value} />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" name="Total Revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Transaction Count (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toString() : value} />
                <Legend />
                <Bar dataKey="transactionCount" fill="#10b981" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
