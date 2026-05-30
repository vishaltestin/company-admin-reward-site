import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { useAuthStore, type User } from "@/store/useAuthStore"
export interface CatalogVariant {
  id: number
  name: string
  sku: string
  image_url: string | null
  mrp: number
  selling_price: number
}

export interface CatalogProduct {
  id: number
  category_id: number
  name: string
  main_image: string | null
  selling_price: number
  mrp: number
  has_variants?: boolean
  variants?: CatalogVariant[]
  tier_prices?: {
    variant_id: number | null
    min_quantity: number
    selling_price: number
  }[]
}

export interface CatalogCategory {
  id: number
  name: string
  parent_id: number | null
  primary_products: CatalogProduct[]
  secondary_products?: CatalogProduct[]
}

export interface CatalogConfigResponse {
  categories: CatalogCategory[]
  hidden_category_ids: number[]
  hidden_product_ids: number[]
}

export const useCatalogConfigQuery = () => {
  return useQuery({
    queryKey: ["catalogConfig"],
    queryFn: async () => {
      const { data } = await api.get<CatalogConfigResponse>(
        "/company/catalog-config"
      )
      return data
    },
  })
}

export const useCatalogVisibilityMutation = () => {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: {
      hidden_category_ids: number[]
      hidden_product_ids: number[]
    }) => {
      const { data } = await api.put<{
        message: string
        company: User["company"]
      }>("/company/catalog-visibility", payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["catalogConfig"] })

      if (user && data.company) {
        setUser({ ...user, company: data.company })
      }

      toast.success(data.message)
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to update catalog visibility.")
      }
    },
  })
}
