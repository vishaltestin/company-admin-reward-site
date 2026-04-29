import { create } from "zustand"
import { type PageBlock, type ThemeTokens } from "@/types/builder"

interface BuilderState {
  blocks: PageBlock[]
  status: "draft" | "published" | "archived"
  selectedBlockId: string | null
  previewMode: "desktop" | "mobile"
  globalTheme: ThemeTokens

  pastBlocks: PageBlock[][]
  futureBlocks: PageBlock[][]

  initializeBuilder: (
    blocks: PageBlock[],
    status: "draft" | "published" | "archived",
    theme: ThemeTokens
  ) => void
  setBlocks: (blocks: PageBlock[]) => void
  setStatus: (status: "draft" | "published" | "archived") => void
  setSelectedBlockId: (id: string | null) => void
  setPreviewMode: (mode: "desktop" | "mobile") => void
  setGlobalTheme: (theme: ThemeTokens) => void

  addBlock: (block: PageBlock) => void
  updateBlock: (id: string, updatedBlock: PageBlock) => void
  deleteBlock: (id: string) => void
  moveBlock: (index: number, direction: "up" | "down") => void
  toggleBlockVisibility: (id: string) => void

  undo: () => void
  redo: () => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  blocks: [],
  status: "draft",
  selectedBlockId: null,
  previewMode: "desktop",
  globalTheme: {
    primaryColor: "#2563eb",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
  },

  pastBlocks: [],
  futureBlocks: [],

  initializeBuilder: (blocks, status, theme) =>
    set({
      blocks,
      status,
      globalTheme: theme,
      pastBlocks: [],
      futureBlocks: [],
    }),

  setBlocks: (blocks) =>
    set((state) => ({
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: [],
      blocks,
    })),

  setStatus: (status) => set({ status }),
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setGlobalTheme: (globalTheme) => set({ globalTheme }),

  addBlock: (block) =>
    set((state) => ({
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: [],
      blocks: [...state.blocks, block],
      selectedBlockId: block.id,
    })),

  updateBlock: (id, updatedBlock) =>
    set((state) => ({
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: [],
      blocks: state.blocks.map((b) => (b.id === id ? updatedBlock : b)),
    })),

  deleteBlock: (id) =>
    set((state) => ({
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: [],
      blocks: state.blocks.filter((b) => b.id !== id),
      selectedBlockId:
        state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

  moveBlock: (index, direction) =>
    set((state) => {
      const newBlocks = [...state.blocks]
      if (direction === "up" && index > 0) {
        ;[newBlocks[index - 1], newBlocks[index]] = [
          newBlocks[index],
          newBlocks[index - 1],
        ]
      } else if (direction === "down" && index < newBlocks.length - 1) {
        ;[newBlocks[index + 1], newBlocks[index]] = [
          newBlocks[index],
          newBlocks[index + 1],
        ]
      }
      return {
        pastBlocks: [...state.pastBlocks, state.blocks],
        futureBlocks: [],
        blocks: newBlocks,
      }
    }),

  toggleBlockVisibility: (id) =>
    set((state) => ({
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: [],
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, isVisible: !b.isVisible } : b
      ),
    })),

  undo: () =>
    set((state) => {
      if (state.pastBlocks.length === 0) return state

      const previous = state.pastBlocks[state.pastBlocks.length - 1]
      const newPast = state.pastBlocks.slice(0, state.pastBlocks.length - 1)

      return {
        pastBlocks: newPast,
        futureBlocks: [state.blocks, ...state.futureBlocks],
        blocks: previous,
        selectedBlockId: null, 
      }
    }),

  redo: () =>
    set((state) => {
      if (state.futureBlocks.length === 0) return state

      const next = state.futureBlocks[0]
      const newFuture = state.futureBlocks.slice(1)

      return {
        pastBlocks: [...state.pastBlocks, state.blocks],
        futureBlocks: newFuture,
        blocks: next,
        selectedBlockId: null,
      }
    }),
}))
