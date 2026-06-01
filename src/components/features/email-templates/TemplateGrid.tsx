import { useState } from "react"
import { Copy, Edit, Mail, Trash2, Eye, Loader2 } from "lucide-react"
import { useTemplateMutations, useTemplatesQuery } from "@/hooks/templates"
import { useNavigate } from "react-router-dom"
import { TemplatePreviewModal } from "./TemplatePreviewModal"

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
  const [previewId, setPreviewId] = useState<string | null>(null)

  const [templateToDelete, setTemplateToDelete] = useState<{
    id: number
    name: string
  } | null>(null)

  const navigate = useNavigate()

  const { data: templates, isLoading } = useTemplatesQuery(
    selectedEventId,
    activeTab
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
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Mail className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>Select an event from the sidebar to view templates.</p>
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
                className="h-64 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : templates?.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No templates found for this event in this tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="group relative flex h-40 items-center justify-center overflow-hidden border-b bg-gray-100">
                  {template.thumbnail_path ? (
                    <img
                      src={template.thumbnail_path}
                      alt="thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No Preview</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewId(template.id.toString())}
                      className="flex scale-95 transform items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg transition-transform hover:bg-gray-100 group-hover:scale-100"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h4 className="line-clamp-1 font-semibold text-gray-800">
                    {template.name}
                  </h4>
                  <p className="mt-1 line-clamp-1 flex-1 text-xs text-gray-500">
                    Subj: {template.subject}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    {activeTab === "global" ? (
                      <button
                        onClick={() => duplicateMutation.mutate(template.id)}
                        disabled={duplicateMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-50 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Copy className="h-4 w-4" />
                        {duplicateMutation.isPending
                          ? "Copying..."
                          : "Customize & Save to My Variations"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/email-templates/editor/${template.id}`)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-900 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
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

      <TemplatePreviewModal id={previewId} onClose={() => setPreviewId(null)} />

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
              template variation.
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
