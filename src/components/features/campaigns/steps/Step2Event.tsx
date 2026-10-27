import { useState, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  Edit3,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step2Schema, type Step2Data } from "../schemas"
import { useCampaignEvents, type EventNode } from "@/hooks/useCampaignOptions"

export function Step2Event() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()
  const { data: events, isLoading } = useCampaignEvents(storeData.vertical_id)

  const [isCustomMode, setIsCustomMode] = useState(
    !!storeData.custom_event_name
  )

  // Find which parent to expand if the user previously selected a nested child event
  const initialParentId = useMemo(() => {
    if (!storeData.event_id || !events) return null
    for (const parent of events) {
      if (parent.id === storeData.event_id) return parent.id // It's a parent/standalone
      if (parent.children?.some((c) => c.id === storeData.event_id))
        return parent.id // It's a child
    }
    return null
  }, [storeData.event_id, events])

  const [expandedParentId, setExpandedParentId] = useState<number | null>(
    initialParentId
  )

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      event_id: storeData.event_id || null,
      custom_event_name: storeData.custom_event_name || "",
    },
  })

  // const selectedEventId = watch("event_id")
  const selectedEventId = useWatch({ control, name: "event_id" })

  // Handle clicking a top-level predefined event
  const handleSelectPredefined = (event: EventNode) => {
    setIsCustomMode(false)
    setValue("custom_event_name", "", { shouldValidate: true })

    const hasChildren = event.children && event.children.length > 0

    if (hasChildren) {
      // Toggle expansion for nested events
      setExpandedParentId((prev) => (prev === event.id ? null : event.id))
      // Clear the event_id if they haven't picked a child from this newly expanded group
      if (!event.children!.some((c) => c.id === selectedEventId)) {
        setValue("event_id", null)
      }
    } else {
      // It's a standalone event without children
      setExpandedParentId(null)
      setValue("event_id", event.id, { shouldValidate: true })
    }
  }

  // Handle clicking a nested child event
  const handleSelectChild = (childId: number) => {
    setIsCustomMode(false)
    setValue("custom_event_name", "", { shouldValidate: true })
    setValue("event_id", childId, { shouldValidate: true })
  }

  // Handle clicking the "Custom Event" option
  const handleEnableCustom = () => {
    setIsCustomMode(true)
    setExpandedParentId(null)
    setValue("event_id", null, { shouldValidate: true })
  }

  const onSubmit = (formData: Step2Data) => {
    const eventChanged = storeData.event_id !== formData.event_id

    updateData({
      ...formData,
      ...(eventChanged && {
        landing_page_template_id: undefined,
        email_template_id: undefined,
        reminder_initial_template_id: undefined,
        reminder_expiry_template_id: undefined,
      }),
    })
    nextStep()
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const expandedParent = events?.find((e) => e.id === expandedParentId)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Campaign Event
          </h2>
          <p className="text-muted-foreground">
            What is the occasion for this campaign?
          </p>
        </div>

        {/* TOP LEVEL GRID */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => {
            const hasChildren = event.children && event.children.length > 0
            const isStandaloneSelected =
              selectedEventId === event.id && !isCustomMode && !hasChildren
            const isParentExpanded =
              expandedParentId === event.id && !isCustomMode
            const isSelected = isStandaloneSelected || isParentExpanded

            return (
              <div
                key={event.id}
                onClick={() => handleSelectPredefined(event)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-200 bg-white hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${isSelected ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4
                      className={`font-semibold ${isSelected ? "text-primary" : "text-gray-900"}`}
                    >
                      {event.title}
                    </h4>
                    {hasChildren && (
                      <p className="text-xs text-gray-500">
                        {event.children!.length} specific events
                      </p>
                    )}
                  </div>
                </div>
                {/* Visual indicator for dropdown groups */}
                {hasChildren && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isParentExpanded ? "rotate-180 text-primary" : "text-gray-400"}`}
                  />
                )}
              </div>
            )
          })}

          {/* CUSTOM EVENT TRIGGER CARD */}
          <div
            onClick={handleEnableCustom}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
              isCustomMode
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-dashed border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-gray-100"
            }`}
          >
            <div
              className={`rounded-full p-2 ${isCustomMode ? "bg-primary/20 text-primary" : "bg-gray-200 text-gray-500"}`}
            >
              <Edit3 className="h-5 w-5" />
            </div>
            <h4
              className={`font-semibold ${isCustomMode ? "text-primary" : "text-gray-700"}`}
            >
              Other / Custom Event
            </h4>
          </div>
        </div>

        {/* NESTED CHILDREN SELECTION WELL */}
        {expandedParent &&
          expandedParent.children &&
          expandedParent.children.length > 0 &&
          !isCustomMode && (
            <div className="mt-4 animate-in rounded-xl border border-primary/20 bg-primary/5 p-5 fade-in slide-in-from-top-2">
              <h4 className="mb-4 text-sm font-semibold text-primary">
                Select a specific {expandedParent.title} event:
              </h4>
              <div className="flex flex-wrap gap-3">
                {expandedParent.children.map((child) => {
                  const isChildSelected = selectedEventId === child.id
                  return (
                    <div
                      key={child.id}
                      onClick={() => handleSelectChild(child.id)}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-all ${
                        isChildSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-gray-300 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/10"
                      }`}
                    >
                      {child.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        {/* CUSTOM EVENT TEXT INPUT */}
        {isCustomMode && (
          <div className="mt-6 max-w-md animate-in space-y-2 zoom-in-95 fade-in">
            <Label
              htmlFor="custom_event_name"
              className={errors.custom_event_name ? "text-destructive" : ""}
            >
              Custom Event Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="custom_event_name"
              placeholder="e.g., Q3 Sales Spiff"
              {...register("custom_event_name")}
              autoFocus
            />
          </div>
        )}

        {(errors.event_id || errors.custom_event_name) && (
          <p className="text-sm font-medium text-destructive">
            {errors.event_id?.message || errors.custom_event_name?.message}
          </p>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
