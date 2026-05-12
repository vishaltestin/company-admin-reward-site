import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Cake, Plane, Calendar, Gift } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useNavigate } from "react-router-dom"
import type { CalendarEvent } from "@/hooks/useCalendar"

interface EventModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const navigate = useNavigate()

  if (!event) return null

  const getEventIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Cake className="h-5 w-5" />
      case "joining":
      case "onboarding":
        return <Plane className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-pink-100 text-pink-800 border-pink-300"
      case "joining":
      case "onboarding":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${getEventColor(event.type)} shadow-sm`}
            >
              {getEventIcon(event.type)}
            </div>
            <div>
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {event.type.replace("-", " ")}
              </span>
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Date</div>
              <div className="text-muted-foreground">
                {format(parseISO(event.date), "MMMM do, yyyy")}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onClose()
              const eventTypeName = event.type.replace("-", " ")
              const defaultName = `${event.first_name}'s ${eventTypeName} Gift`

              navigate("/campaign/create", {
                state: {
                  prefill: {
                    name: defaultName,
                    vertical_id: event.vertical_id,
                    event_id: event.event_id || null,
                    custom_event_name: !event.event_id
                      ? event.title
                      : undefined,
                    distribution_type: "online",
                    recipient_ids: [event.user_id],
                  },
                },
              })
            }}
            className="w-full sm:w-auto"
          >
            <Gift className="mr-2 h-4 w-4" />
            Send Gift Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
