import { create } from "zustand"

export interface CampaignDraftData {
  name?: string
  description?: string
  vertical_id?: number
  event_id?: number | null
  custom_event_name?: string
  distribution_type?: "online" | "bulk"
  recipient_ids?: number[]
  reward_type?: "points" | "code" | "link" | "physical_bulk" | null
  reward_value_per_user?: number
  catalog_selection?: number[]
  landing_page_template_id?: number
  email_template_id?: number
  sms_content?: string
  sms_cta?: string
  starts_at?: string
  expires_at?: string
  reminder_initial_date?: string
  reminder_expiry_date?: string
  bulk_total_cost?: number
  event_address?: string
  event_date?: string
  inquiry_notes?: string
  bulk_items?: {
    product_id: number
    product_name: string
    variant_id?: number | null
    variant_name?: string | null
    quantity: number
  }[]
}
interface CampaignStore {
  data: CampaignDraftData
  currentStepIndex: number
  updateData: (partialData: Partial<CampaignDraftData>) => void
  nextStep: () => void
  prevStep: () => void
  setStep: (index: number) => void
  resetCampaign: () => void
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  data: {},
  currentStepIndex: 0,

  updateData: (partialData) =>
    set((state) => ({ data: { ...state.data, ...partialData } })),

  nextStep: () =>
    set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),

  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    })),

  setStep: (index) => set({ currentStepIndex: index }),

  resetCampaign: () => set({ data: {}, currentStepIndex: 0 }),
}))
