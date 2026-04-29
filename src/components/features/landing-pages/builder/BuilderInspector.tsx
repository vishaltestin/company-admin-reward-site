import { useState } from "react"
import {
  Settings2,
  Type,
  Paintbrush,
  Layout,
  PlusCircle,
  Upload,
  Loader2,
} from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import {
  AVAILABLE_BLOCKS,
  type BlockField,
  type BlockConfig,
} from "@/config/blocks.config"
import { type PageBlock, type ThemeTokens } from "@/types/builder"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { ColorPickerInput } from "@/components/ui/color-picker-input"

interface InspectorProps {
  availableVariables?: { name: string; value: string }[]
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export function BuilderInspector({ availableVariables = [] }: InspectorProps) {
  const { blocks, selectedBlockId, globalTheme, setGlobalTheme } =
    useBuilderStore()

  const activeBlock = blocks.find((b) => b.id === selectedBlockId)
  const config = activeBlock
    ? AVAILABLE_BLOCKS.find((c) => c.type === activeBlock.type)
    : undefined

  if (!activeBlock || !config) {
    return <GlobalSettingsPanel theme={globalTheme} setTheme={setGlobalTheme} />
  }

  return (
    <BlockSettingsPanel
      block={activeBlock}
      config={config}
      availableVariables={availableVariables}
    />
  )
}

// ----------------------------------------------------------------------
// GLOBAL SETTINGS PANEL
// ----------------------------------------------------------------------
function GlobalSettingsPanel({
  theme,
  setTheme,
}: {
  theme: ThemeTokens
  setTheme: (theme: ThemeTokens) => void
}) {
  const updateTheme = (key: keyof ThemeTokens, value: string) => {
    setTheme({ ...theme, [key]: value })
  }

  return (
    <div className="flex w-80 flex-col border-l bg-white">
      <div className="flex items-center gap-2 border-b p-4">
        <Settings2 className="h-5 w-5 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-900">Global Settings</h2>
      </div>
      <div className="space-y-6 p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Brand Color
          </label>
          <ColorPickerInput
            value={theme.primaryColor}
            onChange={(val) => updateTheme("primaryColor", val)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Text Color
          </label>
          <ColorPickerInput
            value={theme.textColor}
            onChange={(val) => updateTheme("textColor", val)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Font Family
          </label>
          <select
            value={theme.fontFamily}
            onChange={(e) => updateTheme("fontFamily", e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Merriweather, serif">Merriweather</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// BLOCK SETTINGS PANEL
// ----------------------------------------------------------------------
function BlockSettingsPanel({
  block,
  config,
  availableVariables,
}: {
  block: PageBlock
  config: BlockConfig
  availableVariables: { name: string; value: string }[]
}) {
  const { updateBlock } = useBuilderStore()
  const [isUploading, setIsUploading] = useState<string | null>(null)

  // Type-safe update wrapper
  const handleUpdate = (
    section: "content" | "styles" | "root",
    key: string,
    value: string | number | boolean
  ) => {
    const updatedBlock = { ...block } as PageBlock

    if (section === "root") {
      // @ts-expect-error - Handling dynamic union root properties
      updatedBlock[key] = value
    } else {
      // @ts-expect-error - Handling dynamic union nested properties
      updatedBlock[section] = { ...updatedBlock[section], [key]: value }
    }

    updateBlock(block.id, updatedBlock)
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "content" | "styles",
    fieldName: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("files[]", file)

    setIsUploading(fieldName)
    try {
      const { data } = await api.post("/landing-pages/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (data && data.data && data.data.length > 0) {
        handleUpdate(section, fieldName, data.data[0])
        toast.success("Image uploaded successfully!")
      }
    } catch (error) {
      console.error("Upload failed", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(null)
    }
  }

  const handleInsertVariable = (
    section: "content" | "styles",
    key: string,
    variableValue: string
  ) => {
    // @ts-expect-error - safe dynamic read
    const currentValue = (block[section]?.[key] as string) || ""
    const newValue = currentValue
      ? `${currentValue} ${variableValue}`
      : variableValue
    handleUpdate(section, key, newValue)
  }

  const renderField = (field: BlockField, section: "content" | "styles") => {
    // @ts-expect-error - safe dynamic read
    const currentValue = block[section]?.[field.name] ?? ""

    return (
      <div key={field.name} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            {field.label}
          </label>

          {/* Variables Dropdown (Only for text/textarea) */}
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

          {/* Clear Image Button */}
          {field.type === "image" && currentValue && (
            <button
              onClick={() => handleUpdate(section, field.name, "")}
              className="text-[10px] text-red-500 hover:underline"
            >
              Clear Image
            </button>
          )}
        </div>

        {/* FIELD INPUTS */}
        {field.type === "text" && (
          <input
            type="text"
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            placeholder={field.placeholder}
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        )}

        {field.type === "textarea" && (
          <textarea
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        )}

        {field.type === "color" && (
          <ColorPickerInput
            value={(currentValue as string) || ""}
            onChange={(val) => handleUpdate(section, field.name, val)}
          />
        )}

        {field.type === "select" && field.options && (
          <select
            value={currentValue as string}
            onChange={(e) => handleUpdate(section, field.name, e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
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

        {field.type === "image" && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={currentValue as string}
              onChange={(e) =>
                handleUpdate(section, field.name, e.target.value)
              }
              placeholder="Paste image URL here..."
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
              {isUploading === field.name ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading === field.name
                ? "Uploading..."
                : "Upload from Computer"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, section, field.name)}
                disabled={isUploading === field.name}
              />
            </label>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-80 flex-col border-l bg-white">
      <div className="flex items-center gap-2 border-b p-4">
        <config.icon className="h-5 w-5 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-900">
          {config.label} Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {config.variants.length > 0 && (
          <div className="mb-6 space-y-3 border-b pb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Layout className="h-4 w-4" /> Layout
            </div>
            <select
              value={block.variant}
              onChange={(e) => handleUpdate("root", "variant", e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
            >
              {config.variants.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {config.fields.content.length > 0 && (
          <div className="mb-6 space-y-4 border-b pb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Type className="h-4 w-4" /> Content
            </div>
            {config.fields.content.map((field) =>
              renderField(field, "content")
            )}
          </div>
        )}

        {config.fields.styles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              <Paintbrush className="h-4 w-4" /> Design
            </div>
            {config.fields.styles.map((field) => renderField(field, "styles"))}
          </div>
        )}
      </div>
    </div>
  )
}
