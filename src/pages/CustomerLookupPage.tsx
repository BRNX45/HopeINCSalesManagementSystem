import { customers } from '../data/mockData';

export function CustomerLookupPage() {
  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Customer Lookup</h1>
        <p className="text-muted">Search customers. This page is read-only.</p>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cust No</th>
              <th>Name</th>
              <th>Address</th>
              <th>Pay Term</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.code}</td>
                <td>{customer.firstName} {customer.lastName}</td>
                <td>{customer.street}, {customer.city}</td>
                <td>{customer.payTerm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
