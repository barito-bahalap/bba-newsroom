import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toRow, type ArticleValues } from "@/lib/articleValues";
import { supabase } from "@/lib/supabase";
import type { Article, ArticleStatus, Correction, Revision } from "@/lib/types";

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as Article | null) ?? null;
    },
  });
}

export interface SaveInput {
  id?: string;
  values?: ArticleValues;
  transition?: {
    status: ArticleStatus;
    note?: string;
  };
}

export function useSaveArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values, transition }: SaveInput) => {
      const payload: Record<string, unknown> = values ? toRow(values) : {};
      if (transition) {
        payload.status = transition.status;
        if (transition.status === "draft")
          payload.review_note = transition.note ?? null;
        if (transition.status === "unpublished") {
          payload.unpublished_reason = transition.note ?? null;
        }
      }
      const request = id
        ? supabase.from("articles").update(payload).eq("id", id)
        : supabase.from("articles").insert(payload);
      const { data, error } = await request.select("*").single();
      if (error) throw error;
      return data as Article;
    },
    onSuccess: (article) => {
      queryClient.setQueryData(["article", article.id], article);
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({
        queryKey: ["revisions", article.id],
      });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useRevisions(articleId: string | undefined) {
  return useQuery({
    queryKey: ["revisions", articleId],
    enabled: Boolean(articleId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_revisions")
        .select("*, editor:profiles(full_name)")
        .eq("article_id", articleId as string)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as Revision[];
    },
  });
}

export function useCorrections(articleId: string | undefined) {
  return useQuery({
    queryKey: ["corrections", articleId],
    enabled: Boolean(articleId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corrections")
        .select("*, author:profiles(full_name)")
        .eq("article_id", articleId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Correction[];
    },
  });
}

export function useAddCorrection(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: string) => {
      const { error } = await supabase
        .from("corrections")
        .insert({ article_id: articleId, note: note.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["corrections", articleId],
      });
    },
  });
}
