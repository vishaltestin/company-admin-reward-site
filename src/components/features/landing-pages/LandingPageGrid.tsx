import { useState } from "react"
import { Copy, Edit, LayoutTemplate, Trash2, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  useLandingPageMutations,
  useLandingPagesQuery,
  type LandingPageTemplate,
} from "@/hooks/landing-pages"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GridProps {
  selectedEventId: number | null
}

export function LandingPageGrid({ selectedEventId }: GridProps) {
  const [activeTab, setActiveTab] = useState<"global" | "variations">("global")
  const navigate = useNavigate()

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [templateToDuplicate, setTemplateToDuplicate] =
    useState<LandingPageTemplate | null>(null)
  const [duplicateForm, setDuplicateForm] = useState({ name: "", title: "" })

  const [templateToDelete, setTemplateToDelete] = useState<{
    id: number
    name: string
  } | null>(null)

  const { data: templates, isLoading } = useLandingPagesQuery(
    selectedEventId,
    activeTab
  )
  const { duplicateMutation, deleteMutation } = useLandingPageMutations()

  const handleDuplicateClick = (template: LandingPageTemplate) => {
    setTemplateToDuplicate(template)
    setDuplicateForm({
      name: `Copy of ${template.name}`,
      title: template.title,
    })
    setDuplicateModalOpen(true)
  }

  const handleConfirmDuplicate = () => {
    if (!templateToDuplicate) return

    duplicateMutation.mutate(
      {
        id: templateToDuplicate.id,
        payload: duplicateForm,
      },
      {
        onSuccess: () => {
          setDuplicateModalOpen(false)
          setActiveTab("variations")
        },
      }
    )
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()

    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id, {
        onSuccess: () => {
          setTemplateToDelete(null)
        },
      })
    }
  }

  if (!selectedEventId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <LayoutTemplate className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>Select an event from the sidebar to view landing pages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/30">
      <div className="flex space-x-6 border-b bg-white px-8 pt-6">
        <button
          onClick={() => setActiveTab("global")}
          className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
            activeTab === "global"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          System Master Templates
        </button>
        <button
          onClick={() => setActiveTab("variations")}
          className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
            activeTab === "variations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Company Variations
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : templates?.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No landing pages found for this event in this tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {template.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Title: {template.title}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        template.status === "published"
                          ? "bg-green-100 text-green-800"
                          : template.status === "archived"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {template.status.charAt(0).toUpperCase() +
                        template.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    {activeTab === "global" ? (
                      <button
                        onClick={() => handleDuplicateClick(template)}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-50 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4" />
                        Customize for My Company
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/landing-pages/editor/${template.id}`)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-900 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                          Open Builder
                        </button>
                        <button
                          onClick={() =>
                            setTemplateToDelete({
                              id: template.id,
                              name: template.name,
                            })
                          }
                          className="ml-2 rounded-md p-2 text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Landing Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Internal Name (For your reference)</Label>
              <Input
                id="name"
                value={duplicateForm.name}
                onChange={(e) =>
                  setDuplicateForm({ ...duplicateForm, name: e.target.value })
                }
                placeholder="e.g., Diwali Promo - HR Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">
                Public Page Title (Shows in browser tab)
              </Label>
              <Input
                id="title"
                value={duplicateForm.title}
                onChange={(e) =>
                  setDuplicateForm({ ...duplicateForm, title: e.target.value })
                }
                placeholder="e.g., Claim Your Festive Bonus!"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDuplicate}
              disabled={
                duplicateMutation.isPending ||
                !duplicateForm.name ||
                !duplicateForm.title
              }
            >
              {duplicateMutation.isPending ? "Duplicating..." : "Create Copy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-semibold text-gray-900">
                {templateToDelete?.name}
              </span>{" "}
              landing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
