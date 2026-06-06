import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { useQueryClient } from "@tanstack/react-query"

import { useVerticalsQuery } from "@/hooks/useVerticals"
import PointsReports from "@/components/reports/PointsReports"
import CodesReports from "@/components/reports/CodesReports"
import ProductReports from "@/components/reports/ProductReports"
import RecipientReports from "@/components/reports/RecipientReports"
import LinksReport from "@/components/reports/LinkReport"

export default function ReportsDashboard() {
  const queryClient = useQueryClient()

  // Fetch real programs (verticals) from the backend
  const { data: verticals = [], isLoading: isLoadingVerticals } =
    useVerticalsQuery()

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const [program, setProgram] = useState<string>("all")
  const [recipientType, setRecipientType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("points")
  const [dateOption, setDateOption] = useState<string>("last-30-days")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dynamically build the programs dropdown list based on user's authorized verticals
  const programs = useMemo(() => {
    const baseOptions = [{ value: "all", label: "All Programs" }]
    const fetchedOptions = verticals.map((v) => ({
      value: v.slug, // We use slug here because your API uses the slug to filter!
      label: v.name,
    }))
    return [...baseOptions, ...fetchedOptions]
  }, [verticals])

  // Handle date option change
  const handleDateOptionChange = (value: string) => {
    setDateOption(value)
    const today = new Date()
    let from = new Date()

    switch (value) {
      case "last-30-days":
        from = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 30
        )
        break
      case "current-month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "last-month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        today.setDate(0) // Set 'to' to the last day of last month
        break
      case "last-3-months":
        from = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        break
      case "last-6-months":
        from = new Date(today.getFullYear(), today.getMonth() - 6, 1)
        break
      case "last-1-year":
        from = new Date(today.getFullYear() - 1, today.getMonth(), 1)
        break
      case "custom":
        return
    }

    setDateRange({ from, to: today })
  }

  const dateOptions = [
    { value: "custom", label: "Custom Date Range" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "current-month", label: "Current Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "last-1-year", label: "Last 1 Year" },
  ]

  const recipientTypes = [
    { value: "all", label: "All Types" },
    { value: "individual", label: "Individual" },
    { value: "team", label: "Team" },
    { value: "client", label: "Client" },
  ]

  // Use React Query's invalidate to instantly trigger a fresh backend fetch
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["reports"] })
    setTimeout(() => setIsRefreshing(false), 500) // UI visual feedback
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and analyze reward points and codes performance
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
          <Select value={dateOption} onValueChange={handleDateOptionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateOption === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="rounded border bg-background px-2 py-1 text-sm"
                value={
                  dateRange.from
                    ? dateRange.from.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    from: new Date(e.target.value),
                  }))
                }
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="date"
                className="rounded border bg-background px-2 py-1 text-sm"
                value={
                  dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    to: new Date(e.target.value),
                  }))
                }
              />
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="points"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="points"
              className="data-[state=active]:bg-primary/10"
            >
              Points
            </TabsTrigger>
            <TabsTrigger
              value="codes"
              className="data-[state=active]:bg-primary/10"
            >
              Codes
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-primary/10"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="recipients"
              className="data-[state=active]:bg-primary/10"
            >
              Recipients
            </TabsTrigger>
            <TabsTrigger
              value="links"
              className="data-[state=active]:bg-primary/10"
            >
              Links
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {isLoadingVerticals ? (
              <div className="flex h-10 w-[180px] items-center justify-center rounded-md border">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((prog) => (
                    <SelectItem key={prog.value} value={prog.value}>
                      {prog.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeTab === "recipients" && (
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {recipientTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="points" className="m-0 border-none outline-none">
          <PointsReports dateRange={dateRange} program={program} />
        </TabsContent>

        <TabsContent value="codes" className="m-0 border-none outline-none">
          <CodesReports dateRange={dateRange} program={program} />
        </TabsContent>

        <TabsContent value="products" className="m-0 border-none outline-none">
          <ProductReports dateRange={dateRange} program={program} />
        </TabsContent>

        <TabsContent
          value="recipients"
          className="m-0 border-none outline-none"
        >
          <RecipientReports
            dateRange={dateRange}
            program={program}
            recipientType={recipientType}
          />
        </TabsContent>

        <TabsContent value="links" className="m-0 border-none outline-none">
          <LinksReport dateRange={dateRange} program={program} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
