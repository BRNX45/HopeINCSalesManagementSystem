import { products, priceHistory } from '../data/mockData';

function getCurrentPrice(productId: number) {
  const history = priceHistory
    .filter((item) => item.productId === productId)
    .sort((a, b) => (a.effectiveDate < b.effectiveDate ? 1 : -1));
  return history.length ? history[0].unitPrice : 0;
}

export function ProductLookupPage() {
  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Product Lookup</h1>
        <p className="text-muted">This page is read-only and shows active product pricing.</p>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Prod Code</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Current Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.unit}</td>
                <td>${getCurrentPrice(product.id).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
