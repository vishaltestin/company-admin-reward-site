import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  MessageSquareText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step4BulkSchema, type Step4BulkData } from "../schemas"

export function Step4BulkLogistics() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4BulkData>({
    resolver: zodResolver(step4BulkSchema),
    defaultValues: {
      event_address: storeData.event_address || "",
      event_date: storeData.event_date
        ? new Date(storeData.event_date).toISOString().slice(0, 16)
        : "",
      inquiry_notes: storeData.inquiry_notes || "",
    },
  })

  const onSubmit = (formData: Step4BulkData) => {
    updateData({
      event_address: formData.event_address,
      event_date: formData.event_date,
      inquiry_notes: formData.inquiry_notes,
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
            Delivery & Customization
          </h2>
          <p className="text-muted-foreground">
            Provide logistics and any custom branding requirements for this
            wholesale inquiry.
          </p>
        </div>

        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            <Label
              htmlFor="event_address"
              className={errors.event_address ? "text-destructive" : ""}
            >
              Target Delivery Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <Textarea
                id="event_address"
                className="min-h-20 resize-none pl-10"
                placeholder="Building Name, Street, City, State, ZIP..."
                {...register("event_address")}
              />
            </div>
            {errors.event_address && (
              <p className="text-sm font-medium text-destructive">
                {errors.event_address.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="event_date"
              className={errors.event_date ? "text-destructive" : ""}
            >
              Required By Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="event_date"
              type="datetime-local"
              {...register("event_date")}
            />
            {errors.event_date && (
              <p className="text-sm font-medium text-destructive">
                {errors.event_date.message}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t pt-6 sm:col-span-2">
            <Label
              htmlFor="inquiry_notes"
              className="flex items-center gap-2 font-semibold text-primary"
            >
              <MessageSquareText className="h-5 w-5" /> Customization & Branding
              Requests
            </Label>
            <Textarea
              id="inquiry_notes"
              className="min-h-30"
              placeholder="e.g., We need our company logo printed on the left chest of the t-shirts, and laser engraved on the metal bottles. Please quote us for 3-color printing."
              {...register("inquiry_notes")}
            />
            <p className="text-xs text-gray-500">
              Our team will review these notes and contact you with a finalized
              quote and mockups.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Continue to Catalog <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
