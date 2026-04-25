import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTemplateQuery } from "@/hooks/templates"

interface PreviewModalProps {
  id: string | null
  onClose: () => void
}

export function TemplatePreviewModal({ id, onClose }: PreviewModalProps) {
  const { data: template, isLoading } = useTemplateQuery(id || undefined)

  const isOpen = !!id

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[85vh] w-full max-w-6xl min-w-5xl flex-col overflow-hidden border-none bg-gray-100 p-0">
        <DialogHeader className="shrink-0 border-b bg-white px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {template?.name || "Loading Preview..."}
          </DialogTitle>
          <DialogDescription className="mt-1 font-mono text-sm text-gray-500">
            Subject: {template?.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-500" />
              <p>Loading template design...</p>
            </div>
          ) : template?.html_body ? (
            <div className="flex h-full w-full max-w-[600px] flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-md">
              <iframe
                srcDoc={template.html_body}
                title="Email Preview"
                className="w-full flex-1 border-none bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <p>No design has been created for this template yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
