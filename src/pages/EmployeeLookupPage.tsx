import { employees } from '../data/mockData';

export function EmployeeLookupPage() {
  return (
    <div className="page-panel">
      <div className="page-panel__header">
        <h1>Employee Lookup</h1>
        <p className="text-muted">This page is read-only and shows employee information only.</p>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Emp No</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.code}</td>
                <td>{employee.lastName}, {employee.firstName}</td>
                <td>{employee.gender}</td>
                <td>{employee.hireDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
