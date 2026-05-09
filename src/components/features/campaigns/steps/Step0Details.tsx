import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { useCampaignStore } from "@/store/useCampaignStore"
import { step0Schema, type Step0Data } from "../schemas"
// import { useEffect } from "react"
// import { useLocation } from "react-router-dom"

export function Step0Details() {
  const { data, updateData, nextStep } = useCampaignStore()
  // const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step0Data>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      name: data.name || "",
      description: data.description || "",
    },
  })

  const onSubmit = (formData: Step0Data) => {
    updateData(formData)
    nextStep()
  }
  // useEffect(() => {
  //   if (location.state?.prefill) {
  //     const { campaignName, description, vertical } = location.state.prefill

  //     // Auto-update Zustand store with the calendar data!
  //     updateData({
  //       name: campaignName,
  //       description: description,
  //       vertical_id: vertical,
  //     })
  //   }
  // }, [location.state])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-bottom-4"
    >
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Campaign Details
          </h2>
          <p className="text-muted-foreground">
            Give your campaign a clear name and purpose.
          </p>
        </div>

        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className={errors.name ? "text-destructive" : ""}
            >
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Diwali 2026 Bonus, Q3 Channel Incentives..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe the goal of this campaign..."
              className="min-h-30 resize-none"
              {...register("description")}
            />
          </div>
        </div>
      </div>

      {/* Local Navigation Controls */}
      <div className="flex justify-end border-t pt-4">
        <Button type="submit">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
