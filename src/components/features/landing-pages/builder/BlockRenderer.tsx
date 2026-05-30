import { type PageBlock } from "@/types/builder"
import { HeroBanner } from "../blocks/HeroBanner"
import { VideoSection } from "../blocks/VideoSection"
import { CallToAction } from "../blocks/CallToAction"
import { RewardSelector } from "../blocks/RewardSelector"

interface Props {
  block: PageBlock
}

export function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case "HeroBanner":
      return <HeroBanner block={block} />
    case "VideoSection":
      return <VideoSection block={block} />
    case "CallToAction":
      return <CallToAction block={block} />
    case "RewardSelector":
      return <RewardSelector block={block} />
    default:
      return (
        <div className="bg-red-50 p-8 text-center text-red-500">
          {/* @ts-expect-error - exhaustive fallback for undefined future block types */}
          Unknown Block Type: {block?.type}
        </div>
      )
  }
}
