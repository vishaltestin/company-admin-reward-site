import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, ChevronLeft, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step10OnlineSchema, type Step10OnlineData } from "../schemas"

export function Step10OnlineSMS() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step10OnlineData>({
    resolver: zodResolver(step10OnlineSchema),
    defaultValues: {
      sms_content:
        storeData.sms_content ||
        "You've received a reward! Click the link below to claim it.",
      sms_cta: storeData.sms_cta || "Claim Reward",
    },
  })

  // const content = watch("sms_content")
  // const cta = watch("sms_cta")
  const [content, cta] = useWatch({
    control,
    name: ["sms_content", "sms_cta"],
  })

  const onSubmit = (formData: Step10OnlineData) => {
    updateData(formData)
    nextStep()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="grid flex-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              SMS Notification
            </h2>
            <p className="text-muted-foreground">
              Customize the text message recipients will receive.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="sms_content"
                  className={errors.sms_content ? "text-destructive" : ""}
                >
                  Message Content <span className="text-red-500">*</span>
                </Label>
                <span
                  className={`text-xs ${content.length > 160 ? "text-red-500" : "text-gray-400"}`}
                >
                  {content.length}/160
                </span>
              </div>
              <Textarea
                id="sms_content"
                className="h-32 resize-none"
                {...register("sms_content")}
              />
              {errors.sms_content && (
                <p className="text-sm font-medium text-destructive">
                  {errors.sms_content.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="sms_cta"
                className={errors.sms_cta ? "text-destructive" : ""}
              >
                Link Text (Call to Action){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input id="sms_cta" {...register("sms_cta")} />
              {errors.sms_cta && (
                <p className="text-sm font-medium text-destructive">
                  {errors.sms_cta.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl border bg-gray-50 p-6">
          <div className="relative h-150 w-75 rounded-[3rem] border-8 border-gray-800 bg-gray-900 p-4 shadow-xl">
            <div className="absolute top-0 left-1/2 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-800"></div>

            <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white">
              <div className="mt-6 flex items-center gap-3 border-b bg-gray-100 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {storeData.name?.substring(0, 15) || "Company"}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end bg-gray-50 p-4">
                <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-blue-500 p-3 text-white shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">
                    {content || "Type a message..."}
                  </p>
                  <div className="mt-2 text-xs font-medium text-blue-100 underline decoration-blue-300 underline-offset-2">
                    {cta || "Link"} →
                  </div>
                </div>
                <div className="mt-1 text-right text-[10px] text-gray-400">
                  Just now
                </div>
              </div>
            </div>
          </div>
        </div>
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
