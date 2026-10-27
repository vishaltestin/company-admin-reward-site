import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"

export interface CampaignListFilters {
  eventId?: number
  customEventName?: string
  verticalId?: number
  month?: number
  year?: number
}

export interface CampaignListEventOption {
  value: string
  label: string
}

export interface CampaignListResponse {
  data: CampaignListItem[]
  next_page_url: string | null
  filters?: {
    events: CampaignListEventOption[]
    years: number[]
  }
}

export interface CampaignListItem {
  id: string | number
  name: string
  created_at: string | Date
  distribution_type: string
  vertical?: { name: string }
  event?: { id: number; title: string } | null
  event_id?: number | null
  custom_event_name?: string | null
  total_budget: number
  status: string
}

export const useCampaignsQuery = (
  page = 1,
  filters: CampaignListFilters = {}
) => {
  return useQuery<CampaignListResponse>({
    queryKey: ["campaigns", page, filters],
    queryFn: async () => {
      const { data } = await api.get<CampaignListResponse>("/campaigns", {
        params: {
          page,
          event_id: filters.eventId,
          custom_event_name: filters.customEventName,
          vertical_id: filters.verticalId,
          month: filters.month,
          year: filters.year,
        },
      })
      return data
    },
  })
}

export const useCampaignQuery = (id: string) => {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/campaigns", payload)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to submit campaign.")
      }
    },
  })
}

export const useCancelCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/campaigns/${id}/cancel`)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
    },
  })
}
