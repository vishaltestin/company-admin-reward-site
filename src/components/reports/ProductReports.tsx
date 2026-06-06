import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useReportProducts } from "@/hooks/useReports"
import type { TopProduct } from "@/types/reports"

const barChartConfig = {
  redeemed: { label: "Points Spent", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

interface ProductReportsProps {
  dateRange: DateRange
  program: string
}

export default function ProductReports({
  dateRange,
  program,
}: ProductReportsProps) {
  const fromDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

  const { data: productData, isLoading } = useReportProducts({
    program,
    from: fromDate,
    to: toDate,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const topProducts = productData?.top_products || []
  const categoryData = productData?.category_data || []

  return (
    <div className="space-y-6">
      {/* SHADCN BAR CHART FOR CATEGORIES */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>
            Points spent across product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={categoryData}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="redeemed"
                fill="var(--color-redeemed)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* TOP SELLING PRODUCTS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Products with the highest redemption volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Recipient Type</TableHead>
                <TableHead className="text-right">
                  Points Redeemed (Total)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No product redemptions found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((product: TopProduct) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      PRD-{product.id}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.recipientType}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {Number(product.pointsRedeemed).toLocaleString()}
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
