import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"

export const useCampaignsQuery = (page = 1) => {
  return useQuery({
    queryKey: ["campaigns", page],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns?page=${page}`)
      return data
    },
  })
}

export const useCampaignQuery = (id: string) => {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/campaigns", payload)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to submit campaign.")
      }
    },
  })
}

export const useCancelCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/campaigns/${id}/cancel`)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
    },
  })
}
