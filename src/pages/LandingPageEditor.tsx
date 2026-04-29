import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Monitor,
  Smartphone,
} from "lucide-react"
import {
  useLandingPageDetailQuery,
  useLandingPageMutations,
  type LandingPageDetail,
} from "@/hooks/landing-pages"
import { type PageBlock } from "@/types/builder"

import { BuilderNavigator } from "@/components/features/landing-pages/builder/BuilderNavigator"
import { BuilderCanvas } from "@/components/features/landing-pages/builder/BuilderCanvas"
import { BuilderInspector } from "@/components/features/landing-pages/builder/BuilderInspector"

export default function LandingPageEditor() {
  const { id } = useParams<{ id: string }>()
  const { data: template, isLoading } = useLandingPageDetailQuery(id)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!template || !id) return <div>Template not found.</div>

  return <LandingPageEditorCore template={template} id={id} />
}

function LandingPageEditorCore({
  template,
  id,
}: {
  template: LandingPageDetail
  id: string
}) {
  const navigate = useNavigate()
  const { updateMutation } = useLandingPageMutations()

  const [blocks, setBlocks] = useState<PageBlock[]>(template.page_schema || [])
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    template.status
  )
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  )

  const [globalTheme, setGlobalTheme] = useState<Record<string, string>>(
    (template.global_theme_tokens as Record<string, string>) || {
      primaryColor: "#2563eb",
      textColor: "#111827",
      fontFamily: "Inter, sans-serif",
    }
  )

  const handleSave = () => {
    updateMutation.mutate({
      id: parseInt(id),
      data: {
        page_schema: blocks,
        status: status,
        global_theme_tokens: globalTheme,
      },
    })
  }

  const statusColors = {
    draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
    published: "bg-green-50 text-green-700 border-green-200",
    archived: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/landing-pages")}
              className="rounded p-1.5 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900">
              {template?.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 border-l pl-6">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published" | "archived")
              }
              className={`h-8 cursor-pointer rounded-md border px-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${statusColors[status]}`}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center rounded-md border bg-gray-50 p-0.5">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`flex items-center justify-center rounded px-3 py-1.5 text-xs transition-colors ${
              previewMode === "desktop"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`flex items-center justify-center rounded px-3 py-1.5 text-xs transition-colors ${
              previewMode === "mobile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              window.open(`/admin/landing-pages/preview/${id}`, "_blank")
            }
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </button>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <BuilderNavigator
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
        />
        <BuilderCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          previewMode={previewMode}
          globalTheme={globalTheme}
        />
        <BuilderInspector
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlockId={selectedBlockId}
          availableVariables={template?.available_variables || []}
          globalTheme={globalTheme}
          setGlobalTheme={setGlobalTheme}
        />
      </div>
    </div>
  )
}
