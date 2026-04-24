import { create } from "zustand"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  mobile: string | null
  user_type: "business_head" | "sub_admin"
  managed_vertical_ids: number[]
  managed_verticals?: { id: number; name: string; slug: string }[]
  is_active: boolean
  wallet_balance: number
  custom_data: Record<string, unknown>
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
    terms_text: string | null
    privacy_text: string | null
    social_links: { platform: string; url: string }[] | null
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  setUser: (user: User) => void
  clearUser: () => void
  setInitialized: (status: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isInitialized: true }),
  setInitialized: (status) => set({ isInitialized: status }),
}))
