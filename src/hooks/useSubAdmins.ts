import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { type User } from "@/store/useAuthStore"

export const useSubAdminsQuery = () => {
  return useQuery({
    queryKey: ["subAdmins"],
    queryFn: async () => {
      const { data } = await api.get<{ data: User[] }>("/admin/sub-admins")
      return data.data
    },
  })
}

export const useSubAdminMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["subAdmins"] })

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: number; data: any }) => {
      if (payload.id) {
        const { data } = await api.put(
          `/admin/sub-admins/${payload.id}`,
          payload.data
        )
        return data
      }
      const { data } = await api.post("/admin/sub-admins", payload.data)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      invalidate()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Operation failed")
    },
  })

  return { saveMutation }
}
