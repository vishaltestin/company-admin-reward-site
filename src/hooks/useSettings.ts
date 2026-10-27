import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { api } from "@/lib/axios"
import { useAuthStore, type User } from "@/store/useAuthStore"

const handleApiError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    toast.error(error.response.data.message)
  } else {
    toast.error(fallbackMessage)
  }
}

export const useProfileMutations = () => {
  const setUser = useAuthStore((state) => state.setUser)

  const updateProfile = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await api.put<{ message: string; data: User }>(
        "/profile/update",
        data
      )
      return response.data
    },
    onSuccess: (response) => {
      setUser(response.data)
      toast.success(response.message)
    },
    onError: (error) => handleApiError(error, "Failed to update profile."),
  })

  const changePassword = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await api.post<{ message: string }>(
        "/profile/change-password",
        data
      )
      return response.data
    },
    onSuccess: (response) => {
      toast.success(response.message)
    },
    onError: (error) => handleApiError(error, "Failed to change password."),
  })

  return { updateProfile, changePassword }
}

export const useCompanyMutations = () => {
  const { user, setUser } = useAuthStore()

  const updateBusinessDetails = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<{
        message: string
        company: User["company"]
      }>("/company/business-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    },
    onSuccess: (response) => {
      if (user && response.company) {
        setUser({ ...user, company: response.company })
      }
      toast.success(response.message)
    },
    onError: (error) =>
      handleApiError(error, "Failed to update business details."),
  })

  const updateStorefrontSettings = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<{
        message: string
        company: User["company"]
      }>("/company/storefront-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    },
    onSuccess: (response) => {
      if (user && response.company) {
        setUser({ ...user, company: response.company })
      }
      toast.success(response.message)
    },
    onError: (error) =>
      handleApiError(error, "Failed to update storefront settings."),
  })

  return { updateBusinessDetails, updateStorefrontSettings }
}
