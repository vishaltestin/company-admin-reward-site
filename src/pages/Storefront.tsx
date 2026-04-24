import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandingContentForm } from "@/components/storefront/BrandingContentForm"
import { CatalogCurationForm } from "@/components/storefront/CatalogCurationForm"

export default function StorefrontPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Storefront Management
        </h1>
        <p className="mt-1 text-gray-500">
          Configure your employee-facing storefront branding, legal policies,
          and product catalog.
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="branding">Branding & Content</TabsTrigger>
          <TabsTrigger value="catalog">Catalog Curation</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="focus-visible:outline-none">
          <BrandingContentForm />
        </TabsContent>

        <TabsContent value="catalog" className="focus-visible:outline-none">
          <CatalogCurationForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
