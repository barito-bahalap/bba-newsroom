import type { ReactNode } from "react";
// Style
import "./Field.css";

interface FieldProps {
  label: string;
  as?: "label" | "div";
  children: ReactNode;
}

export function Field({ label, as: Tag = "label", children }: FieldProps) {
  return (
    <Tag className="field">
      <span className="field__label">{label}</span>
      {children}
    </Tag>
  );
}
