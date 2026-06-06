export interface ReportFilters {
  program: string
  from?: string
  to?: string
  reward_type?: "points" | "code" | "link"
}

export interface ReportOverview {
  total_sent: number
  total_redeemed: number
  redemption_rate: number
  total_campaigns: number
}

export interface ReportTrendItem {
  name: string
  sent: number
  redeemed: number
}

export interface ReportDistributionItem {
  name: string
  value: number
}

export interface TopRecipient {
  id: number
  name: string
  email: string
  type: string
  points_balance: number
  redemptions: number
  tier: string
}

export interface CampaignReportItem {
  id: number
  name: string
  startDate: string
  endDate: string
  sent: number
  redeemed: number
  status: "Active" | "Completed" | "Draft" | "Archived"
}

export interface RecentActivityItem {
  id: number
  user: string
  type: "Sent" | "Redeemed"
  value: number
  reason: string
  date: string
}

export interface ApiResponseEnvelope<T> {
  data: T
}

export interface TopProduct {
  id: number
  name: string
  category: string
  recipientType: string
  pointsRedeemed: number
}
export interface CategoryData {
  name: string
  redeemed: number
}
export interface ProductReportResponse {
  top_products: TopProduct[]
  category_data: CategoryData[]
}
