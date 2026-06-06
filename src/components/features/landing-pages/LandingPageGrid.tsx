import { useState } from "react"
import {
  Copy,
  Edit,
  LayoutTemplate,
  Trash2,
  Loader2,
  Globe,
} from "lucide-react"
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
      <div className="flex flex-1 items-center justify-center bg-slate-50/50">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <LayoutTemplate className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">
            No Event Selected
          </h3>
          <p className="text-sm text-slate-500">
            Choose an event trigger from the sidebar on the left to view and
            manage its associated landing pages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50/30">
      {/* Header & Tabs */}
      <div className="border-b bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Landing Pages
          </h2>

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "global"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
              }`}
            >
              System Master
            </button>
            <button
              onClick={() => setActiveTab("variations")}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "variations"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
              }`}
            >
              My Variations
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100"></div>
                </div>
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100"></div>
                <div className="mt-8 h-10 w-full animate-pulse rounded-md bg-slate-50"></div>
              </div>
            ))}
          </div>
        ) : templates?.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
            <LayoutTemplate className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No landing pages found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              There are no templates for this event in the current tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-blue-100"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50">
                  {template.thumbnail_path ? (
                    <img
                      src={template.thumbnail_path}
                      alt={template.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Globe className="h-10 w-10 text-slate-300 opacity-50 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-200" />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className="line-clamp-1 font-semibold text-slate-900"
                        title={template.name}
                      >
                        {template.name}
                      </h4>
                      <p
                        className="mt-1 line-clamp-1 text-xs text-slate-500"
                        title={template.title}
                      >
                        <span className="font-medium text-slate-400">
                          Title:
                        </span>{" "}
                        {template.title}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        template.status === "published"
                          ? "bg-green-100 text-green-700"
                          : template.status === "archived"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {template.status}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-1">
                    {activeTab === "global" ? (
                      <button
                        onClick={() => handleDuplicateClick(template)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4" />
                        Customize for My Company
                      </button>
                    ) : (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() =>
                            navigate(`/landing-pages/editor/${template.id}`)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
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
                          className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2.5 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duplicate Landing Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">
                Internal Name (For your reference)
              </Label>
              <Input
                id="name"
                value={duplicateForm.name}
                onChange={(e) =>
                  setDuplicateForm({ ...duplicateForm, name: e.target.value })
                }
                placeholder="e.g., Diwali Promo - HR Team"
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">
                Public Page Title (Shows in browser tab)
              </Label>
              <Input
                id="title"
                value={duplicateForm.title}
                onChange={(e) =>
                  setDuplicateForm({ ...duplicateForm, title: e.target.value })
                }
                placeholder="e.g., Claim Your Festive Bonus!"
                className="focus-visible:ring-blue-500"
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
              className="bg-blue-600 hover:bg-blue-700"
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
            <AlertDialogTitle>Delete Landing Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{templateToDelete?.name}"
              </span>
              ? This action cannot be undone and will permanently remove it.
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
                "Delete Page"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
