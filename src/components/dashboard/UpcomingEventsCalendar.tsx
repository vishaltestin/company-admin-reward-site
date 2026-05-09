// import { useState, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import {
//   format,
//   addMonths,
//   subMonths,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   isToday,
//   parseISO,
// } from "date-fns"
// import {
//   ChevronLeft,
//   ChevronRight,
//   Gift,
//   Calendar as CalendarIcon,
//   MapPin,
//   Briefcase,
//   Loader2,
// } from "lucide-react"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Badge } from "@/components/ui/badge"

// // IMPORT OUR NEW HOOKS
// import {
//   useUpcomingEventsQuery,
//   useDashboardVerticalsQuery,
//   type DashboardEvent,
// } from "@/hooks/useDashboard"

// const EVENT_COLOR_MAP: Record<string, string> = {
//   birth_date: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
//   anniversary_date:
//     "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
//   date_joining: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
//   date_onboarding:
//     "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
//   possession_due_date:
//     "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
//   insurance_due_date:
//     "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
//   default: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
// }

// const EVENT_LABEL_MAP: Record<string, string> = {
//   birth_date: "Birthday",
//   anniversary_date: "Work Anniversary",
//   date_joining: "Joining Anniversary",
//   date_onboarding: "Client Onboarding",
//   possession_due_date: "Possession Due",
//   insurance_due_date: "Insurance Due",
//   retirement_day: "Retirement",
//   service_due_date: "Service Due",
//   registry_due_date: "Registry Due",
// }

// export function UpcomingEventsCalendar() {
//   const navigate = useNavigate()
//   const [currentDate, setCurrentDate] = useState(new Date())

//   // Filters
//   const [selectedVerticalId, setSelectedVerticalId] = useState<string>("all")
//   const [selectedEventType, setSelectedEventType] = useState<string>("all")

//   // Modal State
//   const [selectedEvent, setSelectedEvent] = useState<DashboardEvent | null>(
//     null
//   )

//   // API Queries
//   const { data: verticals, isLoading: isLoadingVerticals } =
//     useDashboardVerticalsQuery()

//   // Notice how we pass the current month (1-12) and year to the API!
//   const currentMonth = currentDate.getMonth() + 1
//   const currentYear = currentDate.getFullYear()
//   const { data: events, isFetching: isFetchingEvents } = useUpcomingEventsQuery(
//     currentMonth,
//     currentYear
//   )

//   // Filter Events Client-Side based on dropdowns
//   const filteredEvents = useMemo(() => {
//     if (!events) return []
//     return events.filter((event) => {
//       if (
//         selectedVerticalId !== "all" &&
//         event.vertical_id.toString() !== selectedVerticalId
//       )
//         return false
//       if (selectedEventType !== "all" && event.event_type !== selectedEventType)
//         return false
//       return true
//     })
//   }, [events, selectedVerticalId, selectedEventType])

//   // Calendar Grid Math
//   const monthStart = startOfMonth(currentDate)
//   const monthEnd = endOfMonth(monthStart)
//   const startDate = startOfWeek(monthStart)
//   const endDate = endOfWeek(monthEnd)
//   const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

//   const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
//   const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

//   const handleSendGift = () => {
//     if (!selectedEvent) return

//     const eventLabel = EVENT_LABEL_MAP[selectedEvent.event_type] || "Event"

//     navigate("/campaigns/create", {
//       state: {
//         prefill: {
//           vertical_id: selectedEvent.vertical_id,
//           campaignName: `${selectedEvent.user_name} - ${eventLabel} Gift`,
//           description: `Automated campaign to celebrate ${selectedEvent.user_name}'s ${eventLabel} on ${format(parseISO(selectedEvent.event_date), "MMM do, yyyy")}.`,
//           recipient_ids: [selectedEvent.user_id],
//         },
//       },
//     })
//   }

//   return (
//     <Card className="relative col-span-full">
//       <CardHeader className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
//         <div>
//           <CardTitle className="flex items-center gap-2 text-xl">
//             Upcoming Milestones
//             {isFetchingEvents && (
//               <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//             )}
//           </CardTitle>
//           <p className="mt-1 text-sm text-muted-foreground">
//             Don't miss an opportunity to connect.
//           </p>
//         </div>

//         {/* FILTERS */}
//         <div className="flex flex-wrap items-center gap-2">
//           {/* DYNAMIC VERTICAL FILTER */}
//           <Select
//             value={selectedVerticalId}
//             onValueChange={setSelectedVerticalId}
//             disabled={isLoadingVerticals}
//           >
//             <SelectTrigger className="w-[180px] bg-white">
//               <SelectValue placeholder="All Verticals" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Verticals</SelectItem>
//               {verticals?.map((v) => (
//                 <SelectItem key={v.id} value={v.id.toString()}>
//                   {v.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={selectedEventType}
//             onValueChange={setSelectedEventType}
//           >
//             <SelectTrigger className="w-[180px] bg-white">
//               <SelectValue placeholder="All Event Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Events</SelectItem>
//               {Object.entries(EVENT_LABEL_MAP).map(([key, label]) => (
//                 <SelectItem key={key} value={key}>
//                   {label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* MONTH NAVIGATION */}
//           <div className="ml-2 flex items-center overflow-hidden rounded-md border bg-white">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={prevMonth}
//               className="h-9 w-9 rounded-none"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <div className="w-32 px-4 text-center text-sm font-semibold">
//               {format(currentDate, "MMMM yyyy")}
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={nextMonth}
//               className="h-9 w-9 rounded-none"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         {/* CALENDAR GRID */}
//         <div className="overflow-hidden rounded-lg border bg-gray-50/50">
//           <div className="grid grid-cols-7 border-b bg-white text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//               <div key={day} className="border-r py-3 last:border-r-0">
//                 {day}
//               </div>
//             ))}
//           </div>

//           <div className="grid auto-rows-[120px] grid-cols-7 gap-px bg-gray-200">
//             {calendarDays.map((day) => {
//               const isCurrentMonth = isSameMonth(day, monthStart)

//               // Find events that match this specific day
//               const dayEvents = filteredEvents.filter((e) =>
//                 isSameDay(parseISO(e.event_date), day)
//               )

//               return (
//                 <div
//                   key={day.toString()}
//                   className={`overflow-y-auto bg-white p-2 transition-colors ${!isCurrentMonth ? "bg-gray-50/50 text-gray-300" : ""} ${isToday(day) ? "ring-2 ring-primary ring-inset" : ""}`}
//                 >
//                   <div
//                     className={`mb-1 text-right text-sm ${isToday(day) ? "font-bold text-primary" : "font-medium"}`}
//                   >
//                     {format(day, "d")}
//                   </div>

//                   <div className="space-y-1">
//                     {dayEvents.map((event) => (
//                       <div
//                         key={event.id}
//                         onClick={() => setSelectedEvent(event)}
//                         className={`cursor-pointer rounded border p-1.5 text-xs transition-all hover:-translate-y-0.5 ${EVENT_COLOR_MAP[event.event_type] || EVENT_COLOR_MAP.default}`}
//                       >
//                         <span className="block truncate font-semibold">
//                           {event.user_name}
//                         </span>
//                         <span className="text-[10px] opacity-80">
//                           {EVENT_LABEL_MAP[event.event_type] || "Event"}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </CardContent>

//       {/* EVENT DETAILS MODAL */}
//       <Dialog
//         open={!!selectedEvent}
//         onOpenChange={(open) => !open && setSelectedEvent(null)}
//       >
//         <DialogContent className="sm:max-w-md">
//           {selectedEvent && (
//             <>
//               <DialogHeader>
//                 <div className="mb-2 flex items-center justify-between">
//                   <Badge
//                     variant="outline"
//                     className={
//                       EVENT_COLOR_MAP[selectedEvent.event_type] ||
//                       EVENT_COLOR_MAP.default
//                     }
//                   >
//                     {EVENT_LABEL_MAP[selectedEvent.event_type] || "Event"}
//                   </Badge>
//                   <span className="text-sm font-medium text-gray-500">
//                     <CalendarIcon className="mr-1 mb-0.5 inline h-4 w-4" />
//                     {format(
//                       parseISO(selectedEvent.event_date),
//                       "MMMM do, yyyy"
//                     )}
//                   </span>
//                 </div>
//                 <DialogTitle className="text-2xl">
//                   {selectedEvent.user_name}
//                 </DialogTitle>
//               </DialogHeader>

//               <div className="space-y-4 py-4">
//                 <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4">
//                   <div className="col-span-2">
//                     <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
//                       Audience / Vertical
//                     </p>
//                     <p className="text-sm font-medium">
//                       {selectedEvent.vertical_name}
//                     </p>
//                   </div>
//                   {selectedEvent.details?.company && (
//                     <div className="col-span-2">
//                       <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
//                         Company
//                       </p>
//                       <p className="flex items-center text-sm font-medium">
//                         <Briefcase className="mr-1 h-3 w-3 text-gray-400" />{" "}
//                         {selectedEvent.details.company}
//                       </p>
//                     </div>
//                   )}
//                   {selectedEvent.details?.jobTitle && (
//                     <div>
//                       <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
//                         Role
//                       </p>
//                       <p className="text-sm font-medium">
//                         {selectedEvent.details.jobTitle}
//                       </p>
//                     </div>
//                   )}
//                   {selectedEvent.details?.location && (
//                     <div>
//                       <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
//                         Location
//                       </p>
//                       <p className="flex items-center text-sm font-medium">
//                         <MapPin className="mr-1 h-3 w-3 text-gray-400" />{" "}
//                         {selectedEvent.details.location}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <DialogFooter>
//                 <Button
//                   variant="outline"
//                   onClick={() => setSelectedEvent(null)}
//                 >
//                   Close
//                 </Button>
//                 <Button onClick={handleSendGift} className="bg-primary">
//                   <Gift className="mr-2 h-4 w-4" /> Send Gift Now
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </Card>
//   )
// }
