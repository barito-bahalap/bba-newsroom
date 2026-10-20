import type { ReactNode } from "react";
// Style
import "./Notice.css";

interface NoticeProps {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}

export function Notice({ tone = "info", children }: NoticeProps) {
  return (
    <p
      className={`notice notice--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
