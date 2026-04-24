import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Building2, Plus, Trash2, HelpCircle } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useCompanyMutations } from "@/hooks/useSettings"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const brandingSchema = z.object({
  alias: z.string().optional(),
  points_name: z.string().min(1, "Points name is required"),
  logo: z.any().optional(), // File upload
  terms_text: z.string().optional(),
  privacy_text: z.string().optional(),
  social_links: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        url: z.string().url("Must be a valid URL"),
      })
    )
    .optional(),
})

type BrandingValues = z.infer<typeof brandingSchema>

export function BrandingContentForm() {
  const company = useAuthStore((state) => state.user?.company)
  const { updateStorefrontSettings } = useCompanyMutations()
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    company?.logo_url || null
  )

  const form = useForm<BrandingValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      alias: company?.alias || "",
      points_name: company?.points_name || "Points",
      terms_text: company?.terms_text || "",
      privacy_text: company?.privacy_text || "",
      social_links: Array.isArray(company?.social_links)
        ? company.social_links
        : [],
    },
  })

  // Dynamic Array for Social Links
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_links",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const onSubmit = (data: BrandingValues) => {
    const formData = new FormData()

    formData.append("points_name", data.points_name)
    if (data.terms_text) formData.append("terms_text", data.terms_text)
    if (data.privacy_text) formData.append("privacy_text", data.privacy_text)

    if (data.logo && data.logo.length > 0) {
      formData.append("logo", data.logo[0])
    }

    // Format Social Links so Laravel understands it as an array in a multipart form
    if (data.social_links && data.social_links.length > 0) {
      data.social_links.forEach((link, index) => {
        formData.append(`social_links[${index}][platform]`, link.platform)
        formData.append(`social_links[${index}][url]`, link.url)
      })
    } else {
      // Send empty array to clear it if user deletes all links
      formData.append("social_links", "[]")
    }

    updateStorefrontSettings.mutate(formData)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-4xl space-y-6"
    >
      {/* 1. IDENTITY CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Storefront Identity</CardTitle>
          <CardDescription>
            Manage how your company appears on the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Storefront URL Alias</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    rewardsapp.in/ecom/
                  </span>
                  {/* Alias is disabled as requested */}
                  <Input
                    className="rounded-l-none"
                    disabled
                    {...form.register("alias")}
                  />
                </div>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <HelpCircle className="h-3 w-3" /> Contact support to change
                  your alias.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Points Currency Name</Label>
                <Input
                  placeholder="e.g., Reward Points, Coins, Stars"
                  {...form.register("points_name")}
                />
                {form.formState.errors.points_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.points_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-gray-50 p-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="w-full">
                  <Input
                    type="file"
                    accept="image/*"
                    {...form.register("logo")}
                    onChange={(e) => {
                      form.register("logo").onChange(e)
                      handleImageChange(e)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. CONTENT CARD (Markdown) */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Content</CardTitle>
          <CardDescription>
            Format your policies using Markdown (e.g., **bold**, *italic*, #
            Headings).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              rows={6}
              className="font-mono text-sm"
              placeholder="# Terms & Conditions\n\n1. First rule..."
              {...form.register("terms_text")}
            />
          </div>
          <div className="space-y-2">
            <Label>Privacy Policy</Label>
            <Textarea
              rows={6}
              className="font-mono text-sm"
              placeholder="# Privacy Policy\n\nHow we handle data..."
              {...form.register("privacy_text")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. SOCIAL LINKS CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Add links to your company's social profiles to display in the
            storefront footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="w-1/3 space-y-1">
                <Select
                  onValueChange={(val) =>
                    form.setValue(`social_links.${index}.platform`, val)
                  }
                  defaultValue={field.platform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.social_links?.[index]?.platform && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.social_links[index].platform.message}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <Input
                  placeholder="https://..."
                  {...form.register(`social_links.${index}.url` as const)}
                />
                {form.formState.errors.social_links?.[index]?.url && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.social_links[index].url.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-red-500 hover:bg-red-50"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ platform: "", url: "" })}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Social Link
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateStorefrontSettings.isPending}
          size="lg"
        >
          {updateStorefrontSettings.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Storefront Identity
        </Button>
      </div>
    </form>
  )
}
