// Style
import "./AuditFilter.css";
// Utils
import { AUDIT_ENTITIES } from "@/lib";

interface AuditFilterProps {
  entity: string;
  onEntity: (value: string) => void;
}

export function AuditFilter({ entity, onEntity }: AuditFilterProps) {
  return (
    <div>
      <select
        value={entity}
        aria-label="Filter by area"
        onChange={(event) => onEntity(event.target.value)}
      >
        {AUDIT_ENTITIES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
