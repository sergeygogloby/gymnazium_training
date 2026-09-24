import type { ReactNode } from 'react';

export function PageShell({
  title,
  viewId,
  children,
}: {
  title: string;
  viewId: string;
  children?: ReactNode;
}) {
  return (
    <main className="page">
      <p className="view-id">{viewId}</p>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
