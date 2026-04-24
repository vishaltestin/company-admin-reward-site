import { useState } from "react"
import { Eye, EyeOff, Loader2, Save, AlertCircle } from "lucide-react"

import {
  useCatalogConfigQuery,
  useCatalogVisibilityMutation,
  type CatalogConfigResponse,
} from "@/hooks/useCatalogConfig"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ----------------------------------------------------------------------
// 1. THE INNER FORM (Only mounts when data is ready)
// ----------------------------------------------------------------------
function CatalogCurationInner({ data }: { data: CatalogConfigResponse }) {
  const { mutate: saveVisibility, isPending } = useCatalogVisibilityMutation()

  // Initialize state directly from props! No useEffect needed!
  const [hiddenCategories, setHiddenCategories] = useState<number[]>(
    data.hidden_category_ids || []
  )
  const [hiddenProducts, setHiddenProducts] = useState<number[]>(
    data.hidden_product_ids || []
  )

  // Default to the first category if available
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    data.categories.length > 0 ? data.categories[0].id : null
  )

  const toggleCategory = (categoryId: number) => {
    setHiddenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleProduct = (productId: number) => {
    setHiddenProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSave = () => {
    saveVisibility({
      hidden_category_ids: hiddenCategories,
      hidden_product_ids: hiddenProducts,
    })
  }

  const activeCategory = data.categories.find((c) => c.id === activeCategoryId)
  const isCategoryHidden = activeCategoryId
    ? hiddenCategories.includes(activeCategoryId)
    : false

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
        <div>
          <CardTitle>Catalog Curation</CardTitle>
          <CardDescription>
            Hide specific categories or individual products from your employees.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Visibility Settings
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid h-[600px] grid-cols-1 md:grid-cols-12">
          {/* LEFT PANE: Categories */}
          <div className="space-y-2 overflow-y-auto border-r bg-gray-50/30 p-4 md:col-span-4 lg:col-span-3">
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Categories
            </h4>
            {data.categories.map((category) => {
              const isHidden = hiddenCategories.includes(category.id)
              const isActive = activeCategoryId === category.id

              return (
                <div
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                    isActive
                      ? "border border-primary/20 bg-primary/10"
                      : "border border-transparent hover:bg-gray-100"
                  } ${isHidden ? "opacity-60" : ""}`}
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${isHidden ? "text-gray-400" : "text-green-600"}`}
                    onClick={(e) => {
                      e.stopPropagation() // Prevent triggering the row click
                      toggleCategory(category.id)
                    }}
                  >
                    {isHidden ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* RIGHT PANE: Products */}
          <div className="overflow-y-auto bg-white p-6 md:col-span-8 lg:col-span-9">
            {activeCategory && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {activeCategory.name} Products
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isCategoryHidden
                        ? "This entire category is currently hidden. Toggling individual products will have no effect until the category is visible."
                        : `Manage visibility for items in ${activeCategory.name}.`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCategory.primary_products.map((product) => {
                    const isProductHidden = hiddenProducts.includes(product.id)
                    const effectivelyHidden =
                      isCategoryHidden || isProductHidden

                    return (
                      <div
                        key={product.id}
                        className={`flex flex-col rounded-lg border p-3 transition-opacity ${
                          effectivelyHidden
                            ? "bg-gray-50 opacity-50"
                            : "bg-white"
                        }`}
                      >
                        <div className="mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                          {product.main_image ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/${product.main_image}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No Image
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-2">
                          <span
                            className="line-clamp-2 text-sm font-medium"
                            title={product.name}
                          >
                            {product.name}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            disabled={isCategoryHidden}
                            onClick={() => toggleProduct(product.id)}
                          >
                            {isProductHidden ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4 text-gray-500" />{" "}
                                Hidden
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4 text-green-600" />{" "}
                                Visible
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  {activeCategory.primary_products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                      No products available in this category.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ----------------------------------------------------------------------
// 2. THE WRAPPER (Handles loading, fetching, and empty states)
// ----------------------------------------------------------------------
export function CatalogCurationForm() {
  const { data, isLoading } = useCatalogConfigQuery()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || data.categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">
            No Categories Assigned
          </h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Your storefront hasn't been assigned any product categories by the
            system administrator yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Once data is successfully loaded, pass it to the inner component
  return <CatalogCurationInner data={data} />
}
