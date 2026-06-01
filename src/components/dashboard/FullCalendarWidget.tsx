import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react"
import { format, isSameDay, parseISO, startOfWeek, addDays } from "date-fns"

import { useCalendarEventsQuery, type CalendarEvent } from "@/hooks/useCalendar"
import { useVerticalsQuery } from "@/hooks/useVerticals"
import { useAuthStore } from "@/store/useAuthStore"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EventModal } from "./EventModal"

type CalendarView = "monthly" | "weekly" | "daily"

const EVENT_TYPE_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "joining", label: "Joining Date" },
  { value: "onboarding", label: "Onboarding" },
  { value: "milestone", label: "Milestone" },
  { value: "retirement", label: "Retirement" },
  { value: "purchase", label: "Purchase" },
  { value: "registry", label: "Registry Due" },
  { value: "possession", label: "Possession Due" },
  { value: "site-visit", label: "Site Visit" },
  { value: "test-drive", label: "Test Drive" },
  { value: "service", label: "Service Due" },
  { value: "insurance", label: "Insurance Due" },
]

export function FullCalendarWidget() {
  const user = useAuthStore((state) => state.user)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>("monthly")
  const [verticalFilter, setVerticalFilter] = useState<string>("all")
  const [eventFilter, setEventFilter] = useState<string>("all")

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: dbVerticals } = useVerticalsQuery()
  const availableVerticals = useMemo(() => {
    if (!user || !dbVerticals) return []
    if (["business_head", "super_admin"].includes(user.user_type))
      return dbVerticals
    return dbVerticals.filter((v) => user.managed_vertical_ids.includes(v.id))
  }, [user, dbVerticals])

  const { data: apiEvents = [], isLoading } = useCalendarEventsQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    vertical_slug: verticalFilter !== "all" ? verticalFilter : undefined,
  })

  const events = useMemo(() => {
    if (eventFilter === "all") return apiEvents
    return apiEvents.filter((e) => e.type === eventFilter)
  }, [apiEvents, eventFilter])

  const calendarDays = useMemo(() => {
    if (currentView === "monthly") {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const days: (Date | null)[] = Array(firstDay.getDay()).fill(null)
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i))
      }
      while (days.length < 42) days.push(null) // Keep 6 rows
      return days
    }

    if (currentView === "weekly") {
      const start = startOfWeek(currentDate)
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
    }

    return [currentDate]
  }, [currentDate, currentView])

  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (currentView === "monthly") newDate.setMonth(newDate.getMonth() - 1)
    if (currentView === "weekly") newDate.setDate(newDate.getDate() - 7)
    if (currentView === "daily") newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (currentView === "monthly") newDate.setMonth(newDate.getMonth() + 1)
    if (currentView === "weekly") newDate.setDate(newDate.getDate() + 7)
    if (currentView === "daily") newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const getEventStyles = (type: string) => {
    if (type === "birthday")
      return "bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200"
    if (["joining", "onboarding"].includes(type))
      return "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
    return "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
  }

  const headerTitle = useMemo(() => {
    if (currentView === "daily") return format(currentDate, "MMMM do, yyyy")
    if (currentView === "weekly") {
      const endOfWeek = addDays(startOfWeek(currentDate), 6)
      return `${format(startOfWeek(currentDate), "MMM do")} - ${format(endOfWeek, "MMM do, yyyy")}`
    }
    return format(currentDate, "MMMM yyyy")
  }, [currentDate, currentView])

  return (
    <>
      <Card className="col-span-full font-grotest shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b bg-linear-to-r from-white to-blue-50/30 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl text-transparent">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Calendar
            </CardTitle>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {headerTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={currentView}
              onValueChange={(v) => setCurrentView(v as CalendarView)}
            >
              <TabsList className="h-9">
                <TabsTrigger value="monthly">Month</TabsTrigger>
                <TabsTrigger value="weekly">Week</TabsTrigger>
                <TabsTrigger value="daily">Day</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="h-9 w-37.5">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verticalFilter} onValueChange={setVerticalFilter}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="All Networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                {availableVerticals.map((v) => (
                  <SelectItem key={v.slug} value={v.slug}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-1 lg:ml-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <div className="ml-1 flex rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none border-r"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="h-125 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {currentView === "monthly" && (
                <>
                  <div className="grid grid-cols-7 border-b bg-muted/10">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="py-2 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-7 grid-rows-6">
                    {calendarDays.map((day, index) => {
                      const dayEvents = day
                        ? events.filter((e) => isSameDay(parseISO(e.date), day))
                        : []
                      const isToday = day && isSameDay(day, new Date())

                      return (
                        <div
                          key={index}
                          className={cn(
                            "min-h-30 border-r border-b p-1.5 sm:p-2",
                            !day && "bg-muted/20",
                            isToday && "bg-blue-50/40"
                          )}
                        >
                          {day && (
                            <>
                              <div
                                className={cn(
                                  "mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full sm:mx-0 sm:ml-auto",
                                  isToday
                                    ? "bg-blue-600 font-bold text-white shadow-sm"
                                    : "text-sm font-medium text-gray-700"
                                )}
                              >
                                {day.getDate()}
                              </div>
                              <div className="no-scrollbar max-h-21.25 space-y-1 overflow-y-auto">
                                {dayEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    onClick={(e) => handleEventClick(event, e)}
                                    className={cn(
                                      "cursor-pointer truncate rounded px-2 py-1 text-xs font-medium shadow-sm transition-colors",
                                      getEventStyles(event.type)
                                    )}
                                    title={event.title}
                                  >
                                    {event.first_name} {event.last_name}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {currentView === "weekly" && (
                <>
                  <div className="grid grid-cols-7 border-b bg-muted/10">
                    {calendarDays.map((day, index) => {
                      if (!day) return null
                      const isToday = isSameDay(day, new Date())
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex flex-col items-center border-r py-3 text-center",
                            isToday && "bg-blue-50/50"
                          )}
                        >
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {format(day, "E")}
                          </span>
                          <span
                            className={cn(
                              "mt-1 flex h-8 w-8 items-center justify-center rounded-full",
                              isToday
                                ? "bg-blue-600 font-bold text-white shadow-sm"
                                : "text-sm font-medium text-gray-900"
                            )}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid min-h-100 grid-cols-7">
                    {calendarDays.map((day, index) => {
                      if (!day) return null
                      const dayEvents = events.filter((e) =>
                        isSameDay(parseISO(e.date), day)
                      )
                      const isToday = isSameDay(day, new Date())

                      return (
                        <div
                          key={index}
                          className={cn(
                            "border-r bg-white p-2",
                            isToday && "bg-blue-50/20"
                          )}
                        >
                          <div className="space-y-2">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => handleEventClick(event, e)}
                                className={cn(
                                  "flex cursor-pointer flex-col gap-1 rounded-md px-3 py-2 text-xs font-medium shadow-sm transition-colors",
                                  getEventStyles(event.type)
                                )}
                              >
                                <span>
                                  {event.first_name} {event.last_name}
                                </span>
                                <span className="text-[10px] tracking-wider uppercase opacity-80">
                                  {event.type.replace("-", " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {currentView === "daily" && (
                <div className="min-h-100 bg-white p-6">
                  <h3 className="mb-4 flex items-center text-sm font-medium text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    All Events Scheduled
                  </h3>

                  {(() => {
                    const dayEvents = events.filter((e) =>
                      isSameDay(parseISO(e.date), currentDate)
                    )
                    if (dayEvents.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-12 text-center text-muted-foreground">
                          <CalendarIcon className="mb-3 h-8 w-8 opacity-20" />
                          <p>No events scheduled for this day.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className={cn(
                              "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5",
                              getEventStyles(event.type)
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-base font-bold">
                                {event.first_name} {event.last_name}
                              </span>
                              <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] tracking-wider uppercase">
                                {event.type.replace("-", " ")}
                              </span>
                            </div>
                            <span className="mt-1 text-xs opacity-80">
                              Vertical:{" "}
                              {availableVerticals.find(
                                (v) => v.slug === event.vertical_slug
                              )?.name || event.vertical_slug}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
