import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  LayoutTemplate,
  Loader2,
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  Settings2,
  Users,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useCampaignQuery,
  useCancelCampaignMutation,
} from "@/hooks/useCampaigns"

interface BulkItem {
  product_id: string | number
  variant_id: string | number
  product_name: string
  variant_name: string
  quantity: number
}
interface DetailRowProps {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
}

const DetailRow = ({ label, value, icon: Icon }: DetailRowProps) => (
  <div className="flex items-start justify-between border-b border-gray-100 py-3 last:border-0">
    <span className="flex items-center text-sm text-gray-500">
      {Icon && <Icon className="mr-2 h-4 w-4 text-gray-400" />}
      {label}
    </span>
    <span className="max-w-[60%] text-right text-sm font-medium text-gray-900">
      {value || "—"}
    </span>
  </div>
)

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: campaign, isLoading } = useCampaignQuery(id!)
  const cancelMutation = useCancelCampaignMutation()

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const handleCancel = () => {
    if (!id) return
    cancelMutation.mutate(Number(id), {
      onSuccess: () => {
        setIsCancelModalOpen(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Megaphone className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Campaign Not Found</h2>
        <p className="mt-2 text-gray-500">
          The campaign you are looking for does not exist.
        </p>
        <Button
          onClick={() => navigate("/campaigns")}
          className="mt-6"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
      </div>
    )
  }

  const isOnline = campaign.distribution_type === "online"
  const isBulk = campaign.distribution_type === "bulk"
  const config = campaign.config_json || {}

  const canCancel = ["processing", "inquiry_pending", "active"].includes(
    campaign.status
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        )
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-gray-500">
            Completed
          </Badge>
        )
      case "inquiry_pending":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Inquiry Pending
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="mx-auto max-w-5xl animate-in space-y-6 duration-500 fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/campaigns")}
            className="mb-2 -ml-2 text-gray-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {campaign.name}
            </h1>
            {getStatusBadge(campaign.status)}
          </div>
          <p className="mt-1 text-gray-500">
            {campaign.description || "No description provided."}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="destructive"
            onClick={() => setIsCancelModalOpen(true)}
          >
            <XCircle className="mr-2 h-4 w-4" /> Cancel Campaign
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center font-bold text-gray-900">
            <Settings2 className="mr-2 h-5 w-5 text-primary" /> Core Information
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Distribution Method"
              value={
                isOnline ? "Online Digital Gift" : "Wholesale Physical Order"
              }
            />
            <DetailRow
              label="Target Audience"
              value={campaign.vertical?.name}
              icon={Users}
            />
            <DetailRow
              label="Occasion / Event"
              value={campaign.custom_event_name || campaign.event?.title}
              icon={Calendar}
            />
            <DetailRow
              label="Created On"
              value={new Date(campaign.created_at).toLocaleDateString()}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center font-bold text-gray-900">
            <CreditCard className="mr-2 h-5 w-5 text-primary" /> Scope &
            Financials
          </h3>
          <div className="space-y-1">
            {isOnline ? (
              <>
                <DetailRow
                  label="Reward Mechanism"
                  value={campaign.reward_type?.toUpperCase()}
                />
                <DetailRow
                  label="Total Recipients"
                  value={campaign.total_recipients}
                />
                <DetailRow
                  label="Escrow Budget Locked"
                  value={
                    <span className="font-bold text-green-600">
                      ₹{Number(campaign.budget_locked).toLocaleString()}
                    </span>
                  }
                />
              </>
            ) : (
              <>
                <DetailRow
                  label="Requested Items"
                  value={
                    config.bulk_items?.reduce(
                      (a: number, b: BulkItem) => a + b.quantity,
                      0
                    ) || 0
                  }
                  icon={Package}
                />
                <DetailRow
                  label="Escrow Required"
                  value={
                    <span className="text-gray-500 italic">
                      None (Inquiry Phase)
                    </span>
                  }
                />
              </>
            )}
          </div>
        </div>

        {isOnline && (
          <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
            <h3 className="mb-4 flex items-center font-bold text-gray-900">
              <LayoutTemplate className="mr-2 h-5 w-5 text-primary" />{" "}
              Experience & Communication
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <DetailRow
                  label="Landing Page ID"
                  value={config.landing_page_template_id}
                />
                <DetailRow
                  label="Email Template ID"
                  value={config.email_template_id}
                />
                <DetailRow
                  label="Launch Date"
                  value={new Date(campaign.starts_at).toLocaleString()}
                />
                <DetailRow
                  label="Expiration"
                  value={
                    campaign.expires_at
                      ? new Date(campaign.expires_at).toLocaleString()
                      : "Never"
                  }
                />
              </div>
              <div className="rounded-lg border bg-gray-50 p-4">
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  SMS Payload
                </span>
                <p className="mt-2 text-sm whitespace-pre-wrap text-gray-900">
                  {config.sms_content}
                </p>
                <div className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  CTA: {config.sms_cta}
                </div>
              </div>
            </div>
          </div>
        )}

        {isBulk && (
          <div className="space-y-6 md:col-span-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center font-bold text-gray-900">
                <MapPin className="mr-2 h-5 w-5 text-primary" /> Logistics &
                Customization
              </h3>
              <div className="space-y-4">
                <DetailRow
                  label="Required By Date"
                  value={
                    config.event_date
                      ? new Date(config.event_date).toLocaleDateString()
                      : "—"
                  }
                />
                <div className="rounded-lg border bg-gray-50 p-4">
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Delivery Address
                  </span>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-gray-900">
                    {config.event_address || "Not provided"}
                  </p>
                </div>
                {config.inquiry_notes && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                    <span className="flex items-center text-xs font-bold tracking-wider text-blue-800 uppercase">
                      <MessageSquare className="mr-2 h-4 w-4" /> Inquiry /
                      Branding Notes
                    </span>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-blue-900">
                      {config.inquiry_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="border-b p-6">
                <h3 className="flex items-center font-bold text-gray-900">
                  <Package className="mr-2 h-5 w-5 text-primary" /> Requested
                  Items Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 font-medium text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Variant</th>
                      <th className="px-6 py-3 text-right">Requested Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* 5. Fixed 'any' in map */}
                    {config.bulk_items?.map((item: BulkItem, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3">{item.product_name}</td>
                        <td className="px-6 py-3">{item.variant_name}</td>
                        <td className="px-6 py-3 text-right font-bold">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancel Campaign?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel <strong>{campaign.name}</strong>?
              {isOnline
                ? " The escrowed budget will be instantly refunded to your company wallet."
                : " This will withdraw your wholesale inquiry and our team will stop processing it."}
              <br />
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Campaign
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Yes, Cancel It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
