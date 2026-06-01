import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, ChevronLeft, Send, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step3Schema, type Step3Data } from "../schemas"

export function Step3Distribution() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      distribution_type: storeData.distribution_type,
    },
  })

  // const selectedType = watch("distribution_type")
  const selectedType = useWatch({ control, name: "distribution_type" })
  const onSubmit = (formData: Step3Data) => {
    updateData({
      distribution_type: formData.distribution_type,
      ...(storeData.distribution_type !== formData.distribution_type && {
        recipient_ids: [],
        reward_type: undefined,
        bulk_total_cost: undefined,
        bulk_items: [],
      }),
    })
    nextStep()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Distribution Method
          </h2>
          <p className="text-muted-foreground">
            How will these rewards be delivered?
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div
            onClick={() =>
              setValue("distribution_type", "online", { shouldValidate: true })
            }
            className={`relative flex cursor-pointer flex-col items-start rounded-xl border p-6 transition-all ${
              selectedType === "online"
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
            }`}
          >
            <div
              className={`mb-4 rounded-full p-3 ${selectedType === "online" ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              <Send className="h-6 w-6" />
            </div>
            <h3
              className={`mb-2 text-lg font-bold ${selectedType === "online" ? "text-primary" : "text-gray-900"}`}
            >
              Online Gift Distribution
            </h3>
            <p className="text-sm text-gray-500">
              Send digital rewards via email and SMS. Recipients can claim their
              gifts through a custom landing page.
            </p>
          </div>

          <div
            onClick={() =>
              setValue("distribution_type", "bulk", { shouldValidate: true })
            }
            className={`relative flex cursor-pointer flex-col items-start rounded-xl border p-6 transition-all ${
              selectedType === "bulk"
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
            }`}
          >
            <div
              className={`mb-4 rounded-full p-3 ${selectedType === "bulk" ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              <Package className="h-6 w-6" />
            </div>
            <h3
              className={`mb-2 text-lg font-bold ${selectedType === "bulk" ? "text-primary" : "text-gray-900"}`}
            >
              Bulk Physical Order
            </h3>
            <p className="text-sm text-gray-500">
              Order items in bulk to be delivered to a single physical location
              for an in-person event or office distribution.
            </p>
          </div>
        </div>

        {errors.distribution_type && (
          <p className="text-sm font-medium text-destructive">
            {errors.distribution_type.message}
          </p>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={!selectedType}>
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
