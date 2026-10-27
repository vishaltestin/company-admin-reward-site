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

export type CampaignRewardType = "points" | "code" | "link"
export type CampaignTemplateTab = "global" | "variations"

export interface CampaignTemplate {
  id: number
  name: string
  title?: string
  subject?: string
  status?: string
  reward_type?: CampaignRewardType | null
  thumbnail_path?: string
  updated_at: string
}

function getTemplateScopeParams(
  eventId: number | null | undefined,
  verticalId: number | null | undefined,
  tab: CampaignTemplateTab,
  rewardType?: CampaignRewardType | null
) {
  return {
    tab,
    ...(eventId != null ? { event_id: eventId } : {}),
    ...(eventId == null && verticalId != null
      ? { vertical_id: verticalId }
      : {}),
    ...(rewardType ? { reward_type: rewardType } : {}),
  }
}

export const useCampaignLandingPages = (
  eventId?: number | null,
  verticalId?: number | null,
  tab: CampaignTemplateTab = "global",
  rewardType?: CampaignRewardType | null
) => {
  const isEnabled = eventId != null || verticalId != null

  return useQuery({
    queryKey: [
      "campaign-landing-pages",
      eventId ?? null,
      verticalId ?? null,
      tab,
      rewardType ?? null,
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: CampaignTemplate[] }>(
        "/landing-pages",
        {
          params: getTemplateScopeParams(eventId, verticalId, tab, rewardType),
        }
      )
      return data.data
    },
    enabled: isEnabled,
  })
}

export const useCampaignEmailTemplates = (
  eventId?: number | null,
  verticalId?: number | null,
  tab: CampaignTemplateTab = "global",
  rewardType?: CampaignRewardType | null
) => {
  const isEnabled = eventId != null || verticalId != null

  return useQuery({
    queryKey: [
      "campaign-email-templates",
      eventId ?? null,
      verticalId ?? null,
      tab,
      rewardType ?? null,
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: CampaignTemplate[] }>(
        "/email-templates",
        {
          params: getTemplateScopeParams(eventId, verticalId, tab, rewardType),
        }
      )
      return data.data
    },
    enabled: isEnabled,
  })
}
