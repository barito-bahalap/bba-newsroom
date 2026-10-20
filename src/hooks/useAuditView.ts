import { useState } from "react";
// Hooks
import { useAuditLog } from ".";

export function useAuditView() {
  const [entity, setEntityState] = useState("");
  const [page, setPage] = useState(1);
  const audit = useAuditLog(entity, page);

  function setEntity(value: string) {
    setEntityState(value);
    setPage(1);
  }

  return { entity, page, audit, setEntity, setPage };
}
