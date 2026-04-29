import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useLandingPageDetailQuery } from "@/hooks/landing-pages"
import { type PageBlock, type ThemeTokens } from "@/types/builder"
import { BlockRenderer } from "@/components/features/landing-pages/builder/BlockRenderer"

export default function LandingPagePreview() {
  const { id } = useParams<{ id: string }>()
  const { data: template, isLoading } = useLandingPageDetailQuery(id)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="p-8 text-center text-red-500">Template not found.</div>
    )
  }

  const blocks = (template.page_schema || []) as PageBlock[]
  const theme = (template.global_theme_tokens as ThemeTokens) || {
    primaryColor: "#2563eb",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={
        {
          "--theme-primary": theme.primaryColor,
          "--theme-text": theme.textColor,
          fontFamily: theme.fontFamily,
        } as React.CSSProperties
      }
    >
      <div className="sticky top-0 z-50 bg-gray-900 py-2 text-center text-xs font-medium text-white">
        Preview Mode: {template.title}
      </div>

      {blocks.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          This page has no content yet.
        </div>
      ) : (
        blocks.map((block) => {
          if (!block.isVisible) return null
          return <BlockRenderer key={block.id} block={block} />
        })
      )}
    </div>
  )
}
