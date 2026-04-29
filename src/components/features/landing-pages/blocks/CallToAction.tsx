import { type PageBlock } from "@/types/builder"

interface Props {
  block: PageBlock
}

export function CallToAction({ block }: Props) {
  const { content, styles, variant } = block

  // --- FALLBACK LOGIC ---
  const bgColor = (styles.backgroundColor as string) || "var(--theme-primary)"
  const headingColor = (styles.headingColor as string) || "#ffffff"
  const buttonBg = (styles.buttonBgColor as string) || "#ffffff"
  const buttonText =
    (styles.buttonTextColor as string) || "var(--theme-primary)"

  if (variant === "card") {
    return (
      <div className="px-6 py-16 sm:py-24">
        <div
          className="mx-auto max-w-4xl rounded-3xl p-8 text-center shadow-xl sm:p-16"
          style={{ backgroundColor: bgColor }}
        >
          <h2
            className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: headingColor }}
          >
            {content.heading as string}
          </h2>
          {content.buttonText && (
            <a
              href="#"
              className="inline-flex h-12 items-center justify-center rounded-md px-8 font-semibold shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {content.buttonText as string}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="px-6 py-16 text-center sm:py-24"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-4xl">
        <h2
          className="mb-8 text-3xl font-extrabold tracking-tight sm:text-5xl"
          style={{ color: headingColor }}
        >
          {content.heading as string}
        </h2>
        {content.buttonText && (
          <a
            href="#"
            className="inline-flex h-14 items-center justify-center rounded-md px-10 text-lg font-bold shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            {content.buttonText as string}
          </a>
        )}
      </div>
    </div>
  )
}
