import {
  LayoutTemplate,
  PlaySquare,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react"

export type FieldType =
  | "text"
  | "textarea"
  | "image"
  | "color"
  | "select"
  | "boolean"
  | "number"

export interface BlockField {
  name: string 
  label: string 
  type: FieldType 
  placeholder?: string
  options?: { label: string; value: string }[] 
  min?: number 
  max?: number
}

export interface BlockConfig {
  type: string
  label: string 
  icon: LucideIcon 
  variants: { label: string; value: string }[] 

  fields: {
    content: BlockField[] 
    styles: BlockField[]
  }

  defaultData: {
    variant: string
    content: Record<string, string | number | boolean>
    styles: Record<string, string | number | boolean>
  }
}

export const BLOCK_CONFIGS: Record<string, BlockConfig> = {
  HeroBanner: {
    type: "HeroBanner",
    label: "Hero Banner",
    icon: LayoutTemplate,
    variants: [
      { label: "Centered Text", value: "centered" },
      { label: "Split Content", value: "split" },
    ],
    fields: {
      content: [
        {
          name: "heading",
          label: "Main Heading",
          type: "text",
          placeholder: "Welcome {{first_name}}!",
        },
        {
          name: "subtext",
          label: "Subtext",
          type: "textarea",
          placeholder: "Enter description...",
        },
        {
          name: "buttonText",
          label: "Button Text",
          type: "text",
          placeholder: "Claim Now",
        },
        {
          name: "buttonLink",
          label: "Button URL",
          type: "text",
          placeholder: "https://...",
        },
      ],
      styles: [
        { name: "backgroundImage", label: "Background Image", type: "image" },
        { name: "backgroundColor", label: "Background Color", type: "color" },
        {
          name: "textColor",
          label: "Text Color",
          type: "select",
          options: [
            { label: "Dark", value: "text-gray-900" },
            { label: "Light", value: "text-white" },
          ],
        },
        {
          name: "overlayOpacity",
          label: "Image Darken Overlay (%)",
          type: "number",
          min: 0,
          max: 100,
        },
      ],
    },
    defaultData: {
      variant: "centered",
      content: {
        heading: "Claim Your Rewards Today",
        subtext: "We are glad to have you on the team.",
        buttonText: "View Offers",
        buttonLink: "#offers",
      },
      styles: {
        backgroundImage: "",
        backgroundColor: "#f8fafc",
        textColor: "text-gray-900",
        overlayOpacity: 0,
      },
    },
  },

  VideoSection: {
    type: "VideoSection",
    label: "Video Player",
    icon: PlaySquare,
    variants: [
      { label: "Full Width", value: "full" },
      { label: "Contained", value: "contained" },
    ],
    fields: {
      content: [
        {
          name: "videoUrl",
          label: "YouTube/Vimeo URL",
          type: "text",
          placeholder: "https://youtube.com/watch?v=...",
        },
        { name: "caption", label: "Video Caption", type: "text" },
        { name: "autoPlay", label: "Autoplay (Muted)", type: "boolean" },
      ],
      styles: [
        { name: "backgroundColor", label: "Section Background", type: "color" },
        {
          name: "padding",
          label: "Top/Bottom Padding",
          type: "select",
          options: [
            { label: "Small", value: "py-8" },
            { label: "Medium", value: "py-16" },
            { label: "Large", value: "py-24" },
          ],
        },
      ],
    },
    defaultData: {
      variant: "contained",
      content: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        caption: "Watch this tutorial to learn more.",
        autoPlay: false,
      },
      styles: {
        backgroundColor: "#ffffff",
        padding: "py-16",
      },
    },
  },

  CallToAction: {
    type: "CallToAction",
    label: "Call to Action",
    icon: MousePointerClick,
    variants: [
      { label: "Standard Banner", value: "standard" },
      { label: "Card Style", value: "card" },
    ],
    fields: {
      content: [
        { name: "heading", label: "Heading", type: "text" },
        { name: "buttonText", label: "Button Text", type: "text" },
      ],
      styles: [
        {
          name: "theme",
          label: "Color Theme",
          type: "select",
          options: [
            { label: "Primary Brand", value: "primary" },
            { label: "Dark Mode", value: "dark" },
            { label: "Light Bordered", value: "light" },
          ],
        },
      ],
    },
    defaultData: {
      variant: "standard",
      content: {
        heading: "Ready to get started?",
        buttonText: "Join Now",
      },
      styles: {
        theme: "primary",
      },
    },
  },
}

export const AVAILABLE_BLOCKS = Object.values(BLOCK_CONFIGS)
