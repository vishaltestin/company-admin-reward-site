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
  /**
   * Effective visibility on the storefront (pivot override ?? global).
   * global_is_active=false means the platform deactivated this category;
   * pivot_is_active=true is the company's "show anyway" override
   * (null = inherit the platform setting).
   */
  is_active?: boolean
  global_is_active?: boolean
  pivot_is_active?: boolean | null
  pivot_sort_order?: number | null
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

/**
 * HR's per-company category controls:
 * - order: the FULL list of assigned category ids in the desired display
 *   order (the backend writes sort_order 1..N for every one of them).
 * - statuses: per-category activation override. is_active=true opts IN to a
 *   platform-deactivated category, false forces it off, null reverts to
 *   inheriting the platform setting.
 */
export const useCategoryPreferencesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      order?: number[]
      statuses?: { id: number; is_active: boolean | null }[]
    }) => {
      const { data } = await api.put<{ message: string }>(
        "/company/category-preferences",
        payload
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["catalogConfig"] })
      toast.success(data.message)
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to update category preferences.")
      }
    },
  })
}
