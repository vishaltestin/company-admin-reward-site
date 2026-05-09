import { useState, useMemo } from "react"
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react"

import {
  useCatalogConfigQuery,
  useCatalogVisibilityMutation,
  type CatalogConfigResponse,
  type CatalogCategory,
  type CatalogProduct,
} from "@/hooks/useCatalogConfig"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


function CatalogCurationInner({ data }: { data: CatalogConfigResponse }) {
  const { mutate: saveVisibility, isPending } = useCatalogVisibilityMutation()

  const [hiddenCategories, setHiddenCategories] = useState<number[]>(
    data.hidden_category_ids || []
  )
  const [hiddenProducts, setHiddenProducts] = useState<number[]>(
    data.hidden_product_ids || []
  )
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    data.categories.length > 0 ? data.categories[0].id : null
  )

  const isEffectivelyHidden = (categoryId: number): boolean => {
    if (hiddenCategories.includes(categoryId)) return true
    const category = data.categories.find((c) => c.id === categoryId)
    if (category && category.parent_id) {
      return isEffectivelyHidden(category.parent_id)
    }
    return false
  }

  const getDescendantCategoryIds = (categoryId: number): number[] => {
    let ids = [categoryId]
    const children = data.categories.filter((c) => c.parent_id === categoryId)
    children.forEach((child) => {
      ids = [...ids, ...getDescendantCategoryIds(child.id)]
    })
    return ids
  }

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

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleBulkHide = (productIds: number[]) => {
    setHiddenProducts((prev) => Array.from(new Set([...prev, ...productIds])))
  }

  const handleBulkShow = (productIds: number[]) => {
    setHiddenProducts((prev) => prev.filter((id) => !productIds.includes(id)))
  }

  const handleSave = () => {
    saveVisibility({
      hidden_category_ids: hiddenCategories,
      hidden_product_ids: hiddenProducts,
    })
  }

  const rootCategories = data.categories.filter(
    (c) =>
      !c.parent_id ||
      !data.categories.some((parent) => parent.id === c.parent_id)
  )

  const CategoryNode = ({
    category,
    depth = 0,
  }: {
    category: CatalogCategory
    depth?: number
  }) => {
    const children = data.categories.filter((c) => c.parent_id === category.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.includes(category.id)

    const isDirectlyHidden = hiddenCategories.includes(category.id)
    const isEffectivelyHiddenState = isEffectivelyHidden(category.id)
    const isActive = activeCategoryId === category.id

    return (
      <div className="space-y-1">
        <div
          onClick={() => setActiveCategoryId(category.id)}
          className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors ${
            isActive
              ? "border border-primary/20 bg-primary/10"
              : "border border-transparent hover:bg-gray-100"
          } ${isEffectivelyHiddenState ? "opacity-50 grayscale" : ""}`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(category.id)
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6" /> 
            )}
            <span
              className="truncate text-sm font-medium"
              title={category.name}
            >
              {category.name}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 shrink-0 ${isDirectlyHidden ? "text-gray-400" : "text-green-600"}`}
            onClick={(e) => {
              e.stopPropagation()
              toggleCategory(category.id)
            }}
            title={
              isEffectivelyHiddenState && !isDirectlyHidden
                ? "Hidden by parent category"
                : ""
            }
          >
            {isDirectlyHidden ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {children.map((child) => (
              <CategoryNode key={child.id} category={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const activeCategory = data.categories.find((c) => c.id === activeCategoryId)
  const isCategoryHiddenState = activeCategoryId
    ? isEffectivelyHidden(activeCategoryId)
    : false

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return []

    const relevantCategoryIds = getDescendantCategoryIds(activeCategoryId)
    const relevantCategories = data.categories.filter((c) =>
      relevantCategoryIds.includes(c.id)
    )

    let pool: CatalogProduct[] = []
    relevantCategories.forEach((cat) => {
      if (cat.primary_products) pool = [...pool, ...cat.primary_products]
      if (cat.secondary_products) pool = [...pool, ...cat.secondary_products]
    })

    const uniquePool = Array.from(new Map(pool.map((p) => [p.id, p])).values())

    return uniquePool.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const price = parseFloat(p.selling_price.toString())
      const matchesMin = minPrice === "" || price >= parseFloat(minPrice)
      const matchesMax = maxPrice === "" || price <= parseFloat(maxPrice)

      return matchesSearch && matchesMin && matchesMax
    })
  }, [activeCategoryId, data.categories, searchQuery, minPrice, maxPrice])

  const filteredProductIds = filteredProducts.map((p) => p.id)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
        <div>
          <CardTitle>Catalog Curation</CardTitle>
          <CardDescription>
            Filter by price and hide products from your storefront.
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
        <div className="grid h-187.5 grid-cols-1 md:grid-cols-12">
          <div className="space-y-2 overflow-y-auto border-r bg-gray-50/30 p-4 md:col-span-4 lg:col-span-3">
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Categories
            </h4>
            {rootCategories.map((category) => (
              <CategoryNode key={category.id} category={category} />
            ))}
          </div>

          <div className="flex flex-col overflow-hidden bg-white md:col-span-8 lg:col-span-9">
            {activeCategory && (
              <>
                <div className="space-y-4 border-b p-6 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {activeCategory.name} Products
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isCategoryHiddenState
                        ? "This category (or its parent) is hidden. Products toggled visible here won't appear on the storefront until the parent category is visible."
                        : `Showing products from ${activeCategory.name} and its subcategories.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-gray-50 p-3">
                    <div className="min-w-50 flex-1 space-y-1.5">
                      <Label className="text-xs">Search Products</Label>
                      <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="iPhone, Laptop..."
                          className="bg-white pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="w-28 space-y-1.5">
                      <Label className="text-xs">Min Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-white"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>

                    <div className="w-28 space-y-1.5">
                      <Label className="text-xs">Max Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="99999"
                        className="bg-white"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pb-0.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-100"
                        onClick={() => handleBulkShow(filteredProductIds)}
                        disabled={filteredProductIds.length === 0}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Show Filtered
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleBulkHide(filteredProductIds)}
                        disabled={filteredProductIds.length === 0}
                      >
                        <EyeOff className="mr-2 h-4 w-4" /> Hide Filtered
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => {
                      const isProductHidden = hiddenProducts.includes(
                        product.id
                      )
                      const effectivelyHidden =
                        isCategoryHiddenState || isProductHidden

                      return (
                        <div
                          key={product.id}
                          className={`flex flex-col rounded-xl border p-3 transition-all ${
                            effectivelyHidden
                              ? "bg-gray-100 opacity-50 grayscale"
                              : "bg-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-white">
                            {product.main_image ? (
                              <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/${product.main_image}`}
                                alt={product.name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">
                                No Image
                              </span>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between gap-1">
                            <p className="text-[10px] font-bold tracking-wider text-primary uppercase">
                              ID: {product.id}
                            </p>
                            <span
                              className="line-clamp-2 text-sm leading-tight font-medium"
                              title={product.name}
                            >
                              {product.name}
                            </span>

                            <div className="mt-2 flex items-end gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{product.selling_price}
                              </span>
                              {product.mrp > product.selling_price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{product.mrp}
                                </span>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className={`mt-3 w-full ${isProductHidden ? "border-red-200 bg-red-50 text-red-600" : ""}`}
                              onClick={() => toggleProduct(product.id)}
                            >
                              {isProductHidden ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" /> Hidden
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
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        No products found
                      </h3>
                      <p className="mt-1 max-w-sm text-gray-500">
                        {searchQuery || minPrice || maxPrice
                          ? "Try adjusting your filters or search query to see more products."
                          : "This category and its subcategories are currently empty."}
                      </p>
                      {(searchQuery || minPrice || maxPrice) && (
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchQuery("")
                            setMinPrice("")
                            setMaxPrice("")
                          }}
                          className="mt-2"
                        >
                          Clear all filters
                        </Button>
                      )}
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

export function CatalogCurationForm() {
  const { data, isLoading } = useCatalogConfigQuery()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || data.categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
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

  return <CatalogCurationInner data={data} />
}
