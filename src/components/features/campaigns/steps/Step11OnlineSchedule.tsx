import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, ChevronLeft, CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step11OnlineSchema, type Step11OnlineData } from "../schemas"

/**
 * Current moment as a datetime-local string (YYYY-MM-DDTHH:mm) in the
 * user's timezone — the value format the picker compares against.
 */
const nowLocal = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

/** datetime-local value → comparable number (0 for empty strings). */
const toEpoch = (value: string | undefined | null) =>
  value ? new Date(value).getTime() : 0

export function Step11OnlineSchedule() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

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
      send_initial_reminder: !!storeData.reminder_initial_date,
      reminder_initial_date: storeData.reminder_initial_date || "",
      send_expiry_reminder: !!storeData.reminder_expiry_date,
      reminder_expiry_date: storeData.reminder_expiry_date || "",
    },
  })

  // const sendInitialReminder = watch("send_initial_reminder")
  // const sendExpiryReminder = watch("send_expiry_reminder")
  const [sendInitialReminder, sendExpiryReminder, startsAt, expiresAt] =
    useWatch({
      control,
      name: [
        "send_initial_reminder",
        "send_expiry_reminder",
        "starts_at",
        "expires_at",
      ],
    })

  // ── Date bounds (native pickers can't select outside these) ──────────
  // Launch:  now or later.  Expiry: after launch.  Follow-up reminder:
  // between launch and expiry.  Urgent reminder: now → expiry.
  const minLaunch = nowLocal()
  const minExpiry = toEpoch(startsAt) ? startsAt! : minLaunch
  const minInitialReminder = toEpoch(startsAt) ? startsAt! : minLaunch
  const maxInitialReminder = toEpoch(expiresAt) ? expiresAt! : undefined
  const minExpiryReminder = minLaunch
  const maxExpiryReminder = toEpoch(expiresAt) ? expiresAt! : undefined

  const onSubmit = (formData: Step11OnlineData) => {
    updateData({
      starts_at: formData.starts_at,
      expires_at: formData.expires_at,
      reminder_initial_date: formData.send_initial_reminder
        ? formData.reminder_initial_date
        : undefined,
      reminder_expiry_date: formData.send_expiry_reminder
        ? formData.reminder_expiry_date
        : undefined,
    })
    nextStep()
  }

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
            When should this campaign launch and end?
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
                Can't be in the past — pick a launch from now onwards.
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
                Leave blank if rewards never expire. Must be after the launch
                date.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="h-5 w-5" /> Automated Reminders
          </h3>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_initial_reminder"
                  checked={sendInitialReminder}
                  onCheckedChange={(val) =>
                    setValue("send_initial_reminder", !!val)
                  }
                />
                <Label htmlFor="send_initial_reminder" className="font-medium">
                  Send follow-up reminder after launch
                </Label>
              </div>

              {sendInitialReminder && (
                <div className="animate-in space-y-2 pl-6 fade-in">
                  <Label htmlFor="reminder_initial_date">Reminder Date</Label>
                  <Input
                    id="reminder_initial_date"
                    type="datetime-local"
                    className="bg-white"
                    min={minInitialReminder}
                    max={maxInitialReminder}
                    {...register("reminder_initial_date")}
                  />
                  {errors.reminder_initial_date ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.reminder_initial_date.message}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Must be after launch
                      {maxInitialReminder ? " and before expiration" : ""}.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_expiry_reminder"
                  checked={sendExpiryReminder}
                  onCheckedChange={(val) =>
                    setValue("send_expiry_reminder", !!val)
                  }
                />
                <Label htmlFor="send_expiry_reminder" className="font-medium">
                  Send "Urgent" reminder before expiration
                </Label>
              </div>

              {sendExpiryReminder && (
                <div className="animate-in space-y-2 pl-6 fade-in">
                  <Label htmlFor="reminder_expiry_date">Reminder Date</Label>
                  <Input
                    id="reminder_expiry_date"
                    type="datetime-local"
                    className="bg-white"
                    min={minExpiryReminder}
                    max={maxExpiryReminder}
                    {...register("reminder_expiry_date")}
                  />
                  {errors.reminder_expiry_date ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.reminder_expiry_date.message}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Must be in the future
                      {maxExpiryReminder ? " and before expiration" : ""}.
                    </p>
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
