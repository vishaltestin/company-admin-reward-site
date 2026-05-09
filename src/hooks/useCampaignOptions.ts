import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export interface EventNode {
  id: number
  title: string
  parent_id: number | null
  children?: EventNode[]
}

export const useCampaignVerticals = () => {
  return useQuery({
    queryKey: ["campaign-verticals"],
    queryFn: async () => {
      const { data } =
        await api.get<{ id: number; name: string; slug: string }[]>(
          "/verticals"
        )
      return data
    },
  })
}

export const useCampaignEvents = (verticalId?: number) => {
  return useQuery({
    queryKey: ["campaign-events", verticalId],
    queryFn: async () => {
      const { data } = await api.get<{ data: EventNode[] }>(`/events`, {
        params: { vertical_id: verticalId },
      })
      return data.data
    },
    enabled: !!verticalId,
  })
}

export interface CampaignTemplate {
  id: number
  name: string
  title: string
  status: string
  thumbnail_path?: string
  updated_at: string
}

export const useCampaignLandingPages = (
  eventId?: number | null,
  tab: "global" | "variations" = "global"
) => {
  return useQuery({
    queryKey: ["campaign-landing-pages", eventId, tab],
    queryFn: async () => {
      const { data } = await api.get<{ data: CampaignTemplate[] }>(
        `/landing-pages`,
        {
          params: { event_id: eventId, tab },
        }
      )
      return data.data
    },
    enabled: !!eventId,
  })
}

export const useCampaignEmailTemplates = (
  eventId?: number | null,
  tab: "global" | "variations" = "global"
) => {
  return useQuery({
    queryKey: ["campaign-email-templates", eventId, tab],
    queryFn: async () => {
      const { data } = await api.get<{ data: CampaignTemplate[] }>(
        `/email-templates`,
        {
          params: { event_id: eventId, tab },
        }
      )
      return data.data
    },
    enabled: !!eventId,
  })
}
