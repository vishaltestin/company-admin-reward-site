import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, ChevronLeft, CalendarClock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step11OnlineSchema, type Step11OnlineData } from "../schemas"
import {
  type CampaignRewardType,
  useCampaignEmailTemplates,
} from "@/hooks/useCampaignOptions"

/** Current moment as a datetime-local string in the user's timezone. */
const nowLocal = () => {
  const date = new Date()
  date.setSeconds(0, 0)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

/** Current local calendar date as YYYY-MM-DD. */
const todayLocal = () => {
  const date = new Date()
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

/** Move an ISO calendar date by whole days without UTC/timezone drift. */
const shiftDate = (value: string, days: number) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  const date = new Date(year, month - 1, day + days)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

export function Step11OnlineSchedule() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  const rewardType: CampaignRewardType | null =
    storeData.reward_type === "points" ||
    storeData.reward_type === "code" ||
    storeData.reward_type === "link"
      ? storeData.reward_type
      : null

  const { data: standardTemplates, isLoading: isLoadingStandardTemplates } =
    useCampaignEmailTemplates(
      storeData.event_id ?? null,
      storeData.vertical_id ?? null,
      "global",
      rewardType
    )
  const { data: savedTemplates, isLoading: isLoadingSavedTemplates } =
    useCampaignEmailTemplates(
      storeData.event_id ?? null,
      storeData.vertical_id ?? null,
      "variations",
      rewardType
    )

  const reminderTemplates = [
    ...(standardTemplates ?? []).map((template) => ({
      ...template,
      sourceLabel: "Standard",
    })),
    ...(savedTemplates ?? []).map((template) => ({
      ...template,
      sourceLabel: "Saved",
    })),
  ]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step11OnlineData>({
    resolver: zodResolver(step11OnlineSchema),
    defaultValues: {
      starts_at: storeData.starts_at || "",
      expires_at: storeData.expires_at || "",
      send_initial_reminder:
        storeData.send_initial_reminder ?? !!storeData.reminder_initial_date,
      reminder_initial_date: storeData.reminder_initial_date || "",
      reminder_initial_template_id: storeData.reminder_initial_template_id,
      send_expiry_reminder:
        storeData.send_expiry_reminder ?? !!storeData.reminder_expiry_date,
      reminder_expiry_date: storeData.reminder_expiry_date || "",
      reminder_expiry_template_id: storeData.reminder_expiry_template_id,
    },
  })

  const sendInitialReminder = useWatch({
    control,
    name: "send_initial_reminder",
  })
  const sendExpiryReminder = useWatch({ control, name: "send_expiry_reminder" })
  const startsAt = useWatch({ control, name: "starts_at" })
  const expiresAt = useWatch({ control, name: "expires_at" })
  const initialTemplateId = useWatch({
    control,
    name: "reminder_initial_template_id",
  })
  const expiryTemplateId = useWatch({
    control,
    name: "reminder_expiry_template_id",
  })

  const today = todayLocal()
  const tomorrow = shiftDate(today, 1)
  const minLaunch = nowLocal()
  const minExpiry = startsAt || minLaunch
  const launchDate = startsAt ? startsAt.slice(0, 10) : today
  const minInitialReminder = shiftDate(
    launchDate < today ? today : launchDate,
    1
  )
  const minExpiryReminder = tomorrow
  const maxReminderDate = expiresAt
    ? shiftDate(expiresAt.slice(0, 10), -1)
    : undefined

  const onSubmit = (formData: Step11OnlineData) => {
    updateData({
      starts_at: formData.starts_at,
      expires_at: formData.expires_at || undefined,
      send_initial_reminder: formData.send_initial_reminder,
      reminder_initial_date: formData.send_initial_reminder
        ? formData.reminder_initial_date
        : undefined,
      reminder_initial_template_id: formData.send_initial_reminder
        ? formData.reminder_initial_template_id
        : undefined,
      send_expiry_reminder: formData.send_expiry_reminder,
      reminder_expiry_date: formData.send_expiry_reminder
        ? formData.reminder_expiry_date
        : undefined,
      reminder_expiry_template_id: formData.send_expiry_reminder
        ? formData.reminder_expiry_template_id
        : undefined,
    })
    nextStep()
  }

  const updateTemplateSelection = (
    field: "reminder_initial_template_id" | "reminder_expiry_template_id",
    value: string
  ) => {
    setValue(field, value === "campaign" ? undefined : Number(value), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const renderTemplateSelect = (
    field: "reminder_initial_template_id" | "reminder_expiry_template_id",
    selectedId: number | undefined,
    label: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <select
        id={field}
        value={selectedId ? String(selectedId) : "campaign"}
        onChange={(event) =>
          updateTemplateSelection(field, event.currentTarget.value)
        }
        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
      >
        <option value="campaign">Use the campaign email template</option>
        {reminderTemplates.map((template) => (
          <option key={template.id} value={String(template.id)}>
            {template.name} ({template.sourceLabel})
          </option>
        ))}
      </select>
      {isLoadingStandardTemplates || isLoadingSavedTemplates ? (
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading compatible email
          templates…
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Only templates compatible with this reward type and vertical are
          listed. The campaign email template is used by default.
        </p>
      )}
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Schedule & Timeline
          </h2>
          <p className="text-muted-foreground">
            Choose the launch and expiration times. Reminder emails are sent at
            9:00 a.m. on their selected calendar date.
          </p>
        </div>

        <div className="grid gap-8 border-b pb-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Label
              htmlFor="starts_at"
              className={errors.starts_at ? "text-destructive" : ""}
            >
              Launch Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="starts_at"
              type="datetime-local"
              min={minLaunch}
              {...register("starts_at")}
            />
            {errors.starts_at ? (
              <p className="text-sm font-medium text-destructive">
                {errors.starts_at.message}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Choose a launch from now onwards.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="expires_at">
              Expiration Date & Time (Optional)
            </Label>
            <Input
              id="expires_at"
              type="datetime-local"
              min={minExpiry}
              {...register("expires_at")}
            />
            {errors.expires_at ? (
              <p className="text-sm font-medium text-destructive">
                {errors.expires_at.message}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Leave blank if rewards never expire. Must be after launch.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-5 w-5" /> Automated Reminders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Both reminders use the selected campaign email by default. You can
              choose a separate compatible template for either reminder.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_initial_reminder"
                  checked={!!sendInitialReminder}
                  onCheckedChange={(value) => {
                    const enabled = !!value
                    setValue("send_initial_reminder", enabled, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    if (!enabled) {
                      setValue("reminder_initial_date", "")
                      setValue("reminder_initial_template_id", undefined)
                    }
                  }}
                />
                <Label htmlFor="send_initial_reminder" className="font-medium">
                  Send follow-up reminder after launch
                </Label>
              </div>

              {sendInitialReminder && (
                <div className="animate-in space-y-4 pl-6 fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="reminder_initial_date">
                      Follow-up Reminder Date
                    </Label>
                    <Input
                      id="reminder_initial_date"
                      type="date"
                      className="bg-white"
                      min={minInitialReminder}
                      max={maxReminderDate}
                      {...register("reminder_initial_date")}
                    />
                    {errors.reminder_initial_date ? (
                      <p className="text-sm font-medium text-destructive">
                        {errors.reminder_initial_date.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Select a future calendar date after launch and before
                        expiration.
                      </p>
                    )}
                  </div>
                  {renderTemplateSelect(
                    "reminder_initial_template_id",
                    initialTemplateId,
                    "Follow-up Email Template"
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_expiry_reminder"
                  checked={!!sendExpiryReminder}
                  onCheckedChange={(value) => {
                    const enabled = !!value
                    setValue("send_expiry_reminder", enabled, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    if (!enabled) {
                      setValue("reminder_expiry_date", "")
                      setValue("reminder_expiry_template_id", undefined)
                    }
                  }}
                />
                <Label
                  htmlFor="send_expiry_reminder"
                  className={`font-medium ${!expiresAt ? "text-gray-400" : ""}`}
                >
                  Send urgent reminder before expiration
                </Label>
              </div>

              {!expiresAt && (
                <p className="pl-6 text-xs text-gray-500">
                  Set an expiration date to enable this reminder.
                </p>
              )}

              {sendExpiryReminder && (
                <div className="animate-in space-y-4 pl-6 fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="reminder_expiry_date">
                      Expiry Reminder Date
                    </Label>
                    <Input
                      id="reminder_expiry_date"
                      type="date"
                      className="bg-white"
                      min={minExpiryReminder}
                      max={maxReminderDate}
                      {...register("reminder_expiry_date")}
                    />
                    {errors.reminder_expiry_date ? (
                      <p className="text-sm font-medium text-destructive">
                        {errors.reminder_expiry_date.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Select a future calendar date before expiration.
                      </p>
                    )}
                  </div>
                  {renderTemplateSelect(
                    "reminder_expiry_template_id",
                    expiryTemplateId,
                    "Expiry Email Template"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Continue to Summary <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
