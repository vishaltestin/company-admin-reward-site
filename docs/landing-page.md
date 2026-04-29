
---

# 🏗️ Landing Page Builder - Technical Documentation

## 📑 Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [State Management Engine](#2-state-management-engine)
3. [Type System (Strict Safety)](#3-type-system-strict-safety)
4. [Component Flow & Lifecycle](#4-component-flow--lifecycle)
5. [Global Theme & Styling](#5-global-theme--styling)
6. [Security & Backend Integration](#6-security--backend-integration)
7. [Developer Guide: How to Add a New Block](#7-developer-guide-how-to-add-a-new-block)

---

## 1. System Overview & Architecture

The Landing Page Builder is a highly modular, configuration-driven React application. It allows administrators to construct visually complex landing pages using a "block-based" architecture (similar to Webflow or Framer). 

**Key Architectural Pillars:**
* **Zero Prop-Drilling:** All builder state is centralized in Zustand.
* **Discriminated Union Types:** 100% Type-safe block schemas with zero `any` or forced type assertions.
* **Configuration-Driven UI:** The inspector forms are generated dynamically based on `blocks.config.ts`.
* **Single Source of Truth Rendering:** Both the Editor Canvas and the Public Preview utilize the exact same `<BlockRenderer />`.

---

## 2. State Management Engine

The builder is powered by `useBuilderStore` (Zustand), located in `src/store/useBuilderStore.ts`. It acts as the single source of truth for the active editing session.

**Core State Variables:**
* `blocks` (`PageBlock[]`): The active array of blocks currently on the canvas.
* `selectedBlockId` (`string | null`): The ID of the block currently being edited. Dictates what the Inspector shows.
* `globalTheme` (`ThemeTokens`): Brand colors, text colors, and font families.
* `pastBlocks` & `futureBlocks`: State arrays used for the Time-Travel (Undo/Redo) system.

**Key Actions:**
* `initializeBuilder()`: Called once on mount to sync backend data to the store.
* `updateBlock()`: Deep-merges changes to a specific block without mutating the array.
* `undo()` / `redo()`: Manipulates the history arrays. Tied to the `useBuilderShortcuts` hook for `Ctrl+Z` / `Cmd+Z` support.

---

## 3. Type System (Strict Safety)

Located in `src/types/builder.ts`, the type system uses a **Discriminated Union** to guarantee that the UI and the data stay perfectly in sync.

Every block shares a `BaseBlock` interface (`id`, `isVisible`), but defines its own strict `type`, `variant`, `content`, and `styles`.

```typescript
// Example: The Discriminated Union
export type PageBlock = HeroBannerBlock | VideoSectionBlock | CallToActionBlock;
```
*Why this matters:* When a component checks `if (block.type === 'HeroBanner')`, TypeScript automatically knows that `block.content` possesses a `heading` string, eliminating the need for unsafe `as string` casting.

---

## 4. Component Flow & Lifecycle

The UI is divided into four main architectural pillars inside `LandingPageEditor.tsx`.

### A. The Wrapper (`LandingPageEditorCore`)
* Fetches the JSON schema via React Query.
* Initializes the Zustand store via `useEffect`.
* Binds global keyboard shortcuts via `useBuilderShortcuts()`.
* Handles the "Save Changes" API mutation.

### B. Builder Navigator (`BuilderNavigator.tsx`)
* **Role:** Layer management.
* **Responsibilities:** Adding new blocks (via `AVAILABLE_BLOCKS` config), moving blocks up/down, toggling visibility (eye icon), and deleting blocks.

### C. Builder Canvas (`BuilderCanvas.tsx` & `BlockRenderer.tsx`)
* **Role:** Visual representation.
* **Responsibilities:** Maps through the `blocks` array from Zustand.
* Uses `<BlockRenderer />` to route the data to the correct React component (e.g., `<HeroBanner />`). 
* Listens for clicks to set the `selectedBlockId`.

### D. Builder Inspector (`BuilderInspector.tsx`)
* **Role:** Data manipulation.
* **Responsibilities:** Splits into two views depending on `selectedBlockId`:
    1.  **Global Settings Panel:** Manages the `globalTheme` (Brand Colors, Fonts) using `<ColorPickerInput />`.
    2.  **Block Settings Panel:** Reads `BLOCK_CONFIGS` to dynamically generate text inputs, textareas, `<ColorPickerInput />` modules, and image upload handlers.
* **Dynamic Tags:** Handles the injection of `availableVariables` (e.g., `{{ user_name }}`) into text fields.

---

## 5. Global Theme & Styling

The builder uses **CSS Variables** mapped directly to inline `style` tags on the wrapper component (in both the Canvas and the Public Preview).

```tsx
style={{
  "--theme-primary": theme.primaryColor,
  "--theme-text": theme.textColor,
  fontFamily: theme.fontFamily,
}}
```
Individual blocks reference these CSS variables as their fallbacks. For example, if a Call to Action block doesn't have a specific background color set, it will default to `var(--theme-primary)`.

---

## 6. Security & Backend Integration

### XSS Security (`sanitizeUrl`)
All blocks that accept external links (Buttons, Hero links) pipe the user input through `sanitizeUrl()`. This strips malicious protocols like `javascript:alert(1)` and ensures only safe links (`http`, `https`, `mailto`, `tel`) are rendered.

### Orphan Image Garbage Collection
When users upload images to the builder but never save, or delete a block later, images become "orphaned".
* **The Solution:** The Laravel Artisan Command `CleanOrphanLandingPageImages`.
* **How it works:** It scans the `landing-page-assets` storage directory, checks files older than 24 hours against the active JSON `page_schema` column in the database using Regex, and deletes unused files.

---

## 7. Developer Guide: How to Add a New Block

Adding a new block (e.g., a "Testimonial" block) requires exactly 4 steps.

### Step 1: Define the Type (`src/types/builder.ts`)
Create the specific interface for your block and add it to the union.

```typescript
export interface TestimonialBlock extends BaseBlock {
  type: "Testimonial"
  variant: "standard" | "grid"
  content: { quote: string; author: string; company?: string }
  styles: { backgroundColor: string; textColor: string }
}

// Update the union:
export type PageBlock = HeroBannerBlock | VideoSectionBlock | CallToActionBlock | TestimonialBlock;
```

### Step 2: Define the Configuration (`src/config/blocks.config.ts`)
Add your block to `BLOCK_CONFIGS` so the Inspector knows how to build the form.

```typescript
  Testimonial: {
    type: "Testimonial",
    label: "Testimonial",
    icon: MessageSquare, // from lucide-react
    variants: [
      { label: "Standard", value: "standard" },
    ],
    fields: {
      content: [
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "author", label: "Author Name", type: "text" },
      ],
      styles: [
        { name: "backgroundColor", label: "Background", type: "color" },
      ],
    },
    defaultData: {
      variant: "standard",
      content: { quote: "This platform is amazing!", author: "John Doe" },
      styles: { backgroundColor: "" },
    },
  },
```

### Step 3: Build the UI Component (`src/components/features/landing-pages/blocks/Testimonial.tsx`)
Create the actual React component. It receives the strictly typed block as a prop.

```tsx
import { type TestimonialBlock } from "@/types/builder"

export function Testimonial({ block }: { block: TestimonialBlock }) {
  const { content, styles } = block
  const bgColor = styles.backgroundColor || "transparent"

  return (
    <div style={{ backgroundColor: bgColor }} className="py-12 text-center">
      <blockquote className="text-xl italic">"{content.quote}"</blockquote>
      <p className="mt-4 font-bold">- {content.author}</p>
    </div>
  )
}
```

### Step 4: Register it in the Renderer (`src/components/features/landing-pages/builder/BlockRenderer.tsx`)
Add it to the switch statement so the Canvas and Preview pages know how to render it.

```tsx
import { Testimonial } from "../blocks/Testimonial"

export function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case "Testimonial":
      return <Testimonial block={block} />
    // ... existing cases
```

**Done!** Your new block will automatically appear in the Navigator sidebar, generate its own form in the Inspector, support Undo/Redo, and render flawlessly on the public page.