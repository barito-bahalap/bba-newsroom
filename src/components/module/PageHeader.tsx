import type { ReactNode } from "react";
// Style
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {children && <div className="page-header__actions">{children}</div>}
    </div>
  );
}
