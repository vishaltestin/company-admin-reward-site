import { useMemo, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { useCampaignStore } from "@/store/useCampaignStore"

import { Step0Details } from "./steps/Step0Details"
import { Step1Vertical } from "./steps/Step1Vertical"
import { Step2Event } from "./steps/Step2Event"
import { Step3Distribution } from "./steps/Step3Distribution"
import { Step4OnlineRecipients } from "./steps/Step4OnlineRecipients"
import { Step5OnlineReward } from "./steps/Step5OnlineReward"
import { Step6OnlineCatalog } from "./steps/Step6OnlineCatalog"
import { Step8OnlineLanding } from "./steps/Step8OnlineLanding"
import { Step9OnlineEmail } from "./steps/Step9OnlineEmail"
import { Step10OnlineSMS } from "./steps/Step10OnlineSMS"
import { Step11OnlineSchedule } from "./steps/Step11OnlineSchedule"
import { Step4BulkLogistics } from "./steps/Step4BulkLogistics"
import { Step5BulkCatalog } from "./steps/Step5BulkCatalog"
import { Step13Summary } from "./steps/Step13Summary"

interface StepConfig {
  id: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
}

export function CampaignWizard() {
  const { currentStepIndex, data, updateData, setStep } = useCampaignStore()

  const location = useLocation()
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = useState(!location.state?.prefill)

  // 2. HYDRATION LOGIC: Ingest data from EventModal before rendering forms
  useEffect(() => {
    if (location.state?.prefill) {
      updateData(location.state.prefill)
      setStep(5)

      // CRITICAL UX FIX: Clear the router state immediately so refreshes don't reset progress.
      navigate(location.pathname, { replace: true, state: {} })

      // FIX: Push the state update to the microtask queue using a Promise.
      Promise.resolve().then(() => setIsHydrated(true))
    }
  }, [location.state, location.pathname, navigate, updateData, setStep])

  const steps = useMemo<StepConfig[]>(() => {
    const baseSteps: StepConfig[] = [
      { id: "details", title: "Campaign Info", component: Step0Details },
      { id: "vertical", title: "Audience", component: Step1Vertical },
      { id: "event", title: "Event", component: Step2Event },
      {
        id: "distribution",
        title: "Distribution",
        component: Step3Distribution,
      },
    ]

    if (data.distribution_type === "online") {
      baseSteps.push({
        id: "recipients",
        title: "Recipients",
        component: Step4OnlineRecipients,
      })
      baseSteps.push({
        id: "reward",
        title: "Reward Setup",
        component: Step5OnlineReward,
      })
      if (data.reward_type && data.reward_type !== "points") {
        baseSteps.push({
          id: "catalog",
          title: "Catalog Selection",
          component: Step6OnlineCatalog,
        })
      }
      baseSteps.push({
        id: "landing_page",
        title: "Web Experience",
        component: Step8OnlineLanding,
      })
      baseSteps.push({
        id: "email",
        title: "Email",
        component: Step9OnlineEmail,
      })

      baseSteps.push({ id: "sms", title: "SMS", component: Step10OnlineSMS })

      if (data.reward_type !== "points") {
        baseSteps.push({
          id: "schedule",
          title: "Schedule",
          component: Step11OnlineSchedule,
        })
      }
    }

    if (data.distribution_type === "bulk") {
      baseSteps.push({
        id: "bulk_logistics",
        title: "Logistics",
        component: Step4BulkLogistics,
      })
      baseSteps.push({
        id: "bulk_catalog",
        title: "Catalog Selection",
        component: Step5BulkCatalog,
      })
    }

    baseSteps.push({ id: "summary", title: "Review", component: Step13Summary })

    return baseSteps
  }, [data.distribution_type, data.reward_type])

  const CurrentStepComponent = steps[currentStepIndex]?.component
  const goToStepById = (stepId: string) => {
    const targetIndex = steps.findIndex((s) => s.id === stepId)
    if (targetIndex !== -1) {
      setStep(targetIndex)
    }
  }

  if (!isHydrated || !CurrentStepComponent) return null

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-start gap-4 overflow-x-auto rounded-lg border bg-white px-6 py-4 shadow-sm">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex

          return (
            <div key={step.id} className="flex shrink-0 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs font-medium lg:block ${isActive ? "text-gray-900" : "text-gray-500"}`}
                >
                  {step.title}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div className="ml-4 h-px w-4 bg-gray-200 lg:w-8" />
              )}
            </div>
          )
        })}
      </div>

      <div className="min-h-125 rounded-lg border bg-white p-6 shadow-sm">
        <CurrentStepComponent onEditStep={goToStepById} />
      </div>
    </div>
  )
}
