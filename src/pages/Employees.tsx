import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore, type User } from "@/store/useAuthStore"
import { useVerticalsQuery } from "@/hooks/useVerticals"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Loader2 } from "lucide-react"

import { EmployeeTable } from "@/components/admin/EmployeeTable"
import { RewardeeForm } from "@/components/admin/RewardeeForm"
import { BulkUpload } from "@/components/admin/BulkUpload"

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: dbVerticals, isLoading: isLoadingVerticals } =
    useVerticalsQuery()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [isBulkOpen, setIsBulkOpen] = useState<boolean>(false)

  const availableTabs = useMemo(() => {
    if (!user || !dbVerticals) return []

    if (["business_head", "super_admin"].includes(user.user_type)) {
      return dbVerticals
    }

    return dbVerticals.filter((vertical) =>
      user.managed_vertical_ids.includes(vertical.id)
    )
  }, [user, dbVerticals])

  const currentTab =
    selectedTab || (availableTabs.length > 0 ? availableTabs[0].slug : "")

  if (isLoadingVerticals) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (availableTabs.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Users className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2 max-w-sm text-gray-500">
          You have not been assigned to manage any recipient verticals. Please
          contact your Business Head for access.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Recipient Management
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your company's network across different verticals.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setIsBulkOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            onClick={() => {
              setEditingUser(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Recipient
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setSelectedTab}
        className="w-full space-y-6"
      >
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          {availableTabs.map((tab) => (
            <TabsTrigger
              key={tab.slug}
              value={tab.slug}
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTabs.map((tab) => (
          <TabsContent
            key={tab.slug}
            value={tab.slug}
            className="m-0 focus-visible:outline-none"
          >
            {currentTab === tab.slug && (
              <EmployeeTable
                key={tab.slug}
                verticalSlug={tab.slug}
                onEdit={(userData) => {
                  setEditingUser(userData)
                  setIsFormOpen(true)
                }}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser
                  ? `Edit ${editingUser.first_name}`
                  : "Add New Recipient"}
              </h2>
              <p className="text-sm text-gray-500">
                Vertical:{" "}
                <span className="font-semibold capitalize">
                  {currentTab.replace("_", " ")}
                </span>
              </p>
            </div>

            <RewardeeForm
              verticalSlug={currentTab}
              initialData={editingUser}
              onSuccess={() => {
                setIsFormOpen(false)
                queryClient.invalidateQueries({ queryKey: ["employees"] })
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload</h2>
                <p className="text-sm text-gray-500">
                  Importing to:{" "}
                  <span className="font-semibold text-gray-700 capitalize">
                    {currentTab.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>

            <BulkUpload
              verticalSlug={currentTab}
              onSuccess={() => {
                setIsBulkOpen(false)
                queryClient.invalidateQueries({ queryKey: ["employees"] })
              }}
              onCancel={() => setIsBulkOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
