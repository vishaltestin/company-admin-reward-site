import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Monitor,
  Smartphone,
  Undo2,
  Redo2,
} from "lucide-react"
import {
  useLandingPageDetailQuery,
  useLandingPageMutations,
  type LandingPageDetail,
} from "@/hooks/landing-pages"
import { useBuilderShortcuts } from "@/hooks/useBuilderShortcuts"
import { useBuilderStore } from "@/store/useBuilderStore"
import { type PageBlock, type ThemeTokens } from "@/types/builder"
import type { CampaignRewardType } from "@/hooks/useCampaignOptions"
import { toast } from "sonner"

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
  const [rewardType, setRewardType] = useState<CampaignRewardType | "">(
    template.reward_type ?? ""
  )

  const {
    status,
    previewMode,
    blocks,
    globalTheme,
    pastBlocks,
    futureBlocks,
    undo,
    redo,
    setStatus,
    setPreviewMode,
    setBlocks,
    initializeBuilder,
  } = useBuilderStore()
  useBuilderShortcuts()

  useEffect(() => {
    if (template) {
      const safeTheme: ThemeTokens =
        (template.global_theme_tokens as ThemeTokens) || {
          primaryColor: "#2563eb",
          textColor: "#111827",
          fontFamily: "Inter, sans-serif",
        }

      const initialBlocks = (template.page_schema || []) as PageBlock[]
      const compatibleBlocks =
        template.reward_type === "link"
          ? initialBlocks
          : initialBlocks.filter((block) => block.type !== "RewardSelector")

      // Older points/code templates may already contain a product selector.
      // Hide it immediately in the editor; saving persists the cleaned schema.
      initializeBuilder(compatibleBlocks, template.status, safeTheme)
    }
  }, [template, initializeBuilder])

  const handleRewardTypeChange = (nextType: CampaignRewardType | "") => {
    setRewardType(nextType)

    if (nextType !== "link") {
      const compatibleBlocks = blocks.filter(
        (block) => block.type !== "RewardSelector"
      )

      if (compatibleBlocks.length !== blocks.length) {
        // setBlocks retains undo history, but the save guard below prevents a
        // selector from being restored into a points/code page accidentally.
        setBlocks(compatibleBlocks)
        toast.info(
          "Gift Selector sections were removed because they are available only for Link pages."
        )
      }
    }
  }

  const handleSave = () => {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) return

    const pageSchema =
      rewardType === "link"
        ? blocks
        : blocks.filter((block) => block.type !== "RewardSelector")

    if (pageSchema.length !== blocks.length) {
      setBlocks(pageSchema)
    }

    updateMutation.mutate({
      id: numericId,
      data: {
        page_schema: pageSchema,
        status: status,
        reward_type: rewardType || null,
        global_theme_tokens: globalTheme,
      },
    })
  }

  const hasLinkOnlyBlocks =
    rewardType !== "link" &&
    ((template.page_schema || []).some(
      (block) => block.type === "RewardSelector"
    ) ||
      blocks.some((block) => block.type === "RewardSelector"))

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
              onClick={() => navigate("/landing-page-templates")}
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

          <div className="flex items-center gap-2 border-l pl-6">
            <span className="text-xs font-medium text-gray-500">Reward:</span>
            <select
              value={rewardType}
              onChange={(e) =>
                handleRewardTypeChange(
                  e.target.value as CampaignRewardType | ""
                )
              }
              className="h-8 cursor-pointer rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              title="Exact campaign type for which this landing page can be selected"
            >
              <option value="">Unassigned (library only)</option>
              <option value="points">Points</option>
              <option value="code">Code</option>
              <option value="link">Link</option>
            </select>
          </div>
        </div>

        {/* UNDO / REDO & DEVICE PREVIEW CONTROLS */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4">
          <div className="flex items-center gap-1 rounded-md border bg-gray-50 p-0.5">
            <button
              onClick={undo}
              disabled={pastBlocks.length === 0}
              className="flex items-center justify-center rounded px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={futureBlocks.length === 0}
              className="flex items-center justify-center rounded px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center rounded-md border bg-gray-50 p-0.5">
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
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              window.open(`/landing-pages/preview/${id}`, "_blank")
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

      {hasLinkOnlyBlocks && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          Gift Selector sections are available only for Link pages. They will be
          removed when you save this template with the selected reward type.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <BuilderNavigator rewardType={rewardType} />
        <BuilderCanvas />
        <BuilderInspector
          availableVariables={template?.available_variables || []}
        />
      </div>
    </div>
  )
}
