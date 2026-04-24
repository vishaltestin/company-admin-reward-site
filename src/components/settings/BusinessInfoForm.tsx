import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useCompanyMutations } from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const businessSchema = z.object({
  gst_no: z.string().optional(),
  pan_no: z.string().optional(),
  industry: z.string().optional(),
  number_of_employee: z.string().optional(),
  address: z.string().optional(),
})

export function BusinessInfoForm() {
  const company = useAuthStore((state) => state.user?.company)
  const { updateBusinessDetails } = useCompanyMutations()

  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      gst_no: company?.gst_no || "",
      pan_no: company?.pan_no || "",
      industry: company?.industry || "",
      number_of_employee: company?.number_of_employee || "",
      address: company?.address || "",
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => updateBusinessDetails.mutate(data))}
      className="max-w-2xl space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>GST Number</Label>
          <Input {...form.register("gst_no")} />
        </div>
        <div className="space-y-2">
          <Label>PAN Number</Label>
          <Input {...form.register("pan_no")} />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            placeholder="e.g., Information Technology"
            {...form.register("industry")}
          />
        </div>
        <div className="space-y-2">
          <Label>Number of Employees</Label>
          <Input
            placeholder="e.g., 50-100"
            {...form.register("number_of_employee")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Registered Company Address</Label>
        <Textarea rows={3} {...form.register("address")} />
      </div>

      <Button type="submit" disabled={updateBusinessDetails.isPending}>
        {updateBusinessDetails.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Save Business Details
      </Button>
    </form>
  )
}
