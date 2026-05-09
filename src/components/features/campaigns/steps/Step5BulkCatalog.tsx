import { useState, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Package,
  Search,
  Filter,
  ShoppingCart,
  Info,
  Minus,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

import { useCampaignStore } from "@/store/useCampaignStore"
import { step5BulkSchema, type Step5BulkData } from "../schemas"
import {
  useCatalogConfigQuery,
  type CatalogCategory,
} from "@/hooks/useCatalogConfig"

export function Step5BulkCatalog() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()
  const { data: catalogConfig, isLoading } = useCatalogConfigQuery()

  const [search, setSearch] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeProduct, setActiveProduct] = useState<any | null>(null)
  const [modalQuantities, setModalQuantities] = useState<
    Record<number, number>
  >({})

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step5BulkData>({
    resolver: zodResolver(step5BulkSchema),
    defaultValues: { bulk_items: storeData.bulk_items || [] },
  })

  // const bulkItems = watch("bulk_items")
  const bulkItems = useWatch({ control, name: "bulk_items" })

  const getDescendantCategoryIds = (categoryId: number): number[] => {
    if (!catalogConfig) return [categoryId]
    let ids = [categoryId]
    const children = catalogConfig.categories.filter(
      (c) => c.parent_id === categoryId
    )
    children.forEach((child) => {
      ids = [...ids, ...getDescendantCategoryIds(child.id)]
    })
    return ids
  }

  const filteredProducts = useMemo(() => {
    if (!catalogConfig) return []

    let validCategoryIds: number[] = []
    if (selectedCategoryId !== null) {
      validCategoryIds = getDescendantCategoryIds(selectedCategoryId)
    } else {
      validCategoryIds = catalogConfig.categories.map((c) => c.id)
    }

    const validCategories = catalogConfig.categories.filter((c) =>
      validCategoryIds.includes(c.id)
    )

    let products = Array.from(
      new Map(
        validCategories
          .flatMap((c) => [
            ...(c.primary_products || []),
            ...(c.secondary_products || []),
          ])
          .filter((p) => !catalogConfig.hidden_product_ids?.includes(p.id))
          .map((p) => [p.id, p])
      ).values()
    )

    if (search) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    return products
  }, [catalogConfig, selectedCategoryId, search])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openProductModal = (product: any) => {
    const existingSelections: Record<number, number> = {}
    bulkItems.forEach((item) => {
      if (item.product_id === product.id) {
        existingSelections[item.variant_id] = item.quantity
      }
    })
    setModalQuantities(existingSelections)
    setActiveProduct(product)
  }

  const handleModalQuantityChange = (variantId: number, delta: number) => {
    setModalQuantities((prev) => {
      const current = prev[variantId] || 0
      const updated = Math.max(0, current + delta)
      return { ...prev, [variantId]: updated }
    })
  }

  const saveModalToCart = () => {
    if (!activeProduct) return

    const newCart = bulkItems.filter(
      (item) => item.product_id !== activeProduct.id
    )

    Object.entries(modalQuantities).forEach(([variantId, qty]) => {
      if (qty > 0) {
        newCart.push({
          product_id: activeProduct.id,
          variant_id: Number(variantId),
          quantity: qty,
        })
      }
    })

    setValue("bulk_items", newCart, { shouldValidate: true })
    setActiveProduct(null)
  }

  const onSubmit = (formData: Step5BulkData) => {
    updateData(formData)
    nextStep()
  }

  const toggleExpand = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const totalCartItems = bulkItems.reduce((acc, curr) => acc + curr.quantity, 0)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const rootCategories =
    catalogConfig?.categories.filter(
      (c) =>
        !c.parent_id ||
        !catalogConfig.categories.some((parent) => parent.id === c.parent_id)
    ) || []

  const CategorySidebarNode = ({
    category,
    depth = 0,
  }: {
    category: CatalogCategory
    depth?: number
  }) => {
    const children =
      catalogConfig?.categories.filter((c) => c.parent_id === category.id) || []
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.includes(category.id)
    const isSelected = selectedCategoryId === category.id

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={isSelected ? "default" : "ghost"}
            className={`h-8 flex-1 justify-start truncate text-left ${depth > 0 ? "ml-4" : ""}`}
            onClick={() => setSelectedCategoryId(category.id)}
            title={category.name}
          >
            {category.name}
          </Button>
          {hasChildren && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-900"
              onClick={(e) => toggleExpand(category.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 flex flex-col gap-1">
            {children.map((child) => (
              <CategorySidebarNode
                key={child.id}
                category={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex flex-1 flex-col gap-6 md:flex-row">
        <div className="w-full shrink-0 space-y-6 md:w-64">
          <div className="sticky top-4 rounded-xl border bg-gray-50 p-4">
            <h3 className="mb-4 flex items-center font-bold text-gray-900">
              <ShoppingCart className="mr-2 h-5 w-5" /> Inquiry Cart
            </h3>
            <div className="text-3xl font-black text-primary">
              {totalCartItems}
            </div>
            <p className="mb-4 text-sm text-gray-500">Total items requested</p>
            {errors.bulk_items && (
              <p className="text-xs font-medium text-destructive">
                {errors.bulk_items.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center font-bold text-gray-900">
              <Filter className="mr-2 h-4 w-4" /> Categories
            </h3>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant={selectedCategoryId === null ? "default" : "ghost"}
                className="h-8 justify-start"
                onClick={() => setSelectedCategoryId(null)}
              >
                All Categories
              </Button>
              {rootCategories.map((cat) => (
                <CategorySidebarNode key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search wholesale catalog..."
              className="bg-white pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">
                <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                No products match your filters.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCartQty = bulkItems
                  .filter((i) => i.product_id === product.id)
                  .reduce((a, b) => a + b.quantity, 0)

                return (
                  <div
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md ${inCartQty > 0 ? "border-primary ring-2 ring-primary" : ""}`}
                  >
                    <div className="relative flex aspect-4/3 w-full items-center justify-center border-b bg-gray-50 p-4">
                      {inCartQty > 0 && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          In Cart: {inCartQty}
                        </Badge>
                      )}
                      {product.main_image ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/storage/${product.main_image}`}
                          alt={product.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-sm text-gray-300">No Image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="line-clamp-2 font-semibold text-gray-900">
                        {product.name}
                      </h4>
                      <p className="mt-1 text-sm font-bold text-primary">
                        Est. ₹{product.selling_price} / unit
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={bulkItems.length === 0}>
          Review Inquiry <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* PRODUCT QUICK-VIEW MODAL */}
      <Dialog
        open={!!activeProduct}
        onOpenChange={(open) => !open && setActiveProduct(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {activeProduct && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {activeProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-gray-50 p-2 md:w-1/3">
                  {activeProduct.main_image ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/${activeProduct.main_image}`}
                      alt={activeProduct.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Wholesale pricing is estimated. Final price depends on
                      your required quantities and customization requested in
                      the previous step.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-12 gap-2 bg-gray-100 px-4 py-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      <div className="col-span-7">Variant / Option</div>
                      <div className="col-span-5 text-right">Quantity</div>
                    </div>
                    <div className="max-h-62.5 divide-y overflow-y-auto">
                      {activeProduct.variants &&
                      activeProduct.variants.length > 0 ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        activeProduct.variants.map((variant: any) => (
                          <div
                            key={variant.id}
                            className="grid grid-cols-12 items-center gap-2 p-3 hover:bg-gray-50"
                          >
                            <div className="col-span-7">
                              <p className="text-sm font-semibold">
                                {variant.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                SKU: {variant.sku}
                              </p>
                            </div>
                            <div className="col-span-5 flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleModalQuantityChange(variant.id, -1)
                                }
                                disabled={!modalQuantities[variant.id]}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-bold">
                                {modalQuantities[variant.id] || 0}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleModalQuantityChange(variant.id, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="grid grid-cols-12 items-center gap-2 p-3 hover:bg-gray-50">
                          <div className="col-span-7">
                            <p className="text-sm font-semibold">
                              Standard Item
                            </p>
                          </div>
                          <div className="col-span-5 flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleModalQuantityChange(activeProduct.id, -1)
                              }
                              disabled={!modalQuantities[activeProduct.id]}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">
                              {modalQuantities[activeProduct.id] || 0}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleModalQuantityChange(activeProduct.id, 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button type="button" onClick={saveModalToCart}>
                  Save to Inquiry Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
