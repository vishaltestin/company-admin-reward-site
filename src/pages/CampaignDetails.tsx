import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Gift,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  Settings2,
  Users,
  Wallet,
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
import { useLandingPageDetailQuery } from "@/hooks/landing-pages"
import { useTemplateQuery } from "@/hooks/templates"

interface BulkItem {
  product_id: string | number
  variant_id: string | number
  product_name: string
  variant_name: string
  quantity: number
}

/** Per-recipient reward record — added to the campaign detail payload. */
interface CampaignEntitlement {
  id: number
  reward_value: number | string
  claim_code?: string | null
  is_claimed: boolean
  claimed_at?: string | null
  expires_at?: string | null
  created_at?: string | null
  user?: { first_name?: string; last_name?: string; email?: string } | null
}

interface Campaign {
  id: number
  name: string
  description?: string | null
  distribution_type: string
  reward_type?: string
  budget_locked: number | string
  total_budget: number | string
  total_recipients: number
  status: string
  starts_at: string
  expires_at?: string | null
  created_at: string
  custom_event_name?: string | null
  config_json?: Record<string, unknown>
  vertical?: { name?: string } | null
  event?: { title?: string } | null
  entitlements?: CampaignEntitlement[] | null
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

const Card = ({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={`rounded-xl border bg-white p-6 shadow-sm ${className}`}>
    <h3 className="mb-4 flex items-center font-bold text-gray-900">
      <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
    </h3>
    {children}
  </div>
)

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

const formatReminderDates = (dates: string[]) =>
  dates
    .map((date) =>
      new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        dateStyle: "medium",
      })
    )
    .join(", ")

const inr = (value: number | string | null | undefined) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN")}`

/**
 * Resolves a landing-page template id to its real name (falls back to the
 * id while loading / if deleted), with a direct preview link.
 */
const LandingTemplateName = ({ id }: { id: number }) => {
  const { data: template, isLoading } = useLandingPageDetailQuery(String(id))
  return (
    <span className="inline-flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
      ) : (
        <>
          <span>{template?.title || template?.name || `Template #${id}`}</span>
          <a
            href={`/landing-pages/preview/${id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            Preview <ExternalLink className="h-3 w-3" />
          </a>
        </>
      )}
    </span>
  )
}

/** Resolves an email template id to its real name, with an edit link. */
const EmailTemplateName = ({ id }: { id: number }) => {
  const { data: template, isLoading } = useTemplateQuery(String(id))
  return (
    <span className="inline-flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
      ) : (
        <>
          <span>{template?.name || `Template #${id}`}</span>
          <a
            href={`/email-templates/editor/${id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </>
      )}
    </span>
  )
}

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

  const data = campaign as unknown as Campaign
  const isOnline = data.distribution_type === "online"
  const isBulk = data.distribution_type === "bulk"
  const config = (data.config_json || {}) as Record<string, any>
  const initialReminderDates: string[] = Array.isArray(
    config.reminder_initial_dates
  )
    ? config.reminder_initial_dates.filter(
        (date: unknown): date is string => typeof date === "string"
      )
    : typeof config.reminder_initial_date === "string"
      ? [config.reminder_initial_date]
      : []
  const expiryReminderDates: string[] = Array.isArray(
    config.reminder_expiry_dates
  )
    ? config.reminder_expiry_dates.filter(
        (date: unknown): date is string => typeof date === "string"
      )
    : typeof config.reminder_expiry_date === "string"
      ? [config.reminder_expiry_date]
      : []

  const canCancel = ["processing", "inquiry_pending", "active"].includes(
    data.status
  )

  // ── Recipient / claim stats (online campaigns) ──────────────────────
  const entitlements = data.entitlements ?? []
  const claimed = entitlements.filter((e) => e.is_claimed)
  const claimedCount = claimed.length
  const claimPct =
    entitlements.length > 0
      ? Math.round((claimedCount / entitlements.length) * 100)
      : 0
  const valueClaimed = claimed.reduce(
    (sum, e) => sum + Number(e.reward_value ?? 0),
    0
  )
  const perRecipient =
    entitlements[0]?.reward_value ??
    (data.total_recipients > 0
      ? Number(data.total_budget) / data.total_recipients
      : null)

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
              {data.name}
            </h1>
            {getStatusBadge(data.status)}
          </div>
          <p className="mt-1 text-gray-500">
            {data.description || "No description provided."}
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
        <Card icon={Settings2} title="Core Information">
          <div className="space-y-1">
            <DetailRow
              label="Distribution Method"
              value={
                isOnline ? "Online Digital Gift" : "Wholesale Physical Order"
              }
            />
            <DetailRow
              label="Target Audience"
              value={data.vertical?.name}
              icon={Users}
            />
            <DetailRow
              label="Occasion / Event"
              value={data.custom_event_name || data.event?.title}
              icon={Calendar}
            />
            <DetailRow
              label="Reward Value / Recipient"
              value={isOnline && perRecipient != null ? inr(perRecipient) : "—"}
              icon={Gift}
            />
            <DetailRow label="Created On" value={formatDate(data.created_at)} />
          </div>
        </Card>

        <Card icon={CreditCard} title="Scope & Financials">
          <div className="space-y-1">
            {isOnline ? (
              <>
                <DetailRow
                  label="Reward Mechanism"
                  value={data.reward_type?.toUpperCase()}
                />
                <DetailRow
                  label="Total Recipients"
                  value={data.total_recipients}
                />
                <DetailRow
                  label="Escrow Budget Locked"
                  value={
                    <span className="font-bold text-green-600">
                      {inr(data.budget_locked)}
                    </span>
                  }
                />
                <DetailRow
                  label="Total Budget"
                  value={
                    <span className="font-bold text-green-600">
                      {inr(data.total_budget)}
                    </span>
                  }
                />
                <DetailRow
                  label="Reward Value Claimed"
                  value={
                    <span className="font-bold text-blue-700">
                      {inr(valueClaimed)}
                    </span>
                  }
                  icon={Wallet}
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
        </Card>

        {isOnline && (
          <>
            {/* ── Claim progress ─────────────────────────────────────── */}
            <Card
              icon={CheckCircle2}
              title="Claim Status"
              className="md:col-span-2"
            >
              <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="text-2xl font-bold text-gray-900">
                  {claimedCount}{" "}
                  <span className="text-base font-medium text-gray-500">
                    of {entitlements.length || data.total_recipients} claimed
                  </span>
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {claimPct}% completion
                </Badge>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${claimPct}%` }}
                />
              </div>
            </Card>

            {/* ── Schedule & reminders ───────────────────────────────── */}
            <Card
              icon={CalendarClock}
              title="Schedule & Reminders"
              className="md:col-span-2"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <DetailRow
                    label="Launch Date"
                    value={formatDate(data.starts_at)}
                  />
                  <DetailRow
                    label="Expiration"
                    value={
                      data.expires_at ? formatDate(data.expires_at) : "Never"
                    }
                  />
                </div>
                <div className="space-y-1">
                  <DetailRow
                    label="Follow-up Reminders"
                    value={
                      initialReminderDates.length > 0 ? (
                        formatReminderDates(initialReminderDates)
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )
                    }
                    icon={Clock}
                  />
                  <DetailRow
                    label="Expiry Reminders"
                    value={
                      expiryReminderDates.length > 0 ? (
                        formatReminderDates(expiryReminderDates)
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )
                    }
                    icon={Clock}
                  />
                </div>
              </div>
            </Card>

            {/* ── Experience & communication ─────────────────────────── */}
            <Card
              icon={LayoutTemplate}
              title="Experience & Communication"
              className="md:col-span-2"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <DetailRow
                    label="Landing Page"
                    value={
                      config.landing_page_template_id ? (
                        <LandingTemplateName
                          id={Number(config.landing_page_template_id)}
                        />
                      ) : (
                        "—"
                      )
                    }
                  />
                  <DetailRow
                    label="Email Template"
                    value={
                      config.email_template_id ? (
                        <EmailTemplateName
                          id={Number(config.email_template_id)}
                        />
                      ) : (
                        "—"
                      )
                    }
                    icon={Mail}
                  />
                  <DetailRow
                    label="Catalog Products"
                    value={
                      Array.isArray(config.catalog_selection)
                        ? config.catalog_selection.length
                        : "Entire catalog"
                    }
                  />
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    SMS Payload
                  </span>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-gray-900">
                    {config.sms_content || "No SMS configured."}
                  </p>
                  {config.sms_cta && (
                    <div className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      CTA: {config.sms_cta}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* ── Recipient table ────────────────────────────────────── */}
            {entitlements.length > 0 && (
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm md:col-span-2">
                <div className="border-b p-6">
                  <h3 className="flex items-center font-bold text-gray-900">
                    <Users className="mr-2 h-5 w-5 text-primary" /> Recipients &
                    Claim Status
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {entitlements.length} reward
                    {entitlements.length === 1 ? "" : "s"} issued for this
                    campaign.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Recipient</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3 text-right">Reward Value</th>
                        {data.reward_type === "code" && (
                          <th className="px-6 py-3">Claim Code</th>
                        )}
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {entitlements.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 font-medium text-gray-900">
                            {e.user?.first_name || e.user?.last_name
                              ? `${e.user?.first_name ?? ""} ${e.user?.last_name ?? ""}`.trim()
                              : "—"}
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {e.user?.email || "—"}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold">
                            {inr(e.reward_value)}
                          </td>
                          {data.reward_type === "code" && (
                            <td className="px-6 py-3 font-mono text-xs">
                              {e.claim_code || "—"}
                            </td>
                          )}
                          <td className="px-6 py-3">
                            {e.is_claimed ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Claimed {formatDate(e.claimed_at)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
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
              Are you sure you want to cancel <strong>{data.name}</strong>?
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
