import { Settings2, Type, Paintbrush, Layout, PlusCircle } from "lucide-react"
import { type PageBlock } from "@/types/builder"
import { AVAILABLE_BLOCKS, type BlockField } from "@/config/blocks.config"

interface InspectorProps {
  blocks: PageBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<PageBlock[]>>
  selectedBlockId: string | null
  availableVariables?: { name: string; value: string }[]
}

export function BuilderInspector({
  blocks,
  setBlocks,
  selectedBlockId,
  availableVariables = [],
}: InspectorProps) {
  // 1. Find the currently active block and its configuration
  const activeBlock = blocks.find((b) => b.id === selectedBlockId)
  const config = activeBlock
    ? AVAILABLE_BLOCKS.find((c) => c.type === activeBlock.type)
    : null

  // 2. The Universal Update Function
  const handleUpdate = (
    section: "content" | "styles" | "root",
    key: string,
    value: string | number | boolean
  ) => {
    if (!activeBlock) return

    setBlocks(
      blocks.map((block) => {
        if (block.id !== activeBlock.id) return block

        if (section === "root") {
          return { ...block, [key]: value }
        }

        return {
          ...block,
          [section]: {
            ...block[section],
            [key]: value,
          },
        }
      })
    )
  }

  // NEW: Function to append a variable to the current text
  const handleInsertVariable = (
    section: "content" | "styles",
    key: string,
    variableValue: string
  ) => {
    if (!activeBlock) return

    const currentValue = activeBlock[section]?.[key] || ""
    const newValue = currentValue
      ? `${currentValue} ${variableValue}`
      : variableValue
    handleUpdate(section, key, newValue)
  }

  const renderField = (field: BlockField, section: "content" | "styles") => {
    const currentValue = activeBlock?.[section]?.[field.name] ?? ""

    return (
      <div key={field.name} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            {field.label}
          </label>

          {(field.type === "text" || field.type === "textarea") &&
            availableVariables.length > 0 && (
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800"
                >
                  <PlusCircle className="h-3 w-3" /> Insert Tag
                </button>
                <div className="absolute top-full right-0 z-50 hidden w-48 pt-2 group-hover:block">
                  <div className="rounded-md border bg-white p-1 shadow-lg">
                    {availableVariables.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() =>
                          handleInsertVariable(section, field.name, v.value)
                        }
                        className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-100"
                      >
                        {v.name}{" "}
                        <span className="text-gray-400">({v.value})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>

        {field.type === "text" && (
          <input
            type="text"
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            placeholder={field.placeholder}
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
          />
        )}

        {field.type === "textarea" && (
          <textarea
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
          />
        )}

        {field.type === "select" && field.options && (
          <select
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "color" && (
          <div className="flex gap-2">
            <input
              type="color"
              value={currentValue as string}
              onChange={(e) =>
                handleUpdate(section, field.name, e.target.value)
              }
              className="h-9 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
            />
            <input
              type="text"
              value={currentValue as string}
              onChange={(e) =>
                handleUpdate(section, field.name, e.target.value)
              }
              className="flex h-9 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
            />
          </div>
        )}

        {field.type === "number" && (
          <input
            type="number"
            min={field.min}
            max={field.max}
            value={currentValue as number}
            onChange={(e) =>
              handleUpdate(section, field.name, Number(e.target.value))
            }
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
          />
        )}

        {field.type === "image" && (
          <input
            type="text"
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            placeholder="Paste image URL here..."
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
          />
        )}

        {field.type === "boolean" && (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={currentValue === true}
              onChange={(e) =>
                handleUpdate(section, field.name, e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-600">Enable</span>
          </label>
        )}
      </div>
    )
  }

  // --- EMPTY STATE ---
  if (!activeBlock || !config) {
    return (
      <div className="flex w-80 flex-col items-center justify-center border-l bg-white p-8 text-center text-gray-500">
        <Settings2 className="mb-4 h-12 w-12 text-gray-200" />
        <h3 className="text-sm font-medium text-gray-900">No Block Selected</h3>
        <p className="mt-1 text-xs">
          Click on a block in the canvas or layers panel to edit its settings.
        </p>
      </div>
    )
  }

  // --- SETTINGS STATE ---
  return (
    <div className="flex w-80 flex-col border-l bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <config.icon className="h-5 w-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">
            {config.label} Settings
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Layout / Variant Settings */}
        {config.variants.length > 0 && (
          <div className="mb-6 space-y-3 border-b pb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Layout className="h-4 w-4" />
              Layout
            </div>
            <select
              value={activeBlock.variant}
              onChange={(e) => handleUpdate("root", "variant", e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              {config.variants.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content Settings */}
        {config.fields.content.length > 0 && (
          <div className="mb-6 space-y-4 border-b pb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Type className="h-4 w-4" />
              Content
            </div>
            <div className="space-y-4">
              {config.fields.content.map((field) =>
                renderField(field, "content")
              )}
            </div>
          </div>
        )}

        {/* Styles Settings */}
        {config.fields.styles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Paintbrush className="h-4 w-4" />
              Design & Styles
            </div>
            <div className="space-y-4">
              {config.fields.styles.map((field) =>
                renderField(field, "styles")
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
