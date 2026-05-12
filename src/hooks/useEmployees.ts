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
}

import { type User } from "@/store/useAuthStore"

interface UseEmployeesParams {
  vertical: string
  page: number
  search: string
}

export const useEmployeesQuery = ({
  vertical,
  page,
  search,
}: UseEmployeesParams) => {
  return useQuery({
    queryKey: ["employees", vertical, page, search],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>("/employees", {
        params: {
          vertical,
          page,
          search: search || undefined,
        },
      })
      return data
    },
    placeholderData: (previousData) => previousData,
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
      // Invalidate both lists so the user disappears from Employees and appears in System Admins
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to promote employee")
    },
  })
}
