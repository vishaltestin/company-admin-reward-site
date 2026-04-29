import { type PageBlock } from "@/types/builder"

interface Props {
  block: PageBlock
}

export function CallToAction({ block }: Props) {
  const { content, styles, variant } = block

  const getThemeClasses = () => {
    switch (styles.theme) {
      case "dark":
        return "bg-gray-900 text-white border-transparent"
      case "light":
        return "bg-white text-gray-900 border border-gray-200"
      case "primary":
      default:
        return "bg-blue-600 text-white border-transparent"
    }
  }

  const getButtonClasses = () => {
    switch (styles.theme) {
      case "light":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "dark":
      case "primary":
      default:
        return "bg-white text-gray-900 hover:bg-gray-50"
    }
  }

  const themeClasses = getThemeClasses()
  const buttonClasses = getButtonClasses()

  // --- VARIANT 1: CARD LAYOUT ---
  if (variant === "card") {
    return (
      <div className="px-6 py-16 sm:py-24">
        <div
          className={`mx-auto max-w-4xl rounded-3xl p-8 text-center shadow-xl sm:p-16 ${themeClasses}`}
        >
          <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
            {content.heading as string}
          </h2>
          {content.buttonText && (
            <a
              href="#" // You can add a buttonLink field later if you want!
              className={`inline-flex h-12 items-center justify-center rounded-md px-8 font-semibold shadow-sm transition-colors ${buttonClasses}`}
            >
              {content.buttonText as string}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`px-6 py-16 text-center sm:py-24 ${themeClasses}`}>
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {content.heading as string}
        </h2>
        {content.buttonText && (
          <a
            href="#"
            className={`inline-flex h-14 items-center justify-center rounded-md px-10 text-lg font-bold shadow-sm transition-colors ${buttonClasses}`}
          >
            {content.buttonText as string}
          </a>
        )}
      </div>
    </div>
  )
}
