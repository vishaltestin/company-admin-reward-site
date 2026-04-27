import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface LandingPageTemplate {
  id: number
  name: string
  title: string
  status: "draft" | "published" | "archived"
  updated_at: string
}

export interface LandingPageDetail extends LandingPageTemplate {
  global_theme_tokens: Record<string, unknown> | null
  seo_meta: Record<string, unknown> | null
  page_schema: any[]
  available_variables: { name: string; value: string }[]
}

export interface SidebarEvent {
  type: "event"
  id: number
  title: string
  variation_count: number
}

export interface SidebarGroup {
  type: "group"
  title: string
  events: Omit<SidebarEvent, "type">[]
}

export interface SidebarVertical {
  id: number
  name: string
  items: (SidebarEvent | SidebarGroup)[]
}

// ==========================================
// 2. FETCH HOOKS (Queries)
// ==========================================

export const useLandingPageSidebarQuery = () => {
  return useQuery({
    queryKey: ["landing-pages", "sidebar"],
    queryFn: async () => {
      const { data } = await api.get<{ data: SidebarVertical[] }>(
        "/landing-pages/sidebar-events"
      )
      return data.data
    },
  })
}

export const useLandingPagesQuery = (
  eventId: number | null,
  tab: "global" | "variations"
) => {
  return useQuery({
    queryKey: ["landing-pages", "list", eventId, tab],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await api.get<{ data: LandingPageTemplate[] }>(
        "/landing-pages",
        { params: { event_id: eventId, tab } }
      )
      return data.data
    },
    enabled: !!eventId,
  })
}

export const useLandingPageDetailQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ["landing-pages", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: LandingPageDetail }>(
        `/landing-pages/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

// ==========================================
// 3. ACTION HOOKS (Mutations)
// ==========================================
export const useLandingPageMutations = () => {
  const queryClient = useQueryClient()

  const duplicateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: { name: string; title: string }
    }) => {
      const { data } = await api.post(`/landing-pages/${id}/duplicate`, payload)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] })
    },
    onError: () => {
      toast.error("Failed to duplicate landing page.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/landing-pages/${id}`)
    },
    onSuccess: () => {
      toast.success("Landing page deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] })
    },
    onError: () => {
      toast.error("Failed to delete landing page.")
    },
  })

  return { duplicateMutation, deleteMutation }
}
