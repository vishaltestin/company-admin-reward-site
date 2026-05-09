import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  Wallet,
  AlertCircle,
  Gift,
  Link as LinkIcon,
  Coins,
  Loader2,
  PlusCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useCampaignStore } from "@/store/useCampaignStore"
import { step5OnlineSchema, type Step5OnlineData } from "../schemas"
import { useWalletBalanceQuery, useMockTopUpMutation } from "@/hooks/usePayment"

export function Step5OnlineReward() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  // Payment Hooks
  const { data: balanceData, isLoading: isLoadingWallet } =
    useWalletBalanceQuery()
  const topUpMutation = useMockTopUpMutation()

  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState<string>("")

  const recipientCount = storeData.recipient_ids?.length || 0

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step5OnlineData>({
    resolver: zodResolver(step5OnlineSchema),
    defaultValues: {
      reward_type:
        (storeData.reward_type as "points" | "code" | "link") || undefined,
      reward_value_per_user: storeData.reward_value_per_user || undefined,
    },
  })

  // const selectedRewardType = watch("reward_type")
  // const rewardValue = watch("reward_value_per_user") || 0
  const selectedRewardType = useWatch({ control, name: "reward_type" })
  const rewardValue = useWatch({ control, name: "reward_value_per_user" }) || 0

  const totalCost = recipientCount * rewardValue
  const currentBalance = balanceData?.balance || 0
  const pointsName = balanceData?.points_name || "Points"
  const hasSufficientFunds = currentBalance >= totalCost
  const shortfall = totalCost - currentBalance

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(topUpAmount)
    if (amount >= 100) {
      topUpMutation.mutate(
        { fiat_amount: amount },
        {
          onSuccess: () => {
            setIsTopUpOpen(false)
            setTopUpAmount("")
          },
        }
      )
    }
  }

  const onSubmit = (formData: Step5OnlineData) => {
    if (!hasSufficientFunds) return

    updateData({
      reward_type: formData.reward_type,
      reward_value_per_user: formData.reward_value_per_user,
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
            Reward Setup
          </h2>
          <p className="text-muted-foreground">
            Configure the reward mechanism and budget.
          </p>
        </div>

        <div className="space-y-3">
          <Label className={errors.reward_type ? "text-destructive" : ""}>
            Reward Mechanism <span className="text-red-500">*</span>
          </Label>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                id: "points",
                title: `Value of ${pointsName}`,
                icon: Coins,
                desc: `Send digital ${pointsName} to their wallet`,
              },
              {
                id: "code",
                title: "Value of Code",
                icon: Gift,
                desc: "Send a fixed-value gift code",
              },
              {
                id: "link",
                title: "Reward Link",
                icon: LinkIcon,
                desc: "Send a claimable Magic Link",
              },
            ].map((type) => {
              const isSelected = selectedRewardType === type.id
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  onClick={() =>
                    setValue(
                      "reward_type",
                      type.id as Step5OnlineData["reward_type"],
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                  className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:border-primary/50"
                  }`}
                >
                  <Icon
                    className={`mb-2 h-6 w-6 ${isSelected ? "text-primary" : "text-gray-400"}`}
                  />
                  <h4
                    className={`font-bold ${isSelected ? "text-primary" : "text-gray-900"}`}
                  >
                    {type.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">{type.desc}</p>
                </div>
              )
            })}
          </div>
          {errors.reward_type && (
            <p className="text-sm font-medium text-destructive">
              {errors.reward_type.message}
            </p>
          )}
        </div>

        <div className="max-w-md space-y-3">
          <Label
            htmlFor="reward_value_per_user"
            className={errors.reward_value_per_user ? "text-destructive" : ""}
          >
            Value per Recipient (₹) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute top-2.5 left-3 text-gray-500">₹</span>
            <Input
              id="reward_value_per_user"
              type="number"
              placeholder="e.g. 500"
              className="pl-7"
              {...register("reward_value_per_user", { valueAsNumber: true })}
            />
          </div>
          {errors.reward_value_per_user && (
            <p className="text-sm font-medium text-destructive">
              {errors.reward_value_per_user.message}
            </p>
          )}
        </div>

        {rewardValue > 0 && (
          <div className="animate-in rounded-xl border border-gray-200 bg-gray-50/50 p-6 shadow-inner zoom-in-95 fade-in">
            <h4 className="mb-4 flex items-center font-semibold text-gray-900">
              <Wallet className="mr-2 h-5 w-5 text-gray-500" /> Estimated
              Campaign Cost
            </h4>

            <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 text-sm">
              <div>
                <p className="text-gray-500">Recipients</p>
                <p className="text-xl font-bold">{recipientCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Value per user</p>
                <p className="text-xl font-bold">
                  ₹{rewardValue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Total Required</p>
                <p className="text-2xl font-black text-gray-900">
                  ₹{totalCost.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm text-gray-500">Current Wallet Balance</p>
                {isLoadingWallet ? (
                  <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <p
                    className={`text-lg font-bold ${hasSufficientFunds ? "text-green-600" : "text-red-600"}`}
                  >
                    ₹{currentBalance.toLocaleString()}
                  </p>
                )}
              </div>

              {!isLoadingWallet && !hasSufficientFunds && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsTopUpOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Funds
                </Button>
              )}
            </div>

            {!isLoadingWallet && !hasSufficientFunds && (
              <Alert
                variant="destructive"
                className="mt-4 border-red-200 bg-red-50"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Insufficient Funds</AlertTitle>
                <AlertDescription>
                  Your current balance is ₹{shortfall.toLocaleString()} short of
                  the estimated cost. Please add funds to proceed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="submit"
          disabled={!hasSufficientFunds || rewardValue <= 0}
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>
              You need at least <strong>₹{shortfall.toLocaleString()}</strong>{" "}
              to launch this campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Amount in INR (₹)</Label>
              <Input
                type="number"
                placeholder={`Minimum ₹${Math.max(100, shortfall)}`}
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleTopUpSubmit}
              disabled={Number(topUpAmount) < 100 || topUpMutation.isPending}
            >
              {topUpMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}
