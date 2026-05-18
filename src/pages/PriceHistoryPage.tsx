import { priceHistory, products } from '../data/mockData';

export function PriceHistoryPage() {
  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Price History</h1>
        <p className="text-muted">This page is read-only and shows historical product pricing.</p>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Prod Code</th>
              <th>Effective Date</th>
              <th>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {priceHistory.map((record) => {
              const product = products.find((item) => item.id === record.productId);
              return (
                <tr key={record.id}>
                  <td>{product?.code}</td>
                  <td>{record.effectiveDate}</td>
                  <td>${record.unitPrice.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
