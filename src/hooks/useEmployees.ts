import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AxiosError } from "axios"

interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  total: number
  from: number | null
  to: number | null
  per_page: number
}

import { type User } from "@/store/useAuthStore"

export interface EmployeeSegmentFilters {
  department?: string
  job_seniority?: string
  workforce_type?: string
  job_mode?: string
  location?: string
  job_title?: string
}

interface UseEmployeesParams {
  vertical: string
  page: number
  search: string
  activeOnly?: boolean
  /** Department / seniority / workforce type / job mode / location filters. */
  segment?: EmployeeSegmentFilters
}

export const useEmployeesQuery = ({
  vertical,
  page,
  search,
  activeOnly = false,
  segment = {},
}: UseEmployeesParams) => {
  return useQuery({
    queryKey: ["employees", vertical, page, search, activeOnly, segment],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>("/employees", {
        params: {
          vertical,
          page,
          search: search || undefined,
          active_only: activeOnly ? 1 : undefined,
          department: segment.department || undefined,
          job_seniority: segment.job_seniority || undefined,
          workforce_type: segment.workforce_type || undefined,
          job_mode: segment.job_mode || undefined,
          location: segment.location || undefined,
          job_title: segment.job_title || undefined,
        },
      })
      return data
    },
    placeholderData: (previousData) => previousData,
  })
}

export interface EmployeeFilterOptions {
  department: string[]
  job_seniorities: string[]
  workforce_type: string[]
  job_mode: string[]
  location: string[]
  job_title: string[]
}

/**
 * Values actually present in this company's recipient data, used to populate
 * the segmentation dropdowns (a dropdown of values nobody has is useless).
 */
export const useEmployeeFilterOptions = (vertical: string) => {
  return useQuery({
    queryKey: ["employee-filter-options", vertical],
    queryFn: async () => {
      const { data } = await api.get<{ data: EmployeeFilterOptions }>(
        "/employees/filter-options",
        { params: { vertical } }
      )
      return data.data
    },
    enabled: !!vertical,
    staleTime: 5 * 60 * 1000,
  })
}

export const usePromoteEmployeeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: { managed_vertical_ids: number[] }
    }) => {
      const response = await api.post(`/employees/${id}/promote`, data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to promote employee")
    },
  })
}

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/employees/${id}`)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || "Recipient deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete recipient")
    },
  })
}
