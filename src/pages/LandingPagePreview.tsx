import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useLandingPageDetailQuery } from "@/hooks/landing-pages"
import { type PageBlock } from "@/types/builder"

import { HeroBanner } from "@/components/features/landing-pages/blocks/HeroBanner"
import { VideoSection } from "@/components/features/landing-pages/blocks/VideoSection"

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

  const blocks: PageBlock[] = template.page_schema || []

  const renderBlock = (block: PageBlock) => {
    switch (block.type) {
      case "HeroBanner":
        return <HeroBanner block={block} />
      case "VideoSection":
        return <VideoSection block={block} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
          return <div key={block.id}>{renderBlock(block)}</div>
        })
      )}
    </div>
  )
}
