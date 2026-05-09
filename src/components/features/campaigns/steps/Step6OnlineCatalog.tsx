import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  Store,
  Settings2,
  Loader2,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCampaignStore } from "@/store/useCampaignStore"
import { step6OnlineSchema, type Step6OnlineData } from "../schemas"
import { useCatalogConfigQuery } from "@/hooks/useCatalogConfig"

export function Step6OnlineCatalog() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()
  const { data: catalogConfig, isLoading } = useCatalogConfigQuery()

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step6OnlineData>({
    resolver: zodResolver(step6OnlineSchema),
    defaultValues: {
      use_custom_catalog:
        storeData.catalog_selection && storeData.catalog_selection.length > 0
          ? true
          : false,
      catalog_selection: storeData.catalog_selection || [],
    },
  })

  // const useCustomCatalog = watch("use_custom_catalog")
  // const selectedProductIds = watch("catalog_selection")
  const [useCustomCatalog, selectedProductIds] = useWatch({
    control,
    name: ["use_custom_catalog", "catalog_selection"],
  })

  const toggleProduct = (productId: number) => {
    const current = new Set(selectedProductIds)
    if (current.has(productId)) {
      current.delete(productId)
    } else {
      current.add(productId)
    }
    setValue("catalog_selection", Array.from(current), { shouldValidate: true })
  }

  const onSubmit = (formData: Step6OnlineData) => {
    updateData({
      catalog_selection: formData.use_custom_catalog
        ? formData.catalog_selection
        : undefined,
    })
    nextStep()
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const allAvailableProducts =
    catalogConfig?.categories
      .flatMap((c) => [
        ...(c.primary_products || []),
        ...(c.secondary_products || []),
      ])
      .filter((p) => !catalogConfig.hidden_product_ids?.includes(p.id)) || []

  const uniqueProducts = Array.from(
    new Map(allAvailableProducts.map((p) => [p.id, p])).values()
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Reward Catalog
          </h2>
          <p className="text-muted-foreground">
            What items are recipients allowed to claim with their reward?
          </p>
        </div>

        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div
            onClick={() => {
              setValue("use_custom_catalog", false, { shouldValidate: true })
              setValue("catalog_selection", [])
            }}
            className={`relative flex cursor-pointer flex-col items-start rounded-xl border p-6 transition-all ${
              !useCustomCatalog
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
            }`}
          >
            <div
              className={`mb-4 rounded-full p-3 ${!useCustomCatalog ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              <Store className="h-6 w-6" />
            </div>
            <h3
              className={`mb-2 text-lg font-bold ${!useCustomCatalog ? "text-primary" : "text-gray-900"}`}
            >
              Full Storefront Catalog
            </h3>
            <p className="text-sm text-gray-500">
              Recipients can choose from any active product currently approved
              in your main storefront settings.
            </p>
          </div>

          <div
            onClick={() =>
              setValue("use_custom_catalog", true, { shouldValidate: true })
            }
            className={`relative flex cursor-pointer flex-col items-start rounded-xl border p-6 transition-all ${
              useCustomCatalog
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
            }`}
          >
            <div
              className={`mb-4 rounded-full p-3 ${useCustomCatalog ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              <Settings2 className="h-6 w-6" />
            </div>
            <h3
              className={`mb-2 text-lg font-bold ${useCustomCatalog ? "text-primary" : "text-gray-900"}`}
            >
              Custom Campaign Selection
            </h3>
            <p className="text-sm text-gray-500">
              Restrict choices. Hand-pick exactly which specific products or
              categories are available for this campaign.
            </p>
          </div>
        </div>

        {useCustomCatalog && (
          <div className="animate-in space-y-4 fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="text-base font-semibold">
                Select Allowed Products
              </Label>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {selectedProductIds.length} Selected
              </span>
            </div>

            <div className="grid max-h-100 grid-cols-2 gap-4 overflow-y-auto p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {uniqueProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <div className="mb-2 aspect-square w-full rounded-lg border bg-white p-2">
                      {product.main_image ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/storage/${product.main_image}`}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <span
                        className="line-clamp-2 text-xs font-medium"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                      <span className="mt-1 text-sm font-bold text-gray-900">
                        ₹{product.selling_price}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {errors.catalog_selection && (
              <p className="text-sm font-medium text-destructive">
                {errors.catalog_selection.message}
              </p>
            )}
          </div>
        )}
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
