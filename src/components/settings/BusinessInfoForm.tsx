import { useState } from "react"
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
  name: z.string().min(2, "Company name is required").max(255),
  gst_no: z.string().max(50).optional(),
  pan_no: z.string().max(50).optional(),
  industry: z.string().max(255).optional(),
  number_of_employee: z.string().max(255).optional(),
  address: z.string().optional(),
})

type BusinessValues = z.infer<typeof businessSchema>

export function BusinessInfoForm() {
  const company = useAuthStore((state) => state.user?.company)
  const { updateBusinessDetails } = useCompanyMutations()
  const [gstDocument, setGstDocument] = useState<File | null>(null)
  const [panDocument, setPanDocument] = useState<File | null>(null)

  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: company?.name || "",
      gst_no: company?.gst_no || "",
      pan_no: company?.pan_no || "",
      industry: company?.industry || "",
      number_of_employee: company?.number_of_employee || "",
      address: company?.address || "",
    },
  })

  const onSubmit = (values: BusinessValues) => {
    const formData = new FormData()
    formData.append("_method", "PUT")

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value ?? "")
    })

    if (gstDocument) {
      formData.append("gst_document", gstDocument)
    }

    if (panDocument) {
      formData.append("pan_document", panDocument)
    }

    updateBusinessDetails.mutate(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="business-company-name">Company Name</Label>
          <Input
            id="business-company-name"
            placeholder="Enter the registered company name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-industry">Industry</Label>
          <Input
            id="business-industry"
            placeholder="e.g. Information Technology"
            {...form.register("industry")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-employee-count">Number of Employees</Label>
          <Input
            id="business-employee-count"
            placeholder="e.g. 50-100"
            {...form.register("number_of_employee")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-gst-number">GST Number (Optional)</Label>
          <Input id="business-gst-number" {...form.register("gst_no")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-pan-number">PAN Number (Optional)</Label>
          <Input id="business-pan-number" {...form.register("pan_no")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business-gst-document">GST Document (Optional)</Label>
          <Input
            id="business-gst-document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) =>
              setGstDocument(event.currentTarget.files?.[0] ?? null)
            }
          />
          <p className="text-xs text-muted-foreground">
            PDF, JPG, JPEG, or PNG; maximum 5 MB.
          </p>
          {gstDocument && (
            <p className="text-sm text-muted-foreground">
              Selected: {gstDocument.name}
            </p>
          )}
          {company?.gst_document_url && (
            <a
              href={company.gst_document_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View uploaded GST document
            </a>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-pan-document">PAN Document (Optional)</Label>
          <Input
            id="business-pan-document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) =>
              setPanDocument(event.currentTarget.files?.[0] ?? null)
            }
          />
          <p className="text-xs text-muted-foreground">
            PDF, JPG, JPEG, or PNG; maximum 5 MB.
          </p>
          {panDocument && (
            <p className="text-sm text-muted-foreground">
              Selected: {panDocument.name}
            </p>
          )}
          {company?.pan_document_url && (
            <a
              href={company.pan_document_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View uploaded PAN document
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-address">Registered Company Address</Label>
        <Textarea
          id="business-address"
          rows={3}
          {...form.register("address")}
        />
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
