import { useAuthStore } from "@/store/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { UpcomingEventsCalendar } from "@/components/dashboard/UpcomingEventsCalendar" // <-- Import

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.first_name}!
        </h1>
        <p className="mt-1">
          Here is what's happening at {user.company?.name || "your company"}{" "}
          today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Company Ledger Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{user.company?.wallet_balance.toLocaleString("en-IN") || "0.00"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Available {user.company?.points_name || "Points"}
            </p>
          </CardContent>
        </Card>

        {/* Add more top-level stats cards here */}
      </div>

      {/* --- ADD THE BIG CALENDAR HERE --- */}
      <div className="mt-8">
        {/* <UpcomingEventsCalendar /> */}
      </div>
    </div>
  )
}
