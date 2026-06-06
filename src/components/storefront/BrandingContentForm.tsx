import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Trash2, Upload, Building2 } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useCompanyMutations } from "@/hooks/useSettings"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  logo: z.any().optional(),
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
    if (data.social_links && data.social_links.length > 0) {
      data.social_links.forEach((link, index) => {
        formData.append(`social_links[${index}][platform]`, link.platform)
        formData.append(`social_links[${index}][url]`, link.url)
      })
    } else {
      formData.append("social_links", "[]")
    }
    updateStorefrontSettings.mutate(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-full">
      {/* 1. IDENTITY SECTION */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-black">
            Storefront Identity
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage how your company appears on the storefront.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Storefront URL Alias
                </Label>
                {/* Seamless Input Group */}
                <div className="flex w-full items-center overflow-hidden rounded-md border border-gray-300 bg-gray-50 transition-colors focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <span className="border-r border-gray-300 px-3 py-2 text-sm text-gray-500">
                    {`${import.meta.env.VITE_STOREFRONT_BASE_URL}`}
                  </span>
                  <input
                    className="w-full border-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none disabled:text-gray-500"
                    disabled
                    {...form.register("alias")}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Contact support to change your alias.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Points Currency Name
                </Label>
                <Input
                  placeholder="e.g., Reward Points, Coins, Stars"
                  className="border-gray-300 focus-visible:border-black focus-visible:ring-black"
                  {...form.register("points_name")}
                />
                {form.formState.errors.points_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.points_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Company Logo
              </Label>
              <div className="flex items-center gap-6 rounded-lg border border-dashed border-gray-300 p-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {/* Custom styled file upload button hiding the ugly native input */}
                  <Label
                    htmlFor="logo-upload"
                    className="inline-flex w-fit cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:bg-gray-50"
                  >
                    <Upload className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Upload Image</span>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only" // This hides the ugly native button
                      {...form.register("logo")}
                      onChange={(e) => {
                        form.register("logo").onChange(e)
                        handleImageChange(e)
                      }}
                    />
                  </Label>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 2MB (400x400px ideal).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-black">Legal Content</h2>
          <p className="mt-1 text-sm text-gray-500">
            Format your policies using Markdown.
          </p>
        </div>
        <div className="space-y-6 p-6 md:p-8">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Terms & Conditions
            </Label>
            <Textarea
              rows={5}
              className="border-gray-300 font-mono text-sm focus-visible:border-black focus-visible:ring-black"
              placeholder="# Terms & Conditions..."
              {...form.register("terms_text")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Privacy Policy
            </Label>
            <Textarea
              rows={5}
              className="border-gray-300 font-mono text-sm focus-visible:border-black focus-visible:ring-black"
              placeholder="# Privacy Policy..."
              {...form.register("privacy_text")}
            />
          </div>
        </div>
      </div>

      {/* 3. SOCIAL LINKS SECTION */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-black">
            Social Media Links
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Links displayed in the storefront footer.
          </p>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4">
              <div className="w-1/3 space-y-1">
                <Select
                  onValueChange={(val) =>
                    form.setValue(`social_links.${index}.platform`, val)
                  }
                  defaultValue={field.platform}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-black focus:ring-black">
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
              </div>

              <div className="flex-1 space-y-1">
                <Input
                  placeholder="https://..."
                  className="border-gray-300 focus-visible:border-black focus-visible:ring-black"
                  {...form.register(`social_links.${index}.url` as const)}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
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
            className="w-full border-dashed border-gray-300 py-6 text-gray-600 hover:bg-gray-50 hover:text-black"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Social Link
          </Button>
        </div>
      </div>

      <div className="flex justify-end pb-8">
        <Button
          type="submit"
          disabled={updateStorefrontSettings.isPending}
          size="lg"
          className="bg-black text-white hover:bg-gray-800"
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
