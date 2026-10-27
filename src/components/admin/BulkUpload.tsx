import { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"

import { api } from "@/lib/axios"
import { VERTICAL_FIELDS } from "@/config/verticalFields"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AxiosError } from "axios"

interface BulkUploadProps {
  verticalSlug: string
  onSuccess: () => void
  onCancel: () => void
}

interface ApiErrorResponse {
  message: string
  errors?: string[]
}

export function BulkUpload({
  verticalSlug,
  onSuccess,
  onCancel,
}: BulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const coreHeaders = ["first_name", "last_name", "email", "mobile"]
    const dynamicFields = VERTICAL_FIELDS[verticalSlug] || []
    const dynamicHeaders = dynamicFields.map((field) => field.name)

    const allHeaders = [...coreHeaders, ...dynamicHeaders]
    const csvContent = allHeaders.join(",") + "\n"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${verticalSlug}_template.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadErrors([])

    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Please upload a valid .csv file")
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      setSelectedFile(file)
    }
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("vertical_slug", verticalSlug)

      const { data } = await api.post("/employees/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      onSuccess()
    },
    onError: (error: AxiosError) => {
      const responseData = error.response?.data as ApiErrorResponse

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        setUploadErrors(responseData.errors)
      } else {
        toast.error(responseData?.message || "Upload failed. Please try again.")
      }
    },
  })

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    uploadMutation.mutate(selectedFile)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8">
        <FileSpreadsheet className="h-10 w-10 text-gray-400" />
        <div className="space-y-1 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload CSV File
          </h3>
          <p className="mx-auto max-w-sm text-sm text-gray-500">
            Download the template, fill in your recipient data, and upload the
            CSV file here. Max 5MB. Enter dates as YYYY-MM-DD or DD/MM/YYYY;
            Excel date serials are also accepted.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={downloadTemplate}
          className="mt-2 bg-white shadow-sm hover:bg-gray-100"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="space-y-2">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 justify-start border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mr-2 h-4 w-4 text-gray-500" />
            {selectedFile ? selectedFile.name : "Browse for a file..."}
          </Button>

          {selectedFile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setSelectedFile(null)
                setUploadErrors([])
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              disabled={uploadMutation.isPending}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {uploadErrors.length > 0 && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Validation Errors Found</AlertTitle>
          <AlertDescription>
            <p className="mb-2 text-xs font-medium">
              The entire upload was rolled back. Please fix these errors and try
              again:
            </p>
            <ul className="list-disc space-y-1 rounded border border-red-100 bg-white p-3 pl-5 font-mono text-xs text-red-600">
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={uploadMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || uploadMutation.isPending}
          className="min-w-30"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Upload Data"
          )}
        </Button>
      </div>
    </div>
  )
}
