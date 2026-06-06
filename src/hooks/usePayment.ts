import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { useAuthStore } from "@/store/useAuthStore"

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface RazorpayOrderResponse {
  order_id: string
  amount: number // in paise
  currency: string
  key_id: string
  company_name: string
  user_name: string
  user_email: string
}

// Razorpay's global type (loaded via CDN script)
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
  theme?: { color?: string }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// ─── Utility: Load Razorpay Script ───────────────────────────────────────────

/**
 * Dynamically loads the Razorpay checkout script if it hasn't been loaded yet.
 * Returns a promise that resolves when the script is ready.
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Razorpay) {
      resolve()
      return
    }

    // Check if script tag already exists (e.g. mid-load)
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay script failed to load"))
      )
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(
        new Error(
          "Failed to load Razorpay SDK. Check your internet connection."
        )
      )
    document.body.appendChild(script)
  })
}

// ─── Queries ──────────────────────────────────────────────────────────────────

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

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * useRazorpayTopUpMutation
 *
 * Full Razorpay payment flow:
 *   1. Call backend to create a Razorpay order → get order_id
 *   2. Load Razorpay checkout script (cached after first load)
 *   3. Open Razorpay modal → user pays
 *   4. On success, Razorpay calls handler with payment proof
 *   5. Send proof to backend for signature verification + wallet credit
 */
export const useRazorpayTopUpMutation = () => {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (fiat_amount: number): Promise<TopUpResponse> => {
      // ── Step 1: Create order on your backend ──────────────────────────────
      const { data: order } = await api.post<RazorpayOrderResponse>(
        "/payment/razorpay/order",
        { fiat_amount }
      )

      // ── Step 2: Ensure Razorpay script is loaded ──────────────────────────
      await loadRazorpayScript()

      // ── Step 3 & 4: Open modal, wait for user to pay ──────────────────────
      return new Promise<TopUpResponse>((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: order.key_id,
          amount: order.amount, // paise
          currency: order.currency,
          name: order.company_name,
          description: "Wallet Top-up",
          order_id: order.order_id,
          prefill: {
            name: order.user_name,
            email: order.user_email,
          },
          theme: {
            color: "#6366f1", // match your app's primary color
          },
          modal: {
            ondismiss: () => {
              reject(new Error("PAYMENT_CANCELLED"))
            },
          },
          handler: async (response: RazorpaySuccessResponse) => {
            // ── Step 5: Verify on backend ────────────────────────────────────
            try {
              const { data } = await api.post<TopUpResponse>(
                "/payment/razorpay/verify",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  fiat_amount,
                }
              )
              resolve(data)
            } catch (err) {
              reject(err)
            }
          },
        })

        razorpay.open()
      })
    },

    onSuccess: (data) => {
      // Refresh balance + transaction list
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })

      // Also update Zustand store so header/nav shows updated balance immediately
      if (user?.company) {
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
      if (error instanceof Error && error.message === "PAYMENT_CANCELLED") {
        toast.info("Payment cancelled.")
        return
      }
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to process payment.")
      }
    },
  })
}

// Keep the mock for easy fallback during development if needed
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
      if (user?.company) {
        setUser({
          ...user,
          company: { ...user.company, wallet_balance: data.new_balance },
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
