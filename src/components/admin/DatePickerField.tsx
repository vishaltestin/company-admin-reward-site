import { useMemo, useState } from "react"
import { format, isValid, parse, parseISO } from "date-fns"
import { CalendarDays, X } from "lucide-react"
import { Popover } from "radix-ui"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerFieldProps {
  id: string
  value?: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

function parseFieldDate(value?: string | null): Date | undefined {
  if (!value) return undefined

  // API dates are stored as YYYY-MM-DD. Slicing timestamps avoids timezone
  // shifts when displaying a date-only value.
  const isoDate = value.slice(0, 10)
  const isoParsed = parseISO(isoDate)

  if (isValid(isoParsed)) return isoParsed

  // Also display dates imported before the CSV normalization fix.
  for (const pattern of [
    "d/M/yyyy",
    "d-M-yyyy",
    "d.M.yyyy",
    "d/M/yy",
    "d-M-yy",
  ]) {
    const parsed = parse(value, pattern, new Date())
    if (isValid(parsed)) return parsed
  }

  return undefined
}

export function DatePickerField({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
}: DatePickerFieldProps) {
  const selectedDate = useMemo(() => parseFieldDate(value), [value])
  const [isOpen, setIsOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const startMonth = new Date(currentYear - 120, 0, 1)
  const endMonth = new Date(currentYear + 20, 11, 1)

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("")
      return
    }

    onChange(format(date, "yyyy-MM-dd"))
    setIsOpen(false)
    onBlur?.()
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onBlur={onBlur}
          className={cn(
            "w-full justify-start gap-2 text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select date"}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={8}
          className="z-[70] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            weekStartsOn={1}
            showOutsideDays
            className="mx-auto"
          />

          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(new Date())}
            >
              Today
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!selectedDate}
              onClick={() => handleSelect(undefined)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
