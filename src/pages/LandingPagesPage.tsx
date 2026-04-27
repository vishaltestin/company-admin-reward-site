import { useState } from "react"
import { LandingPageSidebar } from "@/components/features/landing-pages/LandingPageSidebar"
import { LandingPageGrid } from "@/components/features/landing-pages/LandingPageGrid"

export default function LandingPagesPage() {
  // This state controls which event folder the user has clicked on in the sidebar
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-white shadow-sm md:-m-6 lg:-m-8">
      {/* Left Navigation */}
      <LandingPageSidebar
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
      />

      {/* Right Content Area (The Grid we built in the previous step) */}
      <LandingPageGrid selectedEventId={selectedEventId} />
    </div>
  )
}
