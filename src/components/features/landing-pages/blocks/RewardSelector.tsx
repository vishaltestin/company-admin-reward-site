import { type RewardSelectorBlock } from "@/types/builder"
import { Gift } from "lucide-react"

export function RewardSelector({ block }: { block: RewardSelectorBlock }) {
  const { content, styles, variant } = block

  return (
    <div
      className="px-6 py-16 text-center"
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="mb-4 text-3xl font-bold"
          style={{ color: styles.headingColor || "var(--theme-text)" }}
        >
          {content.heading}
        </h2>
        <p className="mb-12 text-gray-500">{content.subtext}</p>

        <div
          className={`grid gap-6 ${variant === "grid" ? "md:grid-cols-3" : "mx-auto max-w-2xl md:grid-cols-1"}`}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl border p-6 opacity-60 shadow-sm"
              style={{ backgroundColor: styles.cardBackgroundColor }}
            >
              <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-gray-100">
                <Gift className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700">
                Sample Gift Option
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Dynamic products will load here on the live page.
              </p>
              <div className="mt-6 w-full rounded-md bg-blue-100 py-2 text-sm font-medium text-blue-400">
                Claim Button
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
