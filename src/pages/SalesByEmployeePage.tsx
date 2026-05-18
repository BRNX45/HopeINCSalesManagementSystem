import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getSalesByEmployee } from '../data/mockData';

const LEADERBOARD_COLORS = ['#fbbf24', '#c0caf5', '#fb923c', '#86efac', '#67e8f9', '#a78bfa', '#fb7185', '#fca5a5', '#facc15', '#bfdbfe'];

export function SalesByEmployeePage() {
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<'employeeName' | 'transactionCount' | 'totalRevenue'>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const rawData = useMemo(() => getSalesByEmployee(), []);
  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      const compare = typeof first === 'number' ? first - (second as number) : String(first).localeCompare(String(second));
      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [rawData, sortKey, sortDirection]);

  const leaderboardData = useMemo(() => {
    return [...rawData]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [rawData]);

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
        <h1>Sales by Employee</h1>
        <p className="text-muted">Review employee performance with leaderboard and transaction analysis.</p>
      </div>

      {toast ? <div className="toast toast--error">{toast}</div> : null}

      {loading ? (
        <div className="chart-skeleton">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="chart-skeleton__bar" />
          ))}
        </div>
      ) : sortedData.length === 0 ? (
        <div className="empty-state">No sales by employee data is available.</div>
      ) : (
        <>
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Sales Leaderboard - Top Performers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={leaderboardData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="employeeName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(0)}` : value}
                  contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Bar dataKey="totalRevenue" name="Revenue" fill="#3b82f6">
                  {leaderboardData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={LEADERBOARD_COLORS[index % LEADERBOARD_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
              {leaderboardData.slice(0, 3).map((item, idx) => (
                <div key={item.employeeId} style={{ padding: '0.25rem 0' }}>
                  <strong>#{item.rank}</strong> {item.employeeName} - ${item.totalRevenue.toFixed(2)} ({item.transactionCount} transactions)
                </div>
              ))}
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Detailed Performance Table</h3>
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('employeeName')} className="sortable">
                    Employee
                  </th>
                  <th onClick={() => handleSort('transactionCount')} className="sortable">
                    Transactions
                  </th>
                  <th onClick={() => handleSort('totalRevenue')} className="sortable">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.employeeId}>
                    <td>{item.employeeName}</td>
                    <td>{item.transactionCount}</td>
                    <td>${item.totalRevenue.toFixed(2)}</td>
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
