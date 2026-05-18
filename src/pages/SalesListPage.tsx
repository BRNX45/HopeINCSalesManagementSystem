import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Modal } from '../components/Modal';
import {
  customers,
  employees,
  formatTransNo,
  getCurrentPrice,
  products,
  sales,
  salesDetails,
  salesWithLookup,
  Sale,
} from '../data/mockData';

const allSales = salesWithLookup;

export function SalesListPage() {
  type SaleRow = typeof allSales[number];
  const { rights, isSuperAdmin, currentUser } = useAuth();
  const [customerFilter, setCustomerFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editSale, setEditSale] = useState<SaleRow | null>(null);
  const [deleteSale, setDeleteSale] = useState<SaleRow | null>(null);
  const [sales, setSales] = useState<SaleRow[]>(allSales);

  const canAdd = rights.includes('SALES_ADD');
  const canEdit = rights.includes('SALES_EDIT');
  const canDelete = isSuperAdmin;
  const showStamp = currentUser?.user_type !== 'USER';

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!showStamp && sale.record_status === 'INACTIVE') {
        return false;
      }

      if (customerFilter && !sale.customerName.toLowerCase().includes(customerFilter.toLowerCase())) {
        return false;
      }

      if (fromDate && sale.salesDate < fromDate) {
        return false;
      }
      if (toDate && sale.salesDate > toDate) {
        return false;
      }
      return true;
    });
  }, [customerFilter, fromDate, toDate, sales, showStamp]);

  const handleAdd = (values: { salesDate: string; customerId: number; employeeId: number; lineItems?: Array<{ product: string; quantity: number; price: number }> }) => {
    const lineItems = values.lineItems || [];
    const customer = customers.find((item) => item.id === values.customerId);
    const employee = employees.find((item) => item.id === values.employeeId);
    
    // Calculate totals from line items
    const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const lineItemCount = lineItems.length;
    
    const newSaleId = sales.length + 1;
    
    // Create new sale details entries
    lineItems.forEach((lineItem, index) => {
      const product = products.find((p) => p.name === lineItem.product);
      if (product) {
        const newDetail = {
          id: salesDetails.length + 1 + index,
          salesId: newSaleId,
          productId: product.id,
          quantity: lineItem.quantity,
          unitPrice: lineItem.price,
          lineTotal: lineItem.quantity * lineItem.price,
          stamp: new Date().toISOString(),
          record_status: 'ACTIVE' as const,
        };
        salesDetails.push(newDetail);
      }
    });
    
    // Get product names for display
    const productNames = lineItems
      .map((item) => item.product)
      .join(', ');
    
    const newSale: SaleRow = {
      id: newSaleId,
      salesDate: values.salesDate,
      customerId: values.customerId,
      employeeId: values.employeeId,
      totalAmount: Number(totalAmount.toFixed(2)),
      lineItemCount,
      stamp: new Date().toISOString(),
      record_status: 'ACTIVE',
      customerName: `${customer?.firstName || 'Unknown'} ${customer?.lastName || ''}`,
      employeeName: `${employee?.lastName || 'Unknown'}, ${employee?.firstName || ''}`,
      productNames,
    } as SaleRow;
    setSales([newSale, ...sales]);
    setAddOpen(false);
  };

  const handleEdit = (values: { id?: number; salesDate: string; customerId: number; employeeId: number; lineItems?: Array<{ product: string; quantity: number; price: number }> }) => {
    if (values.id === undefined) {
      return;
    }
    setSales((current) =>
      current.map((item) =>
        item.id === values.id
          ? {
              ...item,
              salesDate: values.salesDate,
              customerId: values.customerId,
              employeeId: values.employeeId,
            }
          : item
      )
    );
    setEditSale(null);
  };

  const handleSoftDelete = () => {
    if (!deleteSale) return;
    setSales((current) =>
      current.map((item) =>
        item.id === deleteSale.id ? { ...item, record_status: 'INACTIVE' } : item
      )
    );
    setDeleteSale(null);
  };

  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Sales Transactions</h1>
        <p className="text-muted">Browse sales, filter by customer or date, and manage your transactions.</p>
      </div>
      <div className="toolbar">
        <div className="toolbar__filters">
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            placeholder="From date"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            placeholder="To date"
          />
          <input
            type="text"
            value={customerFilter}
            onChange={(event) => setCustomerFilter(event.target.value)}
            placeholder="Search customer"
          />
        </div>
        {canAdd ? (
          <button className="button button--primary" onClick={() => setAddOpen(true)}>
            Add Sale
          </button>
        ) : null}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Trans No</th>
              <th>Sales Date</th>
              <th>Customer</th>
              <th>Employee</th>
              <th>Products</th>
              <th>No of Items</th>
              <th>Total Amount</th>
              {showStamp && <th>Stamp</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} className={sale.record_status === 'INACTIVE' ? 'table-row--inactive' : ''}>
                <td>
                  <Link to={`/app/transactions/${sale.id}`}>{formatTransNo(sale.id)}</Link>
                </td>
                <td>{sale.salesDate}</td>
                <td>{sale.customerName}</td>
                <td>{sale.employeeName}</td>
                <td>{(sale as any).productNames || 'N/A'}</td>
                <td>{sale.lineItemCount}</td>
                <td>${sale.totalAmount.toFixed(2)}</td>
                {showStamp && <td>{new Date(sale.stamp).toLocaleString()}</td>}
                <td className="table-actions">
                  {canEdit ? (
                    <button className="button button--ghost" onClick={() => setEditSale(sale)}>
                      Edit
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button className="button button--ghost button--danger" onClick={() => setDeleteSale(sale)}>
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <SaleFormModal
          title="Add Sale"
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editSale && (
        <SaleFormModal
          title="Edit Sale"
          sale={editSale}
          onClose={() => setEditSale(null)}
          onSubmit={handleEdit}
        />
      )}

      {deleteSale && (
        <Modal title="Confirm delete" onClose={() => setDeleteSale(null)} footer={
          <>
            <button className="button button--ghost" onClick={() => setDeleteSale(null)}>
              Cancel
            </button>
            <button className="button button--danger" onClick={handleSoftDelete}>
              Confirm delete
            </button>
          </>
        }>
          <p>Confirm delete transaction {formatTransNo(deleteSale.id)}?</p>
        </Modal>
      )}
    </div>
  );
}

function SaleFormModal({
  title,
  sale,
  onClose,
  onSubmit,
}: {
  title: string;
  sale?: Sale;
  onClose: () => void;
  onSubmit: (values: { id?: number; salesDate: string; customerId: number; employeeId: number; lineItems?: Array<{ product: string; quantity: number; price: number }> }) => void;
}) {
  const [salesDate, setSalesDate] = useState(sale?.salesDate || new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState(sale?.customerId || customers[0].id);
  const [employeeId, setEmployeeId] = useState(sale?.employeeId || employees[0].id);
  const [lineItems, setLineItems] = useState<Array<{ product: string; quantity: number; price: number }>>([]);
  const [showAddLine, setShowAddLine] = useState(false);
  const [lineProduct, setLineProduct] = useState(products[0]?.name || '');
  const [lineQuantity, setLineQuantity] = useState('1');
  const [linePrice, setLinePrice] = useState('0');

  const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleAddLine = () => {
    if (lineProduct && Number(lineQuantity) > 0 && Number(linePrice) >= 0) {
      setLineItems([...lineItems, { product: lineProduct, quantity: Number(lineQuantity), price: Number(linePrice) }]);
      setLineProduct(products[0]?.name || '');
      setLineQuantity('1');
      setLinePrice('0');
      setShowAddLine(false);
    }
  };

  const handleRemoveLine = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button--primary"
            onClick={() => {
              if (lineItems.length === 0) {
                alert('Please add at least one line item.');
                return;
              }
              onSubmit({ id: sale?.id, salesDate, customerId, employeeId, lineItems });
            }}
          >
            Save Sale
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label>
          Sales Date *
          <input type="date" value={salesDate} onChange={(event) => setSalesDate(event.target.value)} />
        </label>
        <label>
          Customer *
          <select value={customerId} onChange={(event) => setCustomerId(Number(event.target.value))}>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.code} — {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Employee *
          <select value={employeeId} onChange={(event) => setEmployeeId(Number(event.target.value))}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.code} — {employee.lastName}, {employee.firstName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Line Items</h3>
          {!showAddLine && (
            <button
              className="button button--primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setShowAddLine(true)}
            >
              + Add Line
            </button>
          )}
        </div>

        {lineItems.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>No line items yet.</p>
        ) : (
          <div style={{ marginBottom: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>Product</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid #e5e7eb' }}>{item.product}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', borderRight: '1px solid #e5e7eb', fontWeight: '600' }}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        className="button button--ghost button--danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleRemoveLine(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: '#f9fafb', padding: '0.75rem', borderTop: '2px solid #e5e7eb', textAlign: 'right', fontWeight: '600' }}>
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>
        )}

        {showAddLine && (
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Add Line Item</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                Product
                <select
                  value={lineProduct}
                  onChange={(event) => setLineProduct(event.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', marginTop: '0.25rem' }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                Quantity
                <input
                  type="number"
                  min="1"
                  value={lineQuantity}
                  onChange={(event) => setLineQuantity(event.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', marginTop: '0.25rem' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                Unit Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={linePrice}
                  onChange={(event) => setLinePrice(event.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', marginTop: '0.25rem' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                className="button button--ghost"
                onClick={() => setShowAddLine(false)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                className="button button--primary"
                onClick={handleAddLine}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
