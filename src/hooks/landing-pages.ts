import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getApiErrorMessage } from "@/lib/axios"
import { toast } from "sonner"
import type { PageBlock } from "@/types/builder"
import type { CampaignRewardType } from "@/hooks/useCampaignOptions"

export interface LandingPageTemplate {
  id: number
  name: string
  title: string
  reward_type: CampaignRewardType | null
  thumbnail_path: string | null
  status: "draft" | "published" | "archived"
  updated_at: string
}

export interface LandingPageDetail extends LandingPageTemplate {
  global_theme_tokens: Record<string, unknown> | null
  seo_meta: Record<string, unknown> | null
  page_schema: PageBlock[]
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
  tab: "global" | "variations",
  rewardType?: CampaignRewardType
) => {
  return useQuery({
    queryKey: ["landing-pages", "list", eventId, tab, rewardType],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await api.get<{ data: LandingPageTemplate[] }>(
        "/landing-pages",
        { params: { event_id: eventId, tab, reward_type: rewardType } }
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

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: {
        name?: string
        title?: string
        reward_type?: CampaignRewardType | null
        thumbnail_path?: string
        status?: "draft" | "published" | "archived"
        global_theme_tokens?: Record<string, unknown>
        seo_meta?: Record<string, unknown>
        page_schema?: PageBlock[]
        is_active?: boolean
      }
    }) => {
      const response = await api.put(`/landing-pages/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Landing page saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  return { duplicateMutation, deleteMutation, updateMutation }
}
