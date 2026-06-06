import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandingContentForm } from "@/components/storefront/BrandingContentForm"
import { CatalogCurationForm } from "@/components/storefront/CatalogCurationForm"

export default function StorefrontPage() {
  return (
    <div className="max-w-full space-y-8 pt-4 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Storefront Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your employee-facing storefront branding, legal policies,
          and product catalog.
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        {/* Clean border-bottom for the whole list, no background */}
        <TabsList className="mb-8 flex h-auto w-full justify-start space-x-6 rounded-none border-b border-gray-200 bg-transparent p-0">
          <TabsTrigger
            value="branding"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-2 pt-2 pb-3 text-sm font-medium text-gray-500 hover:text-black data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Branding & Content
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-2 pt-2 pb-3 text-sm font-medium text-gray-500 hover:text-black data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none"
          >
            Catalog Curation
          </TabsTrigger>
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
