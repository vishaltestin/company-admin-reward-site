import { TemplateGrid } from "@/components/features/email-templates/TemplateGrid"
import { TemplateSidebar } from "@/components/features/email-templates/TemplateSidebar"
import { useState } from "react"

export default function EmailTemplatesPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-white shadow-sm md:-m-6 lg:-m-8">
      <TemplateSidebar
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
      />
      <TemplateGrid selectedEventId={selectedEventId} />
    </div>
  )
}
