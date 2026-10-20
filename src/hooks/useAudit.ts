import { keepPreviousData, useQuery } from "@tanstack/react-query";
// Utils
import { supabase, type AuditRow } from "@/lib";

export const AUDIT_PAGE_SIZE = 50;

export function useAuditLog(entity: string, page: number) {
  return useQuery({
    queryKey: ["audit", entity, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (page - 1) * AUDIT_PAGE_SIZE;
      let query = supabase
        .from("audit_log")
        .select("*, actor:profiles(full_name, email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + AUDIT_PAGE_SIZE - 1);
      if (entity) query = query.eq("entity", entity);
      const { data, error, count } = await query;
      if (error) throw error;
      return {
        rows: (data ?? []) as unknown as AuditRow[],
        total: count ?? 0,
      };
    },
  });
}
