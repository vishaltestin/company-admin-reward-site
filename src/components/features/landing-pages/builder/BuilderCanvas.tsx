import { useBuilderStore } from "@/store/useBuilderStore"
import { BlockRenderer } from "./BlockRenderer"

export function BuilderCanvas() {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    previewMode,
    globalTheme,
  } = useBuilderStore()

  const canvasWrapperClass =
    previewMode === "mobile" ? "max-w-[375px]" : "max-w-[1200px]"

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-200/50 p-4 lg:p-8"
      onClick={() => setSelectedBlockId(null)}
    >
      <div
        className={`mx-auto flex min-h-[800px] w-full flex-col overflow-hidden bg-white shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 ease-in-out ${canvasWrapperClass}`}
        style={
          {
            "--theme-primary": globalTheme.primaryColor,
            "--theme-text": globalTheme.textColor,
            fontFamily: globalTheme.fontFamily,
          } as React.CSSProperties
        }
      >
        {blocks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <p>Your page is empty. Add a section from the left menu.</p>
          </div>
        ) : (
          blocks.map((block) => {
            if (!block.isVisible) return null
            const isSelected = selectedBlockId === block.id

            return (
              <div
                key={block.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBlockId(block.id)
                }}
                className={`group relative cursor-pointer transition-all ${
                  isSelected
                    ? "z-10 ring-2 ring-blue-500"
                    : "hover:z-10 hover:ring-2 hover:ring-blue-400/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 left-4 z-20 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                    {block.type}
                  </div>
                )}
                <div className="pointer-events-none">
                  <BlockRenderer block={block} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
