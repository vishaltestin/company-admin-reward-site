import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

import {
  useReportOverview,
  useReportTrends,
  useReportDistribution,
  useReportTopRecipients,
  useReportCampaigns,
  useReportRecentActivity,
} from "@/hooks/useReports"
import type {
  TopRecipient,
  CampaignReportItem,
  RecentActivityItem,
  ReportFilters,
} from "@/types/reports"

const barChartConfig = {
  sent: { label: "Codes Sent", color: "hsl(var(--chart-1))" },
  redeemed: { label: "Codes Redeemed", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const pieChartConfig = {
  value: { label: "Codes" },
  color1: { color: "hsl(var(--chart-1))" },
  color2: { color: "hsl(var(--chart-2))" },
  color3: { color: "hsl(var(--chart-3))" },
  color4: { color: "hsl(var(--chart-4))" },
  color5: { color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

interface CodesReportsProps {
  dateRange: DateRange
  program: string
}

export default function CodesReports({
  dateRange,
  program,
}: CodesReportsProps) {
  const fromDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

  // STRICTLY FETCHING 'code' REWARDS
  const filters: ReportFilters = {
    program,
    from: fromDate,
    to: toDate,
    reward_type: "code",
  }

  const { data: overview, isLoading: loadingOverview } =
    useReportOverview(filters)
  const { data: trends, isLoading: loadingTrends } = useReportTrends(filters)
  const { data: distribution, isLoading: loadingDist } =
    useReportDistribution(filters)
  const { data: topRecipientsReport, isLoading: loadingRecipients } =
    useReportTopRecipients(filters)
  const topRecipients = topRecipientsReport?.recipients ?? []
  const { data: campaigns = [], isLoading: loadingCampaigns } =
    useReportCampaigns(filters)
  const { data: recentActivity = [], isLoading: loadingActivity } =
    useReportRecentActivity(filters)

  if (loadingOverview || loadingTrends || loadingDist) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pieDataWithColors =
    distribution?.map((item, index) => ({
      ...item,
      fill: `var(--color-color${(index % 5) + 1})`,
    })) || []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Codes Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_sent?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Codes Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_redeemed?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              from codes issued in the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.redemption_rate ?? 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_campaigns ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Codes Sent vs. Redeemed</CardTitle>
            <CardDescription>
              By issue month; redeemed counts claimed codes from each cohort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart accessibilityLayer data={trends}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="sent"
                  fill="var(--color-sent)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="redeemed"
                  fill="var(--color-redeemed)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Codes Distribution by Event</CardTitle>
            <CardDescription>Source of codes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center pb-0">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square h-[300px] w-full pb-0"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieDataWithColors}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {pieDataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent className="mt-4 flex-wrap" />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* RECIPIENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Top Earning Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecipients ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Codes Received</TableHead>
                  <TableHead>Redemptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRecipients.map((recipient: TopRecipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {recipient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{recipient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{recipient.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {recipient.points_balance.toLocaleString()}
                    </TableCell>
                    <TableCell>{recipient.redemptions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CAMPAIGNS */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Level Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Codes Sent</TableHead>
                  <TableHead>Codes Redeemed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: CampaignReportItem) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.id}</TableCell>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.startDate}</TableCell>
                    <TableCell>{campaign.endDate}</TableCell>
                    <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                    <TableCell>
                      {campaign.redeemed?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campaign.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* TRANSACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Code Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActivity ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((tx: RecentActivityItem) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>{tx.user}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === "Sent" ? "default" : "secondary"}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {tx.value}
                    </TableCell>
                    <TableCell>{tx.reason}</TableCell>
                    <TableCell>{tx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
