import { create } from "zustand"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  mobile: string | null
  gender: string | null
  dob: string | null

  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  country: string | null

  shipping_address_line_1: string | null
  shipping_address_line_2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_pincode: string | null
  shipping_country: string | null

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
    verification_status: "pending" | "submitted" | "verified" | "rejected"
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
