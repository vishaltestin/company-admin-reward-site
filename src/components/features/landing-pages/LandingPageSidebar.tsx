import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  LayoutTemplate,
  Loader2,
} from "lucide-react"
import { useLandingPageSidebarQuery } from "@/hooks/landing-pages"

interface SidebarProps {
  selectedEventId: number | null
  onSelectEvent: (id: number) => void
}

export function LandingPageSidebar({
  selectedEventId,
  onSelectEvent,
}: SidebarProps) {
  const { data: verticals, isLoading } = useLandingPageSidebarQuery()

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  )

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex w-72 flex-col items-center justify-center border-r bg-white py-10">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="flex w-72 flex-col border-r bg-white">
      <div className="border-b p-4">
        <h2 className="font-semibold text-gray-800">Landing Pages</h2>
        <p className="text-xs text-gray-500">
          Select an event to view templates
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {verticals?.map((vertical) => (
          <div key={vertical.id} className="mb-6">
            <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              {vertical.name}
            </h3>

            <div className="space-y-1">
              {vertical.items.map((item, index) => {
                if (item.type === "group") {
                  const isExpanded = expandedGroups[item.title]
                  return (
                    <div key={`group-${index}`}>
                      <button
                        onClick={() => toggleGroup(item.title)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          {item.title}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 border-l pl-2">
                          {item.events.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onSelectEvent(child.id)}
                              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                                selectedEventId === child.id
                                  ? "bg-blue-50 font-medium text-blue-700"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <LayoutTemplate className="h-3.5 w-3.5" />
                                {child.title}
                              </div>
                              {child.variation_count > 0 && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                  {child.variation_count}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <button
                    key={`event-${item.id}`}
                    onClick={() => onSelectEvent(item.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${
                      selectedEventId === item.id
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutTemplate
                        className={`h-4 w-4 ${selectedEventId === item.id ? "text-blue-600" : "text-gray-400"}`}
                      />
                      {item.title}
                    </div>
                    {item.variation_count > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {item.variation_count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
