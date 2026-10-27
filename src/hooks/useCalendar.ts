import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export type CalendarEventType =
  | "birthday"
  | "anniversary"
  | "joining"
  | "onboarding"
  | "milestone"
  | "retirement"
  | "purchase"
  | "registry"
  | "possession"
  | "site-visit"
  | "test-drive"
  | "service"
  | "insurance"

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: CalendarEventType
  vertical_slug: string
  vertical_id: number
  event_id: number | null
  user_id: number
  first_name: string
  last_name: string
}

export interface CalendarFilterEvent {
  id: number
  title: string
  vertical_id: number
  vertical_slug: string
  vertical_name: string
}

interface CalendarEventsResponse {
  data: CalendarEvent[]
  filters: {
    events: CalendarFilterEvent[]
  }
}

interface FetchEventsParams {
  year: number
  month: number
  vertical_slug?: string
}

export const useCalendarEventsQuery = (params: FetchEventsParams) => {
  return useQuery({
    queryKey: ["calendarEvents", params],
    queryFn: async () => {
      const { data } = await api.get<CalendarEventsResponse>(
        "/dashboard/calendar-events",
        { params }
      )

      return {
        events: data.data,
        filterEvents: data.filters?.events ?? [],
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
