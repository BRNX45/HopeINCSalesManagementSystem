import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Modal } from '../components/Modal';
import {
  customers,
  employees,
  getCustomerName,
  getEmployeeName,
  getCurrentPrice,
  getProductName,
  products,
  sales,
  salesDetails,
  Sale,
  SaleDetail,
} from '../data/mockData';

export function SalesDetailPage() {
  const { id } = useParams();
  const saleId = Number(id);
  const navigate = useNavigate();
  const { rights, currentUser } = useAuth();
  const [lineItems, setLineItems] = useState(
    salesDetails.filter((item) => item.salesId === saleId)
  );
  const [editLine, setEditLine] = useState<SaleDetail | null>(null);
  const [addLineOpen, setAddLineOpen] = useState(false);

  const sale = sales.find((item) => item.id === saleId);
  const customerName = sale ? getCustomerName(sale.customerId) : 'Unknown';
  const employeeName = sale ? getEmployeeName(sale.employeeId) : 'Unknown';
  const canAdd = rights.includes('SD_ADD');
  const canEdit = rights.includes('SD_EDIT');
  const canDelete = rights.includes('SD_DEL');
  const showStamp = currentUser?.user_type !== 'USER';

  const activeLines = useMemo(
    () => lineItems.filter((item) => item.record_status === 'ACTIVE'),
    [lineItems]
  );

  const total = useMemo(
    () => activeLines.reduce((sum, item) => sum + item.lineTotal, 0),
    [activeLines]
  );

  if (!sale) {
    return (
      <div className="page-panel">
        <div className="page-panel__header">
          <h1>Sale not found</h1>
        </div>
        <button className="button button--ghost" onClick={() => navigate('/app/transactions')}>
          Back to sales
        </button>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Sales Detail</h1>
        <p className="text-muted">Review line items for transaction {sale.id}.</p>
      </div>
      <div className="details-grid">
        <div>
          <strong>Sales Date</strong>
          <div>{sale.salesDate}</div>
        </div>
        <div>
          <strong>Customer</strong>
          <div>{customerName}</div>
        </div>
        <div>
          <strong>Employee</strong>
          <div>{employeeName}</div>
        </div>
      </div>
      <div className="toolbar">
        {canAdd ? (
          <button className="button button--primary" onClick={() => setAddLineOpen(true)}>
            Add Line Item
          </button>
        ) : null}
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Line Total</th>
              {showStamp && <th>Stamp</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeLines.map((line) => {
              const product = products.find((item) => item.id === line.productId);
              return (
                <tr key={line.id}>
                  <td>{product?.code}</td>
                  <td>{product?.name}</td>
                  <td>{line.quantity}</td>
                  <td>${line.unitPrice.toFixed(2)}</td>
                  <td>${line.lineTotal.toFixed(2)}</td>
                  {showStamp && <td>{new Date(line.stamp).toLocaleString()}</td>}
                  <td className="table-actions">
                    {canEdit ? (
                      <button className="button button--ghost" onClick={() => setEditLine(line)}>
                        Edit
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        className="button button--ghost button--danger"
                        onClick={() =>
                          setLineItems((current) =>
                            current.map((item) =>
                              item.id === line.id ? { ...item, record_status: 'INACTIVE' } : item
                            )
                          )
                        }
                      >
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="summary-row">
        <div />
        <div className="summary-total">Total: ${total.toFixed(2)}</div>
      </div>

      {addLineOpen && (
        <LineItemModal
          title="Add Line Item"
          onClose={() => setAddLineOpen(false)}
          onSubmit={(values) => {
            setLineItems((current) => [
              {
                id: lineItems.length + 1,
                salesId: saleId,
                productId: values.productId,
                quantity: values.quantity,
                unitPrice: values.unitPrice,
                lineTotal: Number((values.quantity * values.unitPrice).toFixed(2)),
                stamp: new Date().toISOString(),
                record_status: 'ACTIVE',
              },
              ...current,
            ]);
            setAddLineOpen(false);
          }}
        />
      )}

      {editLine && (
        <LineItemModal
          title="Edit Line Item"
          lineItem={editLine}
          onClose={() => setEditLine(null)}
          onSubmit={(values) => {
            setLineItems((current) =>
              current.map((item) =>
                item.id === editLine.id
                  ? {
                      ...item,
                      productId: values.productId,
                      quantity: values.quantity,
                      unitPrice: values.unitPrice,
                      lineTotal: Number((values.quantity * values.unitPrice).toFixed(2)),
                    }
                  : item
              )
            );
            setEditLine(null);
          }}
        />
      )}
    </div>
  );
}

function LineItemModal({
  title,
  lineItem,
  onClose,
  onSubmit,
}: {
  title: string;
  lineItem?: SaleDetail;
  onClose: () => void;
  onSubmit: (values: { productId: number; quantity: number; unitPrice: number }) => void;
}) {
  const [productId, setProductId] = useState(lineItem?.productId || products[0].id);
  const [quantity, setQuantity] = useState(lineItem?.quantity || 1);
  const [unitPrice, setUnitPrice] = useState(lineItem?.unitPrice || getCurrentPrice(products[0].id));

  const handleProductChange = (value: number) => {
    setProductId(value);
    setUnitPrice(getCurrentPrice(value));
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
          <button className="button button--primary" onClick={() => onSubmit({ productId, quantity, unitPrice })}>
            Save
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label>
          Product
          <select value={productId} onChange={(event) => handleProductChange(Number(event.target.value))}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} — {product.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        <label>
          Unit Price
          <input type="number" value={unitPrice} readOnly />
        </label>
      </div>
    </Modal>
  );
}
