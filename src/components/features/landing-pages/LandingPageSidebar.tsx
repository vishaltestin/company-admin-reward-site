import { useState } from "react"
import { ChevronRight, Folder, LayoutTemplate } from "lucide-react"
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
      <div className="flex w-72 flex-col border-r border-slate-200 bg-slate-50/50 p-6">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-slate-200"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200"></div>
              <div className="h-4 w-full animate-pulse rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900">Landing Pages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select an event to view templates
        </p>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        <div className="space-y-8">
          {verticals?.map((vertical) => (
            <div key={vertical.id}>
              <h3 className="mb-3 px-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                {vertical.name}
              </h3>

              <div className="space-y-1.5">
                {vertical.items.map((item, index) => {
                  // SCENARIO 1: A Folder (Expandable Group)
                  if (item.type === "group") {
                    const isExpanded = expandedGroups[item.title]
                    return (
                      <div key={`group-${index}`} className="mb-4 last:mb-0">
                        <button
                          onClick={() => toggleGroup(item.title)}
                          className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-blue-500/70" />
                            {item.title}
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-1 ml-3 space-y-1 border-l-2 border-slate-100 pl-3">
                            {item.events.map((child) => {
                              const isSelected = selectedEventId === child.id
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => onSelectEvent(child.id)}
                                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                                    isSelected
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <LayoutTemplate
                                      className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-blue-500" : "text-slate-400"}`}
                                    />
                                    <span
                                      className={`truncate ${isSelected ? "font-semibold" : "font-medium"}`}
                                    >
                                      {child.title}
                                    </span>
                                  </div>

                                  {child.variation_count > 0 && (
                                    <span
                                      className={`ml-2 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                        isSelected
                                          ? "bg-blue-200/50 text-blue-700"
                                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                      }`}
                                    >
                                      {child.variation_count}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // SCENARIO 2: A Direct Event (Standalone)
                  const isSelected = selectedEventId === item.id
                  return (
                    <button
                      key={`event-${item.id}`}
                      onClick={() => onSelectEvent(item.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-all ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <LayoutTemplate
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isSelected
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-500"
                          }`}
                        />
                        <span
                          className={`truncate ${isSelected ? "font-semibold" : "font-medium"}`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {item.variation_count > 0 && (
                        <span
                          className={`ml-2 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            isSelected
                              ? "bg-blue-200/50 text-blue-700"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                          }`}
                        >
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
    </div>
  )
}
