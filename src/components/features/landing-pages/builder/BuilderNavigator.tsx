import { useState } from "react"
import {
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
} from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { type PageBlock, type BlockType } from "@/types/builder"
import { AVAILABLE_BLOCKS } from "@/config/blocks.config"
import type { CampaignRewardType } from "@/hooks/useCampaignOptions"

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

export function BuilderNavigator({
  rewardType,
}: {
  rewardType: CampaignRewardType | ""
}) {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    moveBlock,
    deleteBlock,
    toggleBlockVisibility,
  } = useBuilderStore()

  const [blockToDelete, setBlockToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleAddBlock = (blockType: BlockType) => {
    const config = AVAILABLE_BLOCKS.find((b) => b.type === blockType)
    if (!config) return

    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: config.type,
      variant: config.defaultData.variant,
      isVisible: true,
      content: { ...config.defaultData.content },
      styles: { ...config.defaultData.styles },
    } as PageBlock

    addBlock(newBlock)
  }

  const handleConfirmDelete = () => {
    if (blockToDelete) {
      deleteBlock(blockToDelete.id)
      setBlockToDelete(null)
    }
  }

  const availableBlocks = AVAILABLE_BLOCKS.filter(
    (config) => rewardType === "link" || config.type !== "RewardSelector"
  )

  return (
    <div className="flex w-72 flex-col border-r bg-white">
      <div className="border-b p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Page Structure
        </h2>
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Add Section
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableBlocks.map((config) => {
              const Icon = config.icon || LayoutTemplate
              return (
                <button
                  key={config.type}
                  onClick={() => handleAddBlock(config.type as BlockType)}
                  className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center">{config.label}</span>
                </button>
              )
            })}
          </div>
          {rewardType !== "link" && (
            <p className="mt-3 rounded-md bg-blue-50 p-2 text-xs leading-relaxed text-blue-700">
              Gift Selector is available only for Link pages. Points and Code
              pages display content but cannot be used to purchase products.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
          Current Layers
        </p>
        {blocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-100 py-8 text-center text-sm text-gray-400">
            No sections added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => {
              const config = AVAILABLE_BLOCKS.find((b) => b.type === block.type)
              const isSelected = selectedBlockId === block.id
              const blockName = config?.label || block.type

              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  } ${!block.isVisible && "opacity-60"}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBlockVisibility(block.id)
                      }}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {block.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <span className="truncate text-sm font-medium text-gray-700">
                      {blockName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveBlock(index, "up")
                        }}
                        disabled={index === 0}
                        className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveBlock(index, "down")
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setBlockToDelete({ id: block.id, name: blockName })
                      }}
                      className="ml-1 rounded p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!blockToDelete}
        onOpenChange={(open) => !open && setBlockToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this section?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the{" "}
              <span className="font-semibold text-gray-900">
                {blockToDelete?.name}
              </span>{" "}
              section? This action will immediately remove it from your page
              structure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
