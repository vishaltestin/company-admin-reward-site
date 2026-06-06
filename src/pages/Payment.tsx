import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/useAuthStore"
import {
  useWalletBalanceQuery,
  useRazorpayTopUpMutation,
} from "@/hooks/usePayment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Wallet, PlusCircle, ArrowRight, Loader2 } from "lucide-react"

const topUpSchema = z.object({
  fiat_amount: z
    .number()
    .min(100, "Minimum top-up amount is ₹100")
    .max(500000, "Maximum top-up amount is ₹5,00,000"),
})

type TopUpFormValues = z.infer<typeof topUpSchema>

export default function PaymentPage() {
  const user = useAuthStore((state) => state.user)
  const { data: balanceData, isLoading } = useWalletBalanceQuery()
  const topUpMutation = useRazorpayTopUpMutation()

  const [isOpen, setIsOpen] = useState(false)

  const isSubAdmin = user?.user_type === "sub_admin"
  const multiplier = balanceData?.point_multiplier || 1
  const pointsName = balanceData?.points_name || "Points"

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { fiat_amount: 0 },
  })

  const watchAmount = useWatch({
    control,
    name: "fiat_amount",
    defaultValue: 0,
  })

  const estimatedPoints = (watchAmount || 0) * multiplier

  const onSubmit = (values: TopUpFormValues) => {
    topUpMutation.mutate(values.fiat_amount, {
      onSuccess: () => {
        setIsOpen(false)
        reset()
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet & Billing</h1>
        <p className="text-muted-foreground">
          Manage your company's {pointsName} balance.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" /> Available {pointsName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-5xl font-extrabold tracking-tighter text-foreground">
              {Number(balanceData?.balance || 0).toLocaleString()}
            </span>
          </div>

          {!isSubAdmin && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <PlusCircle className="h-5 w-5" /> Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Top Up {pointsName}</DialogTitle>
                  <DialogDescription>
                    Enter the amount in INR (₹) you wish to add to your wallet.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 pt-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="fiat_amount"
                      className={errors.fiat_amount ? "text-destructive" : ""}
                    >
                      Amount in INR (₹)
                    </Label>
                    <Input
                      id="fiat_amount"
                      type="number"
                      placeholder="e.g. 5000"
                      {...register("fiat_amount", { valueAsNumber: true })}
                    />
                    {errors.fiat_amount && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.fiat_amount.message}
                      </p>
                    )}
                  </div>

                  {watchAmount >= 100 && !errors.fiat_amount && (
                    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted p-4">
                      <span className="text-sm font-medium">
                        You will receive:
                      </span>
                      <span className="flex items-center gap-1 text-lg font-bold text-primary">
                        {estimatedPoints.toLocaleString()} {pointsName}
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={topUpMutation.isPending}
                  >
                    {topUpMutation.isPending ? (
                      <>
                        Processing{" "}
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Proceed to Payment{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
