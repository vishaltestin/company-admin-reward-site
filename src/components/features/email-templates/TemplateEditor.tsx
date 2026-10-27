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
import dynamicVariablesPlugin from "@/lib/grapesjs-dynamic-vars"

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

  // Settings State
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

    if (editorInstance) {
      editorInstance.destroy()
    }

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

    const editor = grapesjs.init({
      container: editorRef.current,
      plugins: [
        newsletterPreset,
        (ed) =>
          dynamicVariablesPlugin(ed, {
            variables: template.available_variables || [],
          }),
      ],
      // REMOVED pluginsOpts ENTIRELY to fix the TS 'any' error!

      storageManager: false,
      height: "100%",
      width: "100%",

      // 3. Image Upload Configuration
      assetManager: {
        upload: `${BACKEND_URL}/api/admin/email-templates/upload-image`,
        uploadName: "files",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(Cookies.get("XSRF-TOKEN") || ""),
        },
      },
    })

    editor.on("asset:upload:start", () =>
      toast.loading("Uploading image...", { id: "gjs-upload" })
    )
    editor.on("asset:upload:response", () => {
      toast.dismiss("gjs-upload")
      toast.success("Image uploaded successfully!")
    })
    editor.on("asset:upload:error", (err) => {
      toast.dismiss("gjs-upload")
      console.error("GrapesJS Upload Error:", err)
      toast.error("Image upload failed. Check file size and format.")
    })

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

    return () => {
      editor.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  // THE REACT FIX: Only populate state when opening the modal!
  const handleOpenSettings = () => {
    if (template) {
      setEditName(template.name)
      setEditSubject(template.subject)
      setEditThumbnail(template.thumbnail_path || "")
    }
    setIsSettingsOpen(true)
  }

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

  const getEditorContentPayload = () => {
    if (!editorInstance) return null

    const htmlBody = editorInstance.runCommand("gjs-get-inlined-html")
    if (typeof htmlBody !== "string") {
      toast.error(
        "Could not prepare the email content for saving. Please try again."
      )
      return null
    }

    const cleanedHtml = htmlBody
      .replace(/<\/?body[^>]*>/g, "")
      .replace(/<\/?html[^>]*>/g, "")

    return {
      html_body: cleanedHtml,
      design_json: editorInstance.getProjectData(),
    }
  }

  const handleSaveSettings = () => {
    if (!template) return

    const editorContent = getEditorContentPayload()
    if (!editorContent) {
      if (!editorInstance) {
        toast.error(
          "The template editor is still loading. Please try again in a moment."
        )
      }
      return
    }

    // Save the editor content and the settings together so a single Save action
    // persists all current edits to this template.
    updateMutation.mutate(
      {
        id: template.id,
        data: {
          ...editorContent,
          name: editName,
          subject: editSubject,
          thumbnail_path: editThumbnail,
        },
      },
      {
        onSuccess: () => setIsSettingsOpen(false),
      }
    )
  }

  const handleSave = () => {
    if (!template) return

    const editorContent = getEditorContentPayload()
    if (!editorContent) {
      if (!editorInstance) {
        toast.error(
          "The template editor is still loading. Please try again in a moment."
        )
      }
      return
    }

    updateMutation.mutate({
      id: template.id,
      data: editorContent,
    })
  }

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

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenSettings}
            disabled={updateMutation.isPending}
            className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
            title="Template Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

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
      </div>

      <div className="relative w-full flex-1">
        <div ref={editorRef} className="absolute inset-0"></div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Template Settings</DialogTitle>
            <DialogDescription>
              Update the name, subject line, and thumbnail cover for this
              template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-gray-900">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Internal Template Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-md border p-2 text-sm"
                placeholder="e.g., Diwali 2026 Promo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject Line</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full rounded-md border p-2 text-sm"
                placeholder="Check out these deals!"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail Image</label>
              <div className="flex items-center gap-4">
                {editThumbnail ? (
                  <div className="h-16 w-24 overflow-hidden rounded border bg-gray-100">
                    <img
                      src={editThumbnail}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed bg-gray-50 text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}

                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={isUploadingThumb}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={isUploadingThumb}
                    className="flex items-center gap-2 rounded border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isUploadingThumb ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Upload Image"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsSettingsOpen(false)}
              disabled={updateMutation.isPending}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={updateMutation.isPending || isUploadingThumb}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving all changes...
                </>
              ) : (
                "Save All Changes"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
