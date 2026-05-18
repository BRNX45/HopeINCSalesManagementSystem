export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>{title}</h1>
        <p className="text-muted">This page is ready for Sprint 2 visibility logic and real data.</p>
      </div>
      <div className="placeholder-card">
        <p>
          The navigation is configured for {title.toLowerCase()} under the Sales Management System. Content and role-based visibility will be added in later sprints.
        </p>
      </div>
    </section>
  );
}
