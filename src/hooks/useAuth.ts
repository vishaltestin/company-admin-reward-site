import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, rootApi } from "@/lib/axios"
import { useAuthStore } from "@/store/useAuthStore"

const getCsrfCookie = async () => {
  await rootApi.get("/sanctum/csrf-cookie")
}
export const useAuthQuery = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/profile/me")
        setUser(data.data)
        return data.data
      } catch (error) {
        clearUser()
        throw error
      }
    },
    retry: false,
  })
}

export const useLoginMutation = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      await getCsrfCookie()
      const { data } = await api.post("/auth/login", credentials)
      return data
    },
    onSuccess: (data) => {
      setUser(data.user)
    },
  })
}

export const useLogoutMutation = () => {
  const clearUser = useAuthStore((state) => state.clearUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout")
    },
    onSuccess: () => {
      clearUser()
      queryClient.clear()
    },
  })
}
