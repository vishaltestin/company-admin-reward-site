import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getApiErrorMessage } from "@/lib/axios"
import { toast } from "sonner"

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

// Add this interface to the top with your others
export interface EmailTemplateDetail extends EmailTemplate {
  html_body: string
  design_json: Record<string, unknown> | null
  available_variables: { name: string; value: string }[]
}

export interface SidebarEvent {
  type: "event"
  id: number
  title: string
  variation_count: number
}

export interface SidebarGroup {
  type: "group"
  title: string
  events: Omit<SidebarEvent, "type">[]
}

export interface SidebarVertical {
  id: number
  name: string
  items: (SidebarEvent | SidebarGroup)[]
}

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  thumbnail_path: string | null
  updated_at: string
}

// ==========================================
// 2. FETCH HOOKS (Queries)
// ==========================================

// Fetch the nested sidebar structure
export const useSidebarEventsQuery = () => {
  return useQuery({
    queryKey: ["email-templates", "sidebar"],
    queryFn: async () => {
      const { data } = await api.get<{ data: SidebarVertical[] }>(
        "/email-templates/sidebar-events"
      )
      return data.data
    },
  })
}

// Fetch the grid of templates based on selected event and tab
export const useTemplatesQuery = (
  eventId: number | null,
  tab: "global" | "variations"
) => {
  return useQuery({
    // Include eventId and tab in the key so it refetches when they change
    queryKey: ["email-templates", "list", eventId, tab],
    queryFn: async () => {
      if (!eventId) return [] // Don't fetch if no event is selected
      const { data } = await api.get<{ data: EmailTemplate[] }>(
        "/email-templates",
        {
          params: { event_id: eventId, tab },
        }
      )
      return data.data
    },
    enabled: !!eventId, // Only run the query if an event is selected
  })
}

// ==========================================
// 2. FETCH HOOKS (Queries) - ADD THIS
// ==========================================
export const useTemplateQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ["email-templates", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: EmailTemplateDetail }>(
        `/email-templates/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

// ==========================================
// 3. ACTION HOOKS (Mutations)
// ==========================================
export const useTemplateMutations = () => {
  const queryClient = useQueryClient()

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/email-templates/${id}/duplicate`)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
    },
    onError: () => {
      toast.error("Failed to duplicate template.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/email-templates/${id}`)
    },
    onSuccess: () => {
      toast.success("Template deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
    },
    onError: () => {
      toast.error("Failed to delete template.")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: {
        html_body?: string
        design_json?: Record<string, unknown>
        name?: string
        subject?: string
        thumbnail_path?: string
      }
    }) => {
      const response = await api.put(`/email-templates/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Template saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  return { duplicateMutation, deleteMutation, updateMutation }
}
