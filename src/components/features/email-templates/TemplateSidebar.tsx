import { useSidebarEventsQuery } from "@/hooks/templates"
import { Folder, Mail } from "lucide-react"

interface SidebarProps {
  selectedEventId: number | null
  onSelectEvent: (id: number) => void
}

export function TemplateSidebar({
  selectedEventId,
  onSelectEvent,
}: SidebarProps) {
  const { data: verticals, isLoading } = useSidebarEventsQuery()

  if (isLoading) {
    return (
      <div className="w-64 animate-pulse border-r bg-gray-50/50 p-6">
        Loading categories...
      </div>
    )
  }

  return (
    <aside className="h-full w-72 overflow-y-auto border-r bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-gray-800">Event Triggers</h2>
        <p className="text-xs text-gray-500">
          Select an event to manage templates
        </p>
      </div>

      <div className="space-y-6 p-4">
        {verticals?.map((vertical) => (
          <div key={vertical.id}>
            <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
              {vertical.name}
            </h3>

            <ul className="space-y-1">
              {vertical.items.map((item, index) => {
                // SCENARIO 1: A Folder (e.g., "Marketing")
                if (item.type === "group") {
                  return (
                    <li key={index} className="mb-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700">
                        <Folder className="h-4 w-4 text-gray-400" />
                        {item.title}
                      </div>
                      <ul className="mt-1 ml-5 space-y-1 border-l border-gray-100">
                        {item.events.map((event) => (
                          <li key={event.id}>
                            <button
                              onClick={() => onSelectEvent(event.id)}
                              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                                selectedEventId === event.id
                                  ? "bg-blue-50 font-medium text-blue-700"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span className="truncate">{event.title}</span>
                              {event.variation_count > 0 && (
                                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                                  {event.variation_count}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                }

                // SCENARIO 2: A Direct Event (e.g., "New Joinee")
                return (
                  <li key={`event-${item.id}`}>
                    <button
                      onClick={() => onSelectEvent(item.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${
                        selectedEventId === item.id
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Mail
                          className={`h-4 w-4 ${selectedEventId === item.id ? "text-blue-500" : "text-gray-400"}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.variation_count > 0 && (
                        <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                          {item.variation_count}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
