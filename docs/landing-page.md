Here is the comprehensive documentation for your new Landing Page Builder. You can save this as a `README.md` in your project or add it to your internal developer wiki.

---

# 🏗️ Landing Page Builder: Developer Documentation

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [The Global Theme System](#2-the-global-theme-system)
3. [The Fallback Engine](#3-the-fallback-engine)
4. [How to Extend the Builder](#4-how-to-extend-the-builder)
   - [Adding a New Field to an Existing Block](#adding-a-new-field-to-an-existing-block)
   - [Creating a Completely New Block](#creating-a-completely-new-block)
   - [Adding a New Global Theme Property](#adding-a-new-global-theme-property)
5. [Component Map](#5-component-map)

---

## 1. Architecture Overview

The Landing Page Builder is a "Headless UI" editor built with React and Tailwind CSS. It does not save raw HTML to the database; instead, it saves a lightweight JSON array (`page_schema`) representing the *state* and *order* of the blocks on the page. 

**Key Principles:**
* **Single Source of Truth:** `src/config/blocks.config.ts` dictates everything. It tells the left sidebar what buttons to show, the right sidebar what form fields to generate, and provides the default data for the Canvas.
* **Dynamic Form Generation:** The Inspector (`BuilderInspector.tsx`) does not have hardcoded inputs for "Heading" or "Background Color". It loops through the `blocks.config.ts` and renders inputs dynamically based on the `type` (e.g., `text`, `color`, `image`, `select`).
* **Strict Typing:** All block data is cast as `string`, `number`, or `boolean` before being passed to HTML attributes to satisfy TypeScript and prevent rendering crashes.

---

## 2. The Global Theme System

The Global Theme allows users to change brand colors and fonts across the entire page instantly, without updating individual blocks. 

### How it works under the hood:
1. **The State:** The `LandingPageEditor` holds a `globalTheme` JSON object in React state (e.g., `{ primaryColor: "#FF0000", textColor: "#000000" }`).
2. **The "Umbrella":** The `BuilderCanvas` acts as a giant umbrella wrapping all the blocks. It takes the `globalTheme` state and injects it into its `style` attribute as **CSS Custom Properties (Variables)**.
   ```tsx
   <div style={{ 
     "--theme-primary": globalTheme.primaryColor, 
     "--theme-text": globalTheme.textColor 
   }}>
      {/* Blocks render inside here */}
   </div>
   ```
3. **The Inheritance:** Because of how CSS cascades, any component inside the Canvas can look up and use those variables using Tailwind's arbitrary value syntax: `bg-[var(--theme-primary)]`.

---

## 3. The Fallback Engine

We give users the "magic" of the Global Theme, but also the "power" to explicitly override colors on a per-block basis. This is achieved using the **Fallback Pattern**.

### The Setup:
In `blocks.config.ts`, the default values for colors are explicitly set to empty strings (`""`).

### The Execution:
Inside the component (e.g., `HeroBanner.tsx`), we use the JavaScript logical OR operator (`||`) to check if the user has picked a specific color.

```tsx
// 1. styles.buttonBgColor is what the user picked in the Inspector color picker.
// 2. If it's empty (""), it falls back to the CSS variable.
const buttonBg = (styles.buttonBgColor as string) || "var(--theme-primary)"

// 3. We apply it via inline styles
<button style={{ backgroundColor: buttonBg }}>
```

**Result:** When a block is first added, it inherits the Global Theme automatically. If the user picks a color in the Inspector, it overrides the global theme. If they clear the color picker, it instantly snaps back to the global theme.

---

## 4. How to Extend the Builder

The system is designed to be highly extensible. Here are the common workflows:

### Adding a New Field to an Existing Block
*Scenario: You want to let users control the Border Radius of the Call to Action card.*

**Step 1: Update the Config (`blocks.config.ts`)**
Add the new field to the `styles` array of the block, and add a starting value to `defaultData`.
```typescript
CallToAction: {
  // ...
  fields: {
    styles: [
      // ... existing fields
      { 
        name: "cardRadius", 
        label: "Card Roundness", 
        type: "select", 
        options: [
          { label: "Sharp", value: "rounded-none" },
          { label: "Medium", value: "rounded-xl" },
          { label: "Pill", value: "rounded-3xl" }
        ] 
      }
    ]
  },
  defaultData: {
    styles: {
      // ... existing defaults
      cardRadius: "rounded-3xl" // The default starting value
    }
  }
}
```

**Step 2: Apply it in the Component (`CallToAction.tsx`)**
Extract the variable and inject it into your Tailwind `className`.
```tsx
const radius = styles.cardRadius as string;

<div className={`mx-auto max-w-4xl p-8 shadow-xl ${radius}`} ...>
```
*(The Inspector handles the UI automatically based on Step 1!)*

---

### Creating a Completely New Block
*Scenario: You want to add a "Testimonial" block.*

**Step 1: Create the Component**
Create `src/components/features/landing-pages/blocks/Testimonial.tsx`.
```tsx
import { type PageBlock } from "@/types/builder"

export function Testimonial({ block }: { block: PageBlock }) {
  const quote = (block.content.quote as string) || "Great product!";
  const author = (block.content.author as string) || "John Doe";
  const bgColor = (block.styles.backgroundColor as string) || "var(--theme-primary)";

  return (
    <div style={{ backgroundColor: bgColor }} className="p-12 text-center text-white">
      <p className="text-2xl italic">"{quote}"</p>
      <p className="mt-4 font-bold">- {author}</p>
    </div>
  )
}
```

**Step 2: Register it in the Canvas (`BuilderCanvas.tsx`)**
```tsx
import { Testimonial } from "../blocks/Testimonial"

// Inside renderBlock switch statement:
case "Testimonial": return <Testimonial block={block} />
```

**Step 3: Add to Config (`blocks.config.ts`)**
```typescript
import { MessageSquare } from "lucide-react" // Import an icon

Testimonial: {
  type: "Testimonial", // MUST match the switch case in BuilderCanvas!
  label: "Testimonial",
  icon: MessageSquare,
  variants: [],
  fields: {
    content: [
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "author", label: "Author Name", type: "text" }
    ],
    styles: [
      { name: "backgroundColor", label: "Background Color", type: "color" }
    ]
  },
  defaultData: {
    variant: "default",
    content: { quote: "This platform changed my life.", author: "Jane Smith" },
    styles: { backgroundColor: "" } // Triggers global fallback!
  }
}
```

---

### Adding a New Global Theme Property
*Scenario: You want users to set a global "Secondary/Accent Color".*

**Step 1: Add to State (`LandingPageEditor.tsx`)**
```tsx
const [globalTheme, setGlobalTheme] = useState<Record<string, string>>({
  primaryColor: "#2563eb",
  secondaryColor: "#10b981", // NEW: Green accent
  textColor: "#111827",
  fontFamily: "Inter, sans-serif",
})
```

**Step 2: Inject to Canvas Wrapper (`BuilderCanvas.tsx`)**
```tsx
style={{
  "--theme-primary": globalTheme.primaryColor,
  "--theme-secondary": globalTheme.secondaryColor, // NEW
  "--theme-text": globalTheme.textColor,
  fontFamily: globalTheme.fontFamily,
} as React.CSSProperties}
```

**Step 3: Add UI Control to Inspector (`BuilderInspector.tsx`)**
Inside the `if (!activeBlock)` global settings view:
```tsx
<div className="space-y-1.5">
  <label className="text-xs font-bold uppercase text-gray-500">Accent Color</label>
  {/* Add the exact same color picker UI used for primaryColor, but mapped to globalTheme.secondaryColor */}
</div>
```

---

## 5. Component Breakdown

* **`LandingPageEditor.tsx`**: The conductor. Fetches the initial data, holds the `blocks` and `globalTheme` states, handles the Save API mutation, and contains the Top Navigation Bar (with the Device Toggle).
* **`BuilderNavigator.tsx`**: The left sidebar. Reads `blocks.config.ts` to render the "Add Section" buttons. Maps over the current `blocks` state to render the interactive Layer Tree (drag, delete, hide).
* **`BuilderCanvas.tsx`**: The middle preview pane. Renders the actual blocks. Responsible for injecting Global Theme CSS variables. Handles the `max-w` constraint for the Mobile/Desktop preview toggle.
* **`BuilderInspector.tsx`**: The right sidebar. The most complex file. Acts as a Global Theme editor when nothing is selected. When a block is selected, it dynamically generates form inputs based on that block's config schema. Handles real image uploads via API.