import { useState, useRef, useEffect } from "react"
import { HexColorPicker } from "react-colorful"

interface Props {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ColorPickerInput({ value, onChange, label }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Provide a safe fallback if value is empty
  const safeValue = value || "#000000"

  return (
    <div className="relative flex flex-col gap-1.5" ref={popoverRef}>
      {label && (
        <label className="text-xs font-medium text-gray-700">{label}</label>
      )}
      <div className="flex gap-2">
        {/* The Color Swatch Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-12 cursor-pointer rounded border border-gray-300 shadow-sm transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: safeValue }}
          title="Pick a color"
        />

        {/* The Hex Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex h-9 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm uppercase shadow-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      {/* The Popover Picker */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5">
          <HexColorPicker color={safeValue} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
