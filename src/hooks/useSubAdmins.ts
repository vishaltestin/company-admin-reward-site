import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { type User } from "@/store/useAuthStore"
import { AxiosError } from "axios"

export const useSubAdminsQuery = () => {
  return useQuery({
    queryKey: ["subAdmins"],
    queryFn: async () => {
      const { data } = await api.get<{ data: User[] }>("/sub-admins")
      return data.data
    },
  })
}

export const useSubAdminMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["subAdmins"] })

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: number
      data: Record<string, unknown>
    }) => {
      if (payload.id) {
        const { data } = await api.put(
          `/admin/sub-admins/${payload.id}`,
          payload.data
        )
        return data
      }
      const { data } = await api.post("/sub-admins", payload.data)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      invalidate()
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Operation failed. Please try again.")
      }
    },
  })

  return { saveMutation }
}
