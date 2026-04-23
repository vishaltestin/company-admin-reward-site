import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export interface Vertical {
  id: number
  name: string
  slug: string
}

export const useVerticalsQuery = () => {
  return useQuery({
    queryKey: ["verticals"],
    queryFn: async () => {
      const { data } = await api.get<Vertical[]>("/admin/verticals")
      return data
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}
