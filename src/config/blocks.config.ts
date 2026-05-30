import {
  LayoutTemplate,
  PlaySquare,
  MousePointerClick,
  Gift,
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
          placeholder: "Welcome!",
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
        {
          name: "overlayOpacity",
          label: "Image Darken Overlay (%)",
          type: "number",
          min: 0,
          max: 100,
        },
        { name: "backgroundColor", label: "Background Color", type: "color" },
        { name: "headingColor", label: "Heading Color", type: "color" },
        { name: "subtextColor", label: "Subtext Color", type: "color" },
        { name: "buttonBgColor", label: "Button Background", type: "color" },
        { name: "buttonTextColor", label: "Button Text Color", type: "color" },
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
        overlayOpacity: 0,
        backgroundColor: "", // Empty triggers fallback
        headingColor: "", // Empty triggers fallback
        subtextColor: "", // Empty triggers fallback
        buttonBgColor: "", // Empty triggers fallback
        buttonTextColor: "", // Empty triggers fallback
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
        { name: "playButtonColor", label: "Play Button Color", type: "color" },
        { name: "captionColor", label: "Caption Text Color", type: "color" },
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
        padding: "py-16",
        backgroundColor: "",
        playButtonColor: "",
        captionColor: "",
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
        {
          name: "buttonLink",
          label: "Button URL",
          type: "text",
          placeholder: "https://...",
        },
      ],
      styles: [
        { name: "backgroundColor", label: "Background Color", type: "color" },
        { name: "headingColor", label: "Heading Color", type: "color" },
        { name: "buttonBgColor", label: "Button Background", type: "color" },
        { name: "buttonTextColor", label: "Button Text Color", type: "color" },
      ],
    },
    defaultData: {
      variant: "standard",
      content: {
        heading: "Ready to get started?",
        buttonText: "Join Now",
      },
      styles: {
        backgroundColor: "",
        headingColor: "",
        buttonBgColor: "",
        buttonTextColor: "",
      },
    },
  },

  GiftSelector: {
    type: "RewardSelector",
    label: "Gift Selector",
    icon: Gift,
    variants: [
      { label: "3-Column Grid", value: "grid" },
      { label: "Vertical List", value: "list" },
    ],
    fields: {
      content: [
        {
          name: "heading",
          label: "Section Heading",
          type: "text",
          placeholder: "Choose your gift",
        },
        { name: "subtext", label: "Subtext", type: "textarea" },
      ],
      styles: [
        { name: "backgroundColor", label: "Background Color", type: "color" },
        { name: "headingColor", label: "Heading Color", type: "color" },
        {
          name: "cardBackgroundColor",
          label: "Card Background",
          type: "color",
        },
      ],
    },
    defaultData: {
      variant: "grid",
      content: {
        heading: "Choose Your Reward",
        subtext: "Select one of the curated gifts below.",
      },
      styles: {
        backgroundColor: "transparent",
        headingColor: "",
        cardBackgroundColor: "#ffffff",
      },
    },
  },
}

export const AVAILABLE_BLOCKS = Object.values(BLOCK_CONFIGS)
