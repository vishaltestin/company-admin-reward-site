import { useState } from "react"
import {
  Copy,
  Edit,
  Mail,
  Trash2,
  Eye,
  Loader2,
  LayoutTemplate,
} from "lucide-react"
import { useTemplateMutations, useTemplatesQuery } from "@/hooks/templates"
import { useNavigate } from "react-router-dom"
import { TemplatePreviewModal } from "./TemplatePreviewModal"
import {
  RewardTypeBadge,
  RewardTypeFilter,
  type RewardTypeFilterValue,
} from "@/components/features/rewards/RewardTypeControls"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GridProps {
  selectedEventId: number | null
}

export function TemplateGrid({ selectedEventId }: GridProps) {
  const [activeTab, setActiveTab] = useState<"global" | "variations">("global")
  const [rewardTypeFilter, setRewardTypeFilter] =
    useState<RewardTypeFilterValue>("all")
  const [previewId, setPreviewId] = useState<string | null>(null)

  const [templateToDelete, setTemplateToDelete] = useState<{
    id: number
    name: string
  } | null>(null)

  const navigate = useNavigate()

  const { data: templates, isLoading } = useTemplatesQuery(
    selectedEventId,
    activeTab,
    rewardTypeFilter === "all" ? undefined : rewardTypeFilter
  )
  const { duplicateMutation, deleteMutation } = useTemplateMutations()

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
            manage its associated email templates.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50/30">
      {/* Header & Tabs */}
      <div className="border-b bg-white px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Templates</h2>

          <RewardTypeFilter
            value={rewardTypeFilter}
            onChange={setRewardTypeFilter}
          />

          <div className="inline-flex rounded-lg bg-slate-100 p-1">
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

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="h-32 w-full animate-pulse rounded-lg bg-slate-100"></div>
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100"></div>
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100"></div>
                <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-slate-50"></div>
              </div>
            ))}
          </div>
        ) : templates?.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
            <Mail className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No templates found
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
                <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50">
                  {template.thumbnail_path ? (
                    <img
                      src={template.thumbnail_path}
                      alt="thumbnail"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <LayoutTemplate className="mb-2 h-8 w-8 opacity-50" />
                      <span className="text-xs font-medium tracking-wider uppercase">
                        No Preview
                      </span>
                    </div>
                  )}

                  {/* Image Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewId(template.id.toString())}
                      className="flex scale-90 transform items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:scale-105 hover:bg-white group-hover:scale-100"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h4
                    className="line-clamp-1 font-semibold text-slate-800"
                    title={template.name}
                  >
                    {template.name}
                  </h4>
                  <div className="mt-2">
                    <RewardTypeBadge type={template.reward_type} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Subj:</span>
                    <span
                      className="line-clamp-1 flex-1"
                      title={template.subject}
                    >
                      {template.subject}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-1">
                    {activeTab === "global" ? (
                      <button
                        onClick={() => duplicateMutation.mutate(template.id)}
                        disabled={duplicateMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Copy className="h-4 w-4" />
                        {duplicateMutation.isPending
                          ? "Copying..."
                          : "Customize Design"}
                      </button>
                    ) : (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() =>
                            navigate(`/email-templates/editor/${template.id}`)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Design
                        </button>
                        <button
                          onClick={() =>
                            setTemplateToDelete({
                              id: template.id,
                              name: template.name,
                            })
                          }
                          className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2.5 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                          title="Delete Template"
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

      <TemplatePreviewModal id={previewId} onClose={() => setPreviewId(null)} />

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template Variation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{templateToDelete?.name}"
              </span>
              ? This action cannot be undone and will permanently remove it from
              your variations.
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
                "Delete Template"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
