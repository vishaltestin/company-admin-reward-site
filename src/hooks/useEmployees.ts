import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

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
      const { data } = await api.get<PaginatedResponse<User>>(
        "/employees",
        {
          params: {
            vertical,
            page,
            search: search || undefined,
          },
        }
      )
      return data
    },
    placeholderData: (previousData) => previousData,
  })
}
