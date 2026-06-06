import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import type {
  ReportFilters,
  ReportOverview,
  ReportTrendItem,
  ReportDistributionItem,
  TopRecipient,
  CampaignReportItem,
  RecentActivityItem,
  ApiResponseEnvelope,
  ProductReportResponse,
} from "@/types/reports"

const formatFilters = (filters: ReportFilters): string => {
  const params = new URLSearchParams()
  if (filters.program) params.append("program", filters.program)
  if (filters.from) params.append("from", filters.from)
  if (filters.to) params.append("to", filters.to)
  if (filters.reward_type) params.append("reward_type", filters.reward_type)
  return params.toString()
}

export const useReportOverview = (filters: ReportFilters) => {
  return useQuery<ReportOverview>({
    queryKey: ["reports", "overview", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponseEnvelope<ReportOverview>>(
        `/reports/overview?${formatFilters(filters)}`
      )
      return data.data
    },
  })
}

export const useReportTrends = (filters: ReportFilters) => {
  return useQuery<ReportTrendItem[]>({
    queryKey: ["reports", "trends", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponseEnvelope<ReportTrendItem[]>>(
        `/reports/trends?${formatFilters(filters)}`
      )
      return data.data
    },
  })
}

export const useReportDistribution = (filters: ReportFilters) => {
  return useQuery<ReportDistributionItem[]>({
    queryKey: ["reports", "distribution", filters],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponseEnvelope<ReportDistributionItem[]>
      >(`/reports/distribution?${formatFilters(filters)}`)
      return data.data
    },
  })
}

export const useReportTopRecipients = (filters: ReportFilters) => {
  return useQuery<TopRecipient[]>({
    queryKey: ["reports", "top-recipients", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponseEnvelope<TopRecipient[]>>(
        `/reports/top-recipients?${formatFilters(filters)}`
      )
      return data.data
    },
  })
}

export const useReportCampaigns = (filters: ReportFilters) => {
  return useQuery<CampaignReportItem[]>({
    queryKey: ["reports", "campaigns", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponseEnvelope<CampaignReportItem[]>>(
        `/reports/campaigns?${formatFilters(filters)}`
      )
      return data.data
    },
  })
}

export const useReportRecentActivity = (filters: ReportFilters) => {
  return useQuery<RecentActivityItem[]>({
    queryKey: ["reports", "recent-activity", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponseEnvelope<RecentActivityItem[]>>(
        `/reports/recent-activity?${formatFilters(filters)}`
      )
      return data.data
    },
  })
}

export const useReportProducts = (filters: ReportFilters) => {
  return useQuery<ProductReportResponse>({
    queryKey: ["reports", "products", filters],
    queryFn: async () => {
      const { data } = await api.get<ProductReportResponse>(
        `/reports/products?${formatFilters(filters)}`
      )
      return data
    },
  })
}
