import { type PageBlock } from "@/types/builder"

interface Props {
  block: PageBlock
}

export function HeroBanner({ block }: Props) {
  const { content, styles, variant } = block

  if (variant === "split") {
    return (
      <div
        className="relative flex min-h-[400px] flex-col items-center overflow-hidden md:flex-row"
        style={{ backgroundColor: styles.backgroundColor as string }}
      >
        <div className={`z-10 flex-1 p-12 ${styles.textColor as string}`}>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {content.heading as string}
          </h1>
          <p className="mb-8 text-lg whitespace-pre-wrap opacity-90">
            {content.subtext as string}
          </p>
          {content.buttonText && (
            <a
              href={(content.buttonLink as string) || "#"}
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 font-medium text-white shadow transition-colors hover:bg-blue-700"
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
        backgroundColor: styles.backgroundColor as string,
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

      <div className={`relative z-10 max-w-3xl ${styles.textColor as string}`}>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {content.heading as string}
        </h1>
        <p className="mb-8 text-lg whitespace-pre-wrap opacity-90">
          {content.subtext as string}
        </p>
        {content.buttonText && (
          <a
            href={(content.buttonLink as string) || "#"}
            className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 font-medium text-white shadow transition-colors hover:bg-blue-700"
          >
            {content.buttonText as string}
          </a>
        )}
      </div>
    </div>
  )
}
