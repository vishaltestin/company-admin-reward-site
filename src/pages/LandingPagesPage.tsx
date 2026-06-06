import { useState } from "react"
import { LandingPageSidebar } from "@/components/features/landing-pages/LandingPageSidebar"
import { LandingPageGrid } from "@/components/features/landing-pages/LandingPageGrid"

export default function LandingPagesPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:-m-6 lg:-m-8">
      <LandingPageSidebar
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
      />

      <LandingPageGrid selectedEventId={selectedEventId} />
    </div>
  )
}
