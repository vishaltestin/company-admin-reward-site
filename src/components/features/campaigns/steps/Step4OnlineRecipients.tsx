import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  UploadCloud,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useCampaignStore } from "@/store/useCampaignStore"
import { step4OnlineSchema, type Step4OnlineData } from "../schemas"
import { useCampaignVerticals } from "@/hooks/useCampaignOptions"
import { useEmployeesQuery } from "@/hooks/useEmployees"

import { RewardeeForm } from "@/components/admin/RewardeeForm"
import { BulkUpload } from "@/components/admin/BulkUpload"

export function Step4OnlineRecipients() {
  const { data: storeData, updateData, nextStep, prevStep } = useCampaignStore()

  const { data: verticals } = useCampaignVerticals()
  const currentVertical = verticals?.find((v) => v.id === storeData.vertical_id)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      // Always reset, including when search is cleared; otherwise the user
      // can remain on a page that does not exist in the new result set.
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: employeesData,
    isLoading,
    isFetching,
    refetch,
  } = useEmployeesQuery({
    vertical: currentVertical?.slug || "",
    page,
    search: debouncedSearch,
    activeOnly: true,
  })

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step4OnlineData>({
    resolver: zodResolver(step4OnlineSchema),
    defaultValues: {
      recipient_ids: storeData.recipient_ids || [],
    },
  })

  // const selectedIds = watch("recipient_ids")
  const selectedIds = useWatch({ control, name: "recipient_ids" })

  const handleToggleUser = (userId: number) => {
    const current = new Set(selectedIds)
    if (current.has(userId)) {
      current.delete(userId)
    } else {
      current.add(userId)
    }
    setValue("recipient_ids", Array.from(current), { shouldValidate: true })
  }

  const handleToggleAll = (currentPageIds: number[]) => {
    const current = new Set(selectedIds)
    const allSelected = currentPageIds.every((id) => current.has(id))

    if (allSelected) {
      currentPageIds.forEach((id) => current.delete(id))
    } else {
      currentPageIds.forEach((id) => current.add(id))
    }
    setValue("recipient_ids", Array.from(current), { shouldValidate: true })
  }

  const handleSuccess = () => {
    refetch()
    setIsFormOpen(false)
    setIsBulkOpen(false)
  }

  const onSubmit = (formData: Step4OnlineData) => {
    updateData(formData)
    nextStep()
  }

  const currentPageIds = employeesData?.data.map((user) => user.id) || []
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id))

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full animate-in flex-col space-y-6 duration-500 fade-in slide-in-from-right-4"
    >
      <div className="flex-1 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Select Recipients
            </h2>
            <p className="text-muted-foreground">
              Choose the {currentVertical?.name} employees who will receive this
              campaign.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkOpen(true)}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Bulk Import
            </Button>
            <Button type="button" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search recipients..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {selectedIds.length} Selected
          </div>
        </div>

        <div className="overflow-hidden rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    onCheckedChange={() => handleToggleAll(currentPageIds)}
                    aria-label="Select all on page"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                  </TableCell>
                </TableRow>
              ) : employeesData?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-gray-500"
                  >
                    No recipients found in this vertical.
                  </TableCell>
                </TableRow>
              ) : (
                employeesData?.data.map((user) => (
                  <TableRow
                    key={user.id}
                    className={
                      selectedIds.includes(user.id) ? "bg-primary/5" : ""
                    }
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {employeesData && employeesData.total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {employeesData.from ?? 0}–{employeesData.to ?? 0} of{" "}
              {employeesData.total} recipients · Page{" "}
              {employeesData.current_page} of {employeesData.last_page}.
              Selections are kept across pages.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= employeesData.last_page || isFetching}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {errors.recipient_ids && (
          <p className="text-center text-sm font-medium text-destructive">
            {errors.recipient_ids.message}
          </p>
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

      {currentVertical?.slug && (
        <>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Recipient</DialogTitle>
              </DialogHeader>
              <RewardeeForm
                verticalSlug={currentVertical.slug}
                onSuccess={handleSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Upload Recipients</DialogTitle>
              </DialogHeader>
              <BulkUpload
                verticalSlug={currentVertical.slug}
                onSuccess={handleSuccess}
                onCancel={() => setIsBulkOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </form>
  )
}
