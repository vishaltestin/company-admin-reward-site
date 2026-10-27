import { useState } from "react"
import {
  ChevronLeft,
  CheckCircle2,
  Pencil,
  Loader2,
  Rocket,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCampaignStore } from "@/store/useCampaignStore"
import { useNavigate } from "react-router-dom"
import { useCreateCampaignMutation } from "@/hooks/useCampaigns"

interface Step13SummaryProps {
  onEditStep?: (stepId: string) => void
}

const EditButton = ({
  stepId,
  onEditStep,
}: {
  stepId: string
  onEditStep?: (stepId: string) => void
}) => {
  if (!onEditStep) return null
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onEditStep(stepId)}
      className="h-8 px-2 text-gray-500 hover:text-primary"
    >
      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
    </Button>
  )
}

const DataRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div className="flex justify-between border-b border-gray-100 py-2 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="max-w-[60%] text-right text-sm font-medium text-gray-900">
      {value || "—"}
    </span>
  </div>
)

export function Step13Summary({ onEditStep }: Step13SummaryProps) {
  const { data, prevStep, resetCampaign } = useCampaignStore()
  const navigate = useNavigate()
  const createCampaign = useCreateCampaignMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const payload = {
      name: data.name,
      description: data.description,
      vertical_id: data.vertical_id,
      event_id: data.event_id,
      custom_event_name: data.custom_event_name,
      distribution_type: data.distribution_type,

      ...(data.distribution_type === "online" && {
        reward_type: data.reward_type,
        recipient_ids: data.recipient_ids,
        reward_value_per_user: data.reward_value_per_user,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        config_json: {
          catalog_selection: data.catalog_selection,
          landing_page_template_id: data.landing_page_template_id,
          email_template_id: data.email_template_id,
          sms_content: data.sms_content,
          sms_cta: data.sms_cta,
          send_initial_reminder: data.send_initial_reminder ?? false,
          reminder_initial_date: data.reminder_initial_date,
          reminder_initial_template_id: data.reminder_initial_template_id,
          send_expiry_reminder: data.send_expiry_reminder ?? false,
          reminder_expiry_date: data.reminder_expiry_date,
          reminder_expiry_template_id: data.reminder_expiry_template_id,
        },
      }),

      ...(data.distribution_type === "bulk" && {
        event_address: data.event_address,
        event_date: data.event_date,
        inquiry_notes: data.inquiry_notes,
        bulk_items: data.bulk_items,
        config_json: {},
      }),
    }

    createCampaign.mutate(payload, {
      onSuccess: () => {
        resetCampaign()
        navigate("/campaigns")
      },
      onSettled: () => {
        setIsSubmitting(false)
      },
    })
  }

  const isOnline = data.distribution_type === "online"
  const isBulk = data.distribution_type === "bulk"

  return (
    <div className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Review & Launch
            </h2>
            <p className="text-muted-foreground">
              Verify your campaign details before submitting.
            </p>
          </div>
          <Rocket className="h-8 w-8 text-primary opacity-20" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900">Campaign Details</h3>
              <EditButton stepId="details" onEditStep={onEditStep} />
            </div>
            <DataRow label="Name" value={data.name} />
            <DataRow label="Description" value={data.description} />
            <DataRow
              label="Event"
              value={data.custom_event_name || `Event ID: ${data.event_id}`}
            />
            <DataRow
              label="Distribution"
              value={isOnline ? "Online Gift" : "Bulk Order"}
            />
          </div>

          {isOnline && (
            <>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">
                    Recipients & Reward
                  </h3>
                  <EditButton stepId="reward" onEditStep={onEditStep} />
                </div>
                <DataRow
                  label="Total Recipients"
                  value={data.recipient_ids?.length || 0}
                />
                <DataRow
                  label="Reward Type"
                  value={data.reward_type?.toUpperCase()}
                />
                <DataRow
                  label="Value per User"
                  value={`₹${data.reward_value_per_user?.toLocaleString()}`}
                />
                <DataRow
                  label="Total Escrow Budget"
                  value={
                    <span className="font-bold text-primary">
                      ₹
                      {(
                        (data.recipient_ids?.length || 0) *
                        (data.reward_value_per_user || 0)
                      ).toLocaleString()}
                    </span>
                  }
                />
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">Communication</h3>
                  <EditButton stepId="email" onEditStep={onEditStep} />
                </div>
                <DataRow
                  label="Landing Page Template"
                  value={
                    data.landing_page_template_id
                      ? `ID: ${data.landing_page_template_id}`
                      : "Not set (optional — skipped)"
                  }
                />
                <DataRow
                  label="Email Template"
                  value={`ID: ${data.email_template_id}`}
                />
                <DataRow
                  label="SMS Length"
                  value={`${data.sms_content?.length || 0}/160 chars`}
                />
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">Schedule</h3>
                  <EditButton stepId="schedule" onEditStep={onEditStep} />
                </div>
                <DataRow
                  label="Launch Date"
                  value={
                    data.starts_at
                      ? new Date(data.starts_at).toLocaleString()
                      : "Immediately"
                  }
                />
                <DataRow
                  label="Expiration"
                  value={
                    data.expires_at
                      ? new Date(data.expires_at).toLocaleString()
                      : "Never"
                  }
                />
                <DataRow
                  label="Follow-up Reminder"
                  value={
                    data.send_initial_reminder && data.reminder_initial_date
                      ? new Date(
                          `${data.reminder_initial_date}T00:00:00`
                        ).toLocaleDateString()
                      : "Off"
                  }
                />
                <DataRow
                  label="Follow-up Email"
                  value={
                    data.send_initial_reminder
                      ? data.reminder_initial_template_id
                        ? `Template #${data.reminder_initial_template_id}`
                        : "Campaign email template"
                      : "—"
                  }
                />
                <DataRow
                  label="Expiry Reminder"
                  value={
                    data.send_expiry_reminder && data.reminder_expiry_date
                      ? new Date(
                          `${data.reminder_expiry_date}T00:00:00`
                        ).toLocaleDateString()
                      : "Off"
                  }
                />
                <DataRow
                  label="Expiry Email"
                  value={
                    data.send_expiry_reminder
                      ? data.reminder_expiry_template_id
                        ? `Template #${data.reminder_expiry_template_id}`
                        : "Campaign email template"
                      : "—"
                  }
                />
              </div>
            </>
          )}

          {isBulk && (
            <>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">Logistics</h3>
                  <EditButton stepId="bulk_logistics" onEditStep={onEditStep} />
                </div>
                <DataRow
                  label="Required By"
                  value={
                    data.event_date
                      ? new Date(data.event_date).toLocaleDateString()
                      : "—"
                  }
                />
                <DataRow
                  label="Delivery Address"
                  value={
                    <span className="line-clamp-2 text-xs">
                      {data.event_address}
                    </span>
                  }
                />
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">Wholesale Inquiry</h3>
                  <EditButton stepId="bulk_catalog" onEditStep={onEditStep} />
                </div>
                <DataRow
                  label="Total Variants"
                  value={data.bulk_items?.length || 0}
                />
                <DataRow
                  label="Total Item Quantity"
                  value={
                    data.bulk_items?.reduce(
                      (acc, curr) => acc + curr.quantity,
                      0
                    ) || 0
                  }
                />
                <DataRow
                  label="Customization Notes"
                  value={data.inquiry_notes ? "Attached" : "None"}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-50 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Processing..." : "Launch Campaign"}
        </Button>
      </div>
    </div>
  )
}
