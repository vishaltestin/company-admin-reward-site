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
} from "@/hooks/useReports"
import type { TopRecipient, ReportFilters } from "@/types/reports"

const barChartConfig = {
  sent: {
    label: "Links Sent",
    color: "hsl(var(--chart-1))",
  },
  redeemed: {
    label: "Links Claimed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const pieChartConfig = {
  value: { label: "Links" },
  color1: { color: "hsl(var(--chart-1))" },
  color2: { color: "hsl(var(--chart-2))" },
  color3: { color: "hsl(var(--chart-3))" },
  color4: { color: "hsl(var(--chart-4))" },
  color5: { color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

interface LinksReportProps {
  dateRange: DateRange
  program: string
}

export default function LinksReport({ dateRange, program }: LinksReportProps) {
  const fromDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

  // STRICTLY FETCHING 'link' REWARDS
  const filters: ReportFilters = {
    program,
    from: fromDate,
    to: toDate,
    reward_type: "link",
  }

  const { data: overview, isLoading: loadingOverview } =
    useReportOverview(filters)
  const { data: trends, isLoading: loadingTrends } = useReportTrends(filters)
  const { data: distribution, isLoading: loadingDist } =
    useReportDistribution(filters)
  const { data: topRecipients = [], isLoading: loadingRecipients } =
    useReportTopRecipients(filters)

  const isGlobalLoading = loadingOverview || loadingTrends || loadingDist

  if (isGlobalLoading) {
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
      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Links Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_sent?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Links Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_redeemed?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Claim Rate</CardTitle>
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
          </CardContent>
        </Card>
      </div>

      {/* CHARTS LAYER */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Links Sent vs. Claimed</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
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
                  tickMargin={10}
                  axisLine={false}
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
            <CardTitle>Links Distribution by Event</CardTitle>
            <CardDescription>
              Campaign triggers generating links
            </CardDescription>
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

      {/* TABLES */}
      <Card>
        <CardHeader>
          <CardTitle>Top Link Recipients</CardTitle>
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
                  <TableHead>Links Received</TableHead>
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
