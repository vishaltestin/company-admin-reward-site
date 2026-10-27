import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
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

import { useReportTopRecipients } from "@/hooks/useReports"
import type { TopRecipient, ReportFilters } from "@/types/reports"

interface RecipientReportsProps {
  dateRange: DateRange
  program: string
  recipientType: string
}

export default function RecipientReports({
  dateRange,
  program,
}: RecipientReportsProps) {
  const fromDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

  const filters: ReportFilters = {
    program,
    from: fromDate,
    to: toDate,
  }

  const { data: recipientsReport, isLoading: loadingRecipients } =
    useReportTopRecipients(filters)
  const topRecipients = recipientsReport?.recipients ?? []
  const summary = recipientsReport?.summary

  // Summary values come from all matching recipients, not just the 15 leaderboard rows.
  const totalUsers = summary?.total_recipients ?? 0
  const totalHeldPoints = summary?.total_points_balance ?? 0
  const totalOrders = summary?.total_orders ?? 0
  const avgPoints =
    totalUsers > 0 ? Math.round(totalHeldPoints / totalUsers) : 0

  if (loadingRecipients) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* DERIVED OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Active Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              with activity in the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Points Held</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHeldPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              current balances of matching recipients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg. Points Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgPoints.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Catalog Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP RECIPIENTS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Leaderboard</CardTitle>
          <CardDescription>
            Most engaged users from{" "}
            {dateRange?.from?.toLocaleDateString() ?? "N/A"} to{" "}
            {dateRange?.to?.toLocaleDateString() ?? "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vertical / Program</TableHead>
                <TableHead>Points Balance</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Tier Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRecipients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No active recipients found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                topRecipients.map((recipient: TopRecipient) => (
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
                    <TableCell className="font-medium">
                      {recipient.points_balance.toLocaleString()}
                    </TableCell>
                    <TableCell>{recipient.orders.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          recipient.tier === "Platinum"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {recipient.tier}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
