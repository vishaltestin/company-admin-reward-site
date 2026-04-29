import { type PageBlock } from "@/types/builder"

interface Props {
  block: PageBlock
}

export function HeroBanner({ block }: Props) {
  const { content, styles, variant } = block

  const bgColor = (styles.backgroundColor as string) || "transparent"
  const headingColor = (styles.headingColor as string) || "var(--theme-text)"
  const subtextColor = (styles.subtextColor as string) || "var(--theme-text)"
  const buttonBg = (styles.buttonBgColor as string) || "var(--theme-primary)"
  const buttonText = (styles.buttonTextColor as string) || "#ffffff"

  if (variant === "split") {
    return (
      <div
        className="relative flex min-h-[400px] flex-col items-center overflow-hidden md:flex-row"
        style={{ backgroundColor: bgColor }}
      >
        <div className="z-10 flex-1 p-12">
          <h1
            className="mb-4 text-4xl font-bold tracking-tight"
            style={{ color: headingColor }}
          >
            {content.heading as string}
          </h1>
          <p
            className="mb-8 text-lg whitespace-pre-wrap opacity-90"
            style={{ color: subtextColor }}
          >
            {content.subtext as string}
          </p>
          {content.buttonText && (
            <a
              href={(content.buttonLink as string) || "#"}
              className="inline-flex h-12 items-center justify-center rounded-md px-8 font-medium shadow transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {content.buttonText as string}
            </a>
          )}
        </div>
        <div
          className="h-full min-h-[400px] flex-1 bg-cover bg-center"
          style={{
            backgroundImage: styles.backgroundImage
              ? `url(${styles.backgroundImage as string})`
              : "none",
          }}
        />
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      style={{
        backgroundColor: bgColor,
        backgroundImage: styles.backgroundImage
          ? `url(${styles.backgroundImage as string})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {(styles.overlayOpacity as number) > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: (styles.overlayOpacity as number) / 100 }}
        />
      )}

      <div className="relative z-10 max-w-3xl">
        <h1
          className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl"
          style={{ color: headingColor }}
        >
          {content.heading as string}
        </h1>
        <p
          className="mb-8 text-lg whitespace-pre-wrap opacity-90"
          style={{ color: subtextColor }}
        >
          {content.subtext as string}
        </p>
        {content.buttonText && (
          <a
            href={(content.buttonLink as string) || "#"}
            className="inline-flex h-12 items-center justify-center rounded-md px-8 font-medium shadow transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            {content.buttonText as string}
          </a>
        )}
      </div>
    </div>
  )
}
