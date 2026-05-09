import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, ChevronLeft, Loader2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step1Schema, type Step1Data } from "../schemas"
import { useCampaignVerticals } from "@/hooks/useCampaignOptions"

export function Step1Vertical() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()
  const { data: verticals, isLoading } = useCampaignVerticals()

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      vertical_id: storeData.vertical_id,
    },
  })

  const selectedVerticalId = useWatch({
    control,
    name: "vertical_id",
  })

  const onSubmit = (formData: Step1Data) => {
    const isVerticalChanged = storeData.vertical_id !== formData.vertical_id
    updateData({
      vertical_id: formData.vertical_id,
      ...(isVerticalChanged && {
        event_id: null,
        custom_event_name: undefined,
        recipient_ids: [],
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Select Audience
          </h2>
          <p className="text-muted-foreground">Who is this campaign for?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verticals?.map((vertical) => {
            const isSelected = selectedVerticalId === vertical.id
            return (
              <div
                key={vertical.id}
                onClick={() =>
                  setValue("vertical_id", vertical.id, { shouldValidate: true })
                }
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-6 text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                    : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                <Users
                  className={`mb-3 h-8 w-8 ${isSelected ? "text-primary" : "text-gray-400"}`}
                />
                <h3
                  className={`font-semibold ${isSelected ? "text-primary" : "text-gray-900"}`}
                >
                  {vertical.name}
                </h3>
              </div>
            )
          })}
        </div>

        {errors.vertical_id && (
          <p className="text-sm font-medium text-destructive">
            {errors.vertical_id.message}
          </p>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={!selectedVerticalId}>
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
