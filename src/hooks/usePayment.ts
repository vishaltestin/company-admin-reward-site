import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { useAuthStore } from "@/store/useAuthStore"

export interface PaymentBalanceResponse {
  balance: number
  points_name: string
  point_multiplier: number
}

export interface Transaction {
  id: number
  type: "credit" | "debit"
  amount: string | number
  fiat_paid: string | number | null
  description: string | null
  created_at: string
}

export interface PaginatedTransactionsResponse {
  current_page: number
  data: Transaction[]
  last_page: number
  total: number
}

export interface TopUpResponse {
  message: string
  new_balance: number
}

export const useWalletBalanceQuery = () => {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const { data } = await api.get<PaymentBalanceResponse>("/payment/balance")
      return data
    },
  })
}

export const useTransactionsQuery = (page = 1) => {
  return useQuery({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const { data } = await api.get<PaginatedTransactionsResponse>(
        `/payment/transactions?page=${page}`
      )
      return data
    },
  })
}

export const useMockTopUpMutation = () => {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: { fiat_amount: number }) => {
      const { data } = await api.post<TopUpResponse>(
        "/payment/top-up/mock",
        payload
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })

      if (user && user.company) {
        setUser({
          ...user,
          company: {
            ...user.company,
            wallet_balance: data.new_balance,
          },
        })
      }

      toast.success(data.message)
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to process payment.")
      }
    },
  })
}
