import { create } from "zustand"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  mobile: string | null
  user_type: "business_head" | "sub_admin"
  managed_vertical_ids: number[]
  is_active: boolean
  wallet_balance: number
  custom_data: Record<string, any>
  company?: {
    id: number
    name: string
    alias: string
    logo_url: string | null
    industry: string | null
    number_of_employee: string | null
    gst_no: string | null
    pan_no: string | null
    address: string | null
    points_name: string
    wallet_balance: number
    is_approved: boolean
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}))
