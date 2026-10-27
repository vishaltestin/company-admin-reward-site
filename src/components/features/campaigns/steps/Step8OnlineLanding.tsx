import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  LayoutTemplate,
  MonitorSmartphone,
  CheckCircle2,
  ExternalLink,
  Eye,
  Gift,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step8OnlineSchema, type Step8OnlineData } from "../schemas"
import { useCampaignLandingPages } from "@/hooks/useCampaignOptions"

export function Step8OnlineLanding() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()
  const [activeTab, setActiveTab] = useState<"global" | "variations">("global")

  // The API applies an exact reward_type filter. Link pages must also contain
  // a visible reward picker; points/code pages are congratulations experiences.
  const rewardType = storeData.reward_type

  // The API filter param only understands online reward types — narrow the
  // store's wider union (which includes "physical_bulk" for wholesale
  // campaigns) before passing it down.
  const claimFilter: "link" | "points" | "code" | null =
    rewardType === "link" || rewardType === "points" || rewardType === "code"
      ? rewardType
      : null

  const {
    data: templates,
    isLoading,
    refetch,
    isRefetching,
  } = useCampaignLandingPages(
    storeData.event_id ?? null,
    storeData.vertical_id ?? null,
    activeTab,
    claimFilter
  )

  const {
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<Step8OnlineData>({
    resolver: zodResolver(step8OnlineSchema),
    defaultValues: {
      landing_page_template_id: storeData.landing_page_template_id || undefined,
    },
  })

  const selectedTemplateId = useWatch({
    control,
    name: "landing_page_template_id",
  })

  const onSubmit = (formData: Step8OnlineData) => {
    if (rewardType === "link" && !formData.landing_page_template_id) {
      setError("landing_page_template_id", {
        type: "required",
        message: "Select a landing page with a reward picker to continue.",
      })
      return
    }

    updateData(formData)
    nextStep()
  }

  const renderTemplateGrid = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (!templates || templates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <LayoutTemplate className="mb-4 h-10 w-10 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">
            No templates found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {rewardType === "link"
              ? `No claim-capable landing-page templates are available${storeData.event_id ? " for this event" : " in this vertical"}. Create or activate a Link design with a Gift Selector to continue.`
              : activeTab === "global"
                ? `No standard templates are available${storeData.event_id ? " for this event" : " in this vertical"} yet.`
                : `You haven't created any saved landing-page templates${storeData.event_id ? " for this event" : " in this vertical"}. Try selecting a standard theme instead.`}
          </p>
          {rewardType === "link" && (
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => window.open("/landing-page-templates", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage landing pages
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id
          return (
            <div
              key={template.id}
              onClick={() =>
                setValue("landing_page_template_id", template.id, {
                  shouldValidate: true,
                })
              }
              className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-gray-200 bg-white hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b bg-gray-100">
                {template.thumbnail_path ? (
                  <img
                    src={template.thumbnail_path}
                    alt={template.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <MonitorSmartphone className="h-10 w-10 text-gray-300" />
                )}

                <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        // Admin pages are served at the app root — no
                        // /admin prefix.
                        `/landing-pages/preview/${template.id}`,
                        "_blank"
                      )
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600" /> Preview
                  </button>

                  {activeTab === "variations" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(
                          // Admin pages are served at the app root — no
                          // /admin prefix.
                          `/landing-pages/editor/${template.id}`,
                          "_blank"
                        )
                      }}
                      className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="relative z-10 bg-white p-4">
                <h4
                  className="line-clamp-1 font-semibold text-gray-900"
                  title={template.name}
                >
                  {template.name}
                </h4>
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {template.title || "No page title set"}
                </p>
              </div>
            </div>
          )
        })}
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
            Landing Page Experience
          </h2>
          <p className="text-muted-foreground">
            Select the editable webpage recipients will see when they open their
            reward link.
          </p>
        </div>

        {rewardType === "link" && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Gift className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Reward-link campaign:</span> only
              designs containing a reward picker are shown below. Selecting one
              is required so recipients always have a working product-claim
              experience.
            </p>
          </div>
        )}

        {(rewardType === "points" || rewardType === "code") && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Gift className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">
                {rewardType === "points" ? "Points" : "Code"} campaign:
              </span>{" "}
              choose a congratulations landing page. Recipients receive a real
              page URL in their email; no product picker is required.
            </p>
          </div>
        )}

        {!storeData.event_id ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="font-semibold text-yellow-800">
              Custom Event Detected
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Because this campaign uses a custom event ("
              {storeData.custom_event_name}"), there is no exact event match.
              The lists below show compatible templates from the selected
              vertical, filtered by reward type.
            </p>
          </div>
        ) : null}

        <Tabs
          defaultValue="global"
          className="w-full space-y-6"
          onValueChange={(val) => setActiveTab(val as "global" | "variations")}
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="global">Standard Themes</TabsTrigger>
              <TabsTrigger value="variations">My Saved Designs</TabsTrigger>
            </TabsList>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-gray-600"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          <TabsContent value="global" className="m-0 border-none outline-none">
            {renderTemplateGrid()}
          </TabsContent>

          <TabsContent
            value="variations"
            className="m-0 border-none outline-none"
          >
            {renderTemplateGrid()}
          </TabsContent>
        </Tabs>

        {errors.landing_page_template_id && (
          <p className="text-sm font-medium text-destructive">
            {errors.landing_page_template_id.message}
          </p>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {/* Points/code can use the built-in congratulations page. Link
              campaigns must explicitly choose a working reward-picker page. */}
          {rewardType !== "link" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                updateData({ landing_page_template_id: undefined })
                nextStep()
              }}
            >
              Skip for now
            </Button>
          )}
          <Button type="submit" disabled={!selectedTemplateId}>
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}
