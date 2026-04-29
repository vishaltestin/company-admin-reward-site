import { useEffect } from "react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function useBuilderShortcuts() {
  const { undo, redo, pastBlocks, futureBlocks } = useBuilderStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check if user is actively typing in an input field
      const activeElement = document.activeElement
      const isTyping =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "SELECT" ||
        (activeElement as HTMLElement)?.isContentEditable

      // If they are typing, let the native browser undo/redo handle the text box
      if (isTyping) return

      const isMac = navigator.userAgent.toLowerCase().includes("mac")
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      // 2. Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if (modifierKey && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault() // Stop browser from doing weird things
        if (pastBlocks.length > 0) undo()
      }

      // 3. Redo: Cmd+Shift+Z (Mac) OR Ctrl+Y / Ctrl+Shift+Z (Windows)
      if (
        (modifierKey && e.shiftKey && e.key.toLowerCase() === "z") ||
        (modifierKey && e.key.toLowerCase() === "y" && !isMac)
      ) {
        e.preventDefault()
        if (futureBlocks.length > 0) redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Cleanup listener on unmount
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, pastBlocks.length, futureBlocks.length])
}
