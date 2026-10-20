import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Utils
import { supabase, type Profile, type Role } from "@/lib";

export function useTeam(enabled = true) {
  return useQuery({
    queryKey: ["team"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      role?: Role;
      is_active?: boolean;
    }) => {
      const { id, ...changes } = input;
      const { error } = await supabase
        .from("profiles")
        .update(changes)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
}

export function useUpdateOwnName() {
  return useMutation({
    mutationFn: async (input: { id: string; full_name: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: input.full_name.trim() })
        .eq("id", input.id);
      if (error) throw error;
    },
  });
}
