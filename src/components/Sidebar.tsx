import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Sidebar() {
  const { rights } = useAuth();
  const showAdminLinks = rights.includes('ADM_USER');

  const navSections = [
    {
      title: 'Sales',
      links: [{ label: 'Transactions', path: '/app/transactions' }],
    },
    {
      title: 'Lookups',
      links: [
        { label: 'Customers', path: '/app/customers' },
        { label: 'Employees', path: '/app/employees' },
        { label: 'Products', path: '/app/products' },
        { label: 'Prices', path: '/app/prices' },
      ],
    },
    {
      title: 'Reports',
      links: [
        { label: 'Reports', path: '/app/reports' },
        { label: 'Sales by employee', path: '/app/sales-by-employee' },
        { label: 'Sales by customer', path: '/app/sales-by-customer' },
        { label: 'Top products', path: '/app/top-products' },
        { label: 'Monthly trend', path: '/app/monthly-trend' },
      ],
    },
  ];

  if (showAdminLinks) {
    navSections.push(
      {
        title: 'Admin',
        links: [
          { label: 'Admin', path: '/app/admin' },
          { label: 'User Management', path: '/app/users' },
        ],
      },
      {
        title: 'Deleted Items',
        links: [{ label: 'Deleted Items', path: '/app/deleted-items' }],
      }
    );
  }

  return (
    <aside className="sidebar">
      {navSections.map((section) => (
        <div key={section.title} className="sidebar__section">
          <div className="sidebar__title">{section.title}</div>
          <div className="sidebar__links">
            {section.links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
