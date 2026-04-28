import { type PageBlock } from "@/types/builder"

export function VideoSection({ block }: { block: PageBlock }) {
  const { content, styles, variant } = block

  return (
    <div
      style={{ backgroundColor: styles.backgroundColor as string }}
      className={styles.padding as string}
    >
      <div
        className={`mx-auto ${variant === "full" ? "w-full px-0" : "max-w-5xl px-6"}`}
      >
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
          {content.videoUrl ? (
            <div className="flex flex-col items-center text-gray-400">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <div className="ml-1 h-0 w-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-white" />
              </div>
              <p className="text-sm font-medium">
                {content.videoUrl as string}
              </p>

              {/* Type guard for boolean */}
              {content.autoPlay === true && (
                <span className="mt-2 text-xs text-gray-500">
                  Autoplay Enabled
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Please provide a video URL</p>
          )}
        </div>
        {content.caption && (
          <p className="mt-4 text-center text-sm text-gray-500 italic">
            {content.caption as string}
          </p>
        )}
      </div>
    </div>
  )
}
