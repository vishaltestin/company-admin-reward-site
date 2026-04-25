import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import grapesjs from "grapesjs"
import type { Editor } from "grapesjs"
import "grapesjs/dist/css/grapes.min.css"
import newsletterPreset from "grapesjs-preset-newsletter"
import { useTemplateQuery, useTemplateMutations } from "@/hooks/templates"
import {
  ArrowLeft,
  Save,
  Loader2,
  Settings,
  Image as ImageIcon,
} from "lucide-react"
import Cookies from "js-cookie"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { api } from "@/lib/axios"

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSubject, setEditSubject] = useState("")
  const [editThumbnail, setEditThumbnail] = useState("")
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)

  // 1. Fetch template data and mutations
  const { data: template, isLoading: isFetching } = useTemplateQuery(id)
  const { updateMutation } = useTemplateMutations()

  // 2. Initialize GrapesJS
  useEffect(() => {
    if (!editorRef.current || !template) return

    // Clean up previous instance to prevent memory leaks in React strict mode
    if (editorInstance) {
      editorInstance.destroy()
    }

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

    const editor = grapesjs.init({
      container: editorRef.current,
      plugins: [newsletterPreset],
      pluginsOpts: {
        [newsletterPreset as any]: {
          // Custom preset options can go here
        },
      },
      storageManager: false, // We use TanStack Query for manual saving
      height: "100%",
      width: "100%",
      //   dragMode: "absolute",

      // 3. Image Upload Configuration
      assetManager: {
        upload: `${BACKEND_URL}/api/admin/email-templates/upload-image`,
        uploadName: "files",
        // Laravel Sanctum requires the CSRF token and credentials for API requests
        credentials: "include", // Use omit if CORS is tricky, but 'include' if cookies are needed
        headers: {
          Accept: "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(Cookies.get("XSRF-TOKEN") || ""),
        },
      },
    })

    // // 4. Load the existing design
    // // If we have the exact JSON project state, load that for a perfect recreation
    // if (template.design_json && Object.keys(template.design_json).length > 0) {
    //   editor.loadProjectData(template.design_json)
    // }
    // // Fallback: If it's a new master template and only has raw HTML, load that
    // else if (template.html_body) {
    //   editor.setComponents(template.html_body)
    // }

    try {
      const projectData =
        typeof template.design_json === "string"
          ? JSON.parse(template.design_json)
          : template.design_json

      const isValidJson =
        projectData &&
        typeof projectData === "object" &&
        !Array.isArray(projectData) &&
        Object.keys(projectData).length > 0

      if (isValidJson) {
        editor.loadProjectData(projectData)
      } else if (template.html_body) {
        editor.setComponents(template.html_body)
      }
    } catch (error) {
      console.warn(
        "GrapesJS failed to load project JSON. Falling back to HTML.",
        error
      )
      if (template.html_body) {
        editor.setComponents(template.html_body)
      }
    }

    setEditorInstance(editor)

    // Cleanup on unmount
    return () => {
      editor.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  useEffect(() => {
    if (template) {
      setEditName(template.name)
      setEditSubject(template.subject)
      setEditThumbnail(template.thumbnail_path || "")
    }
  }, [template])

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingThumb(true)
    const formData = new FormData()
    formData.append("files[]", file)

    try {
      const { data } = await api.post(
        "/email-templates/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      setEditThumbnail(data.data[0])
      toast.success("Thumbnail uploaded!")
    } catch (error) {
      console.log(error)
      toast.error("Failed to upload thumbnail.")
    } finally {
      setIsUploadingThumb(false)
    }
  }

  const handleSaveSettings = () => {
    if (!template) return
    updateMutation.mutate({
      id: template.id,
      data: {
        name: editName,
        subject: editSubject,
        thumbnail_path: editThumbnail,
      },
    })
    setIsSettingsOpen(false)
  }

  // 5. Handle the Save Action
  const handleSave = () => {
    if (!editorInstance || !template) return

    // Core Magic: This command injects all CSS directly into the HTML tags
    // (e.g., <div style="color: red;">) which is mandatory for email clients.
    const htmlBody = editorInstance.runCommand("gjs-get-inlined-html")
    const cleanedHtml = htmlBody
      .replace(/<\/?body[^>]*>/g, "")
      .replace(/<\/?html[^>]*>/g, "")

    // Grab the full JSON state so the builder looks exactly the same next time
    const designJson = editorInstance.getProjectData()

    updateMutation.mutate({
      id: template.id,
      data: {
        html_body: cleanedHtml,
        design_json: designJson,
      },
    })
  }

  // Loading Screen
  if (isFetching) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-700">
          Setting up the canvas...
        </h2>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <div className="z-50 flex h-14 flex-shrink-0 items-center justify-between bg-gray-900 px-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md p-2 transition-colors hover:bg-gray-700"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold">
              {template?.name || "Editing Template"}
            </h1>
            <p className="max-w-md truncate text-xs text-gray-400">
              Subject: {template?.subject}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updateMutation.isPending ? "Saving changes..." : "Save Template"}
        </button>
      </div>

      {/* The GrapesJS Canvas Area */}
      <div className="relative w-full flex-1">
        <div ref={editorRef} className="absolute inset-0"></div>
      </div>
    </div>
  )
}
