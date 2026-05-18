import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { customers, employees, products, sales, salesDetails } from '../data/mockData';

export function DeletedItemsPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'transactions' | 'line-items'>('transactions');
  const [deletedSales, setDeletedSales] = useState(sales.filter((item) => item.record_status === 'INACTIVE'));
  const [deletedLines, setDeletedLines] = useState(salesDetails.filter((item) => item.record_status === 'INACTIVE'));

  if (!isAdmin) {
    return <Navigate to="/app/transactions" replace />;
  }

  const recoveredSales = useMemo(
    () => deletedSales.filter((item) => item.record_status === 'INACTIVE'),
    [deletedSales]
  );

  const recoveredLines = useMemo(
    () => deletedLines.filter((item) => item.record_status === 'INACTIVE'),
    [deletedLines]
  );

  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Deleted Items</h1>
        <p className="text-muted">Recover inactive transactions or line items.</p>
      </div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'transactions' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`tab ${activeTab === 'line-items' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('line-items')}
        >
          Line Items
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Trans No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Recover</th>
              </tr>
            </thead>
            <tbody>
              {recoveredSales.map((sale) => {
                const customer = customers.find((item) => item.id === sale.customerId);
                const employee = employees.find((item) => item.id === sale.employeeId);
                return (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{sale.salesDate}</td>
                    <td>{customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}</td>
                    <td>{employee ? `${employee.lastName}, ${employee.firstName}` : 'Unknown'}</td>
                    <td>
                      <button
                        className="button button--ghost button--primary"
                        onClick={() =>
                          setDeletedSales((current) =>
                            current.map((item) =>
                              item.id === sale.id ? { ...item, record_status: 'ACTIVE' } : item
                            )
                          )
                        }
                      >
                        Recover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Line ID</th>
                <th>Sale</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Recover</th>
              </tr>
            </thead>
            <tbody>
              {recoveredLines.map((line) => {
                const product = products.find((item) => item.id === line.productId);
                return (
                  <tr key={line.id}>
                    <td>{line.id}</td>
                    <td>{line.salesId}</td>
                    <td>{product?.code}</td>
                    <td>{line.quantity}</td>
                    <td>
                      <button
                        className="button button--ghost button--primary"
                        onClick={() =>
                          setDeletedLines((current) =>
                            current.map((item) =>
                              item.id === line.id ? { ...item, record_status: 'ACTIVE' } : item
                            )
                          )
                        }
                      >
                        Recover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
