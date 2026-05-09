// import { useQuery } from "@tanstack/react-query"
// import { api } from "@/lib/axios"

// export interface Vertical {
//   id: number
//   name: string
//   slug: string
// }

// export interface DashboardEvent {
//   id: string // e.g., "user_12_birth_date"
//   user_id: number
//   user_name: string
//   vertical_id: number
//   vertical_name: string
//   event_type: string // "birth_date", "anniversary_date", etc.
//   event_date: string // ISO string "2026-05-12T00:00:00.000Z"
//   details: {
//     company?: string
//     jobTitle?: string
//     location?: string
//     [key: string]: any
//   }
// }

// // 1. Fetch the verticals assigned to the logged-in company
// export const useDashboardVerticalsQuery = () => {
//   return useQuery({
//     queryKey: ["dashboard-verticals"],
//     queryFn: async () => {
//       // Assuming you have an endpoint that returns the company's mapped verticals
//       const { data } = await api.get<{ data: Vertical[] }>("/verticals")
//       return data.data
//     },
//   })
// }

// // 2. Fetch the upcoming events for a specific month and year
// export const useUpcomingEventsQuery = (month: number, year: number) => {
//   return useQuery({
//     queryKey: ["dashboard-events", month, year],
//     queryFn: async () => {
//       const { data } = await api.get<{ data: DashboardEvent[] }>(
//         "/dashboard/events",
//         {
//           params: { month, year },
//         }
//       )
//       return data.data
//     },
//     // Keep previous data while fetching the next month so the UI doesn't flash
//     placeholderData: (prev) => prev,
//   })
// }
