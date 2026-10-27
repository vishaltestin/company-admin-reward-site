import { z } from "zod"

export const step0Schema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  description: z.string().optional(),
})
export type Step0Data = z.infer<typeof step0Schema>

export const step1Schema = z.object({
  vertical_id: z.number({ error: "Please select a target vertical" }),
})
export type Step1Data = z.infer<typeof step1Schema>

export const step2Schema = z
  .object({
    event_id: z.number().nullable().optional(),
    custom_event_name: z.string().optional(),
  })
  .refine((data) => data.event_id || data.custom_event_name, {
    message: "Please select an event or provide a custom event name",
    path: ["event_id"],
  })
export type Step2Data = z.infer<typeof step2Schema>

export const step3Schema = z.object({
  distribution_type: z.enum(["online", "bulk"], {
    error: "Please select a distribution method",
  }),
})
export type Step3Data = z.infer<typeof step3Schema>

export const step4OnlineSchema = z.object({
  recipient_ids: z
    .array(z.number())
    .min(1, "Please select at least one recipient to receive the campaign."),
})
export type Step4OnlineData = z.infer<typeof step4OnlineSchema>

export const step5OnlineSchema = z.object({
  reward_type: z.enum(["points", "code", "link"], {
    error: "Please select a reward mechanism.",
  }),
  reward_value_per_user: z
    .number({
      error: "Please enter a value.",
    })
    .min(1, "Value must be at least ₹1."),
})
export type Step5OnlineData = z.infer<typeof step5OnlineSchema>

export const step6OnlineSchema = z
  .object({
    use_custom_catalog: z.boolean(),
    catalog_selection: z.array(z.number()),
  })
  .superRefine((data, ctx) => {
    if (data.use_custom_catalog && data.catalog_selection.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one product for your custom catalog.",
        path: ["catalog_selection"],
      })
    }
  })

export type Step6OnlineData = z.infer<typeof step6OnlineSchema>

export const step8OnlineSchema = z.object({
  // Optional by design: the wizard offers "Skip for now", and the
  // reward-link filter can drop a previously picked template. A campaign is
  // valid without a landing page — employees then get the standard claim
  // page (ClaimController's default schema). The Continue button stays
  // disabled until a template is picked, so "required" is enforced in the
  // UI, not here.
  landing_page_template_id: z.number().optional(),
})
export type Step8OnlineData = z.infer<typeof step8OnlineSchema>

export const step9OnlineSchema = z.object({
  email_template_id: z.number({
    error: "Please select an email template.",
  }),
})
export type Step9OnlineData = z.infer<typeof step9OnlineSchema>

export const step10OnlineSchema = z.object({
  sms_content: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(160, "Keep SMS under 160 characters."),
  sms_cta: z
    .string()
    .min(2, "Button text is required.")
    .max(20, "Button text is too long."),
})
export type Step10OnlineData = z.infer<typeof step10OnlineSchema>

export const step11OnlineSchema = z
  .object({
    starts_at: z.string().min(1, "Start date is required."),
    expires_at: z.string().optional(),

    send_initial_reminder: z.boolean(),
    reminder_initial_date: z.string().optional(),
    reminder_initial_template_id: z.number().optional(),

    send_expiry_reminder: z.boolean(),
    reminder_expiry_date: z.string().optional(),
    reminder_expiry_template_id: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const today = new Date()
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-")
    const launchDate = data.starts_at.slice(0, 10)
    const expiryDate = data.expires_at?.slice(0, 10)

    if (data.expires_at && data.expires_at <= data.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiration must be after the launch date.",
        path: ["expires_at"],
      })
    }

    if (data.send_initial_reminder) {
      if (!data.reminder_initial_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please set a reminder date.",
          path: ["reminder_initial_date"],
        })
      } else {
        if (data.reminder_initial_date <= launchDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The follow-up date must be after the launch date.",
            path: ["reminder_initial_date"],
          })
        }
        if (data.reminder_initial_date <= todayString) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Choose a future date for the follow-up reminder.",
            path: ["reminder_initial_date"],
          })
        }
        if (expiryDate && data.reminder_initial_date >= expiryDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The follow-up reminder must be before expiration.",
            path: ["reminder_initial_date"],
          })
        }
      }
    }

    if (
      data.send_initial_reminder &&
      data.send_expiry_reminder &&
      data.reminder_initial_date &&
      data.reminder_initial_date === data.reminder_expiry_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose different dates for the two reminders.",
        path: ["reminder_expiry_date"],
      })
    }

    if (data.send_expiry_reminder) {
      if (!data.expires_at) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Set an expiration date before scheduling an expiry reminder.",
          path: ["expires_at"],
        })
      }
      if (!data.reminder_expiry_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please set an expiry reminder date.",
          path: ["reminder_expiry_date"],
        })
      } else {
        if (data.reminder_expiry_date <= todayString) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Choose a future date for the expiry reminder.",
            path: ["reminder_expiry_date"],
          })
        }
        if (expiryDate && data.reminder_expiry_date >= expiryDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The expiry reminder must be before the expiration date.",
            path: ["reminder_expiry_date"],
          })
        }
      }
    }
  })
export type Step11OnlineData = z.infer<typeof step11OnlineSchema>

export const step4BulkSchema = z.object({
  event_address: z.string().min(5, "Please provide a delivery address."),
  event_date: z.string().min(1, "Please select a required date."),
  inquiry_notes: z.string().optional(),
})
export type Step4BulkData = z.infer<typeof step4BulkSchema>

export const step5BulkSchema = z.object({
  bulk_items: z
    .array(
      z.object({
        product_id: z.number(),
        product_name: z.string(),
        variant_id: z.number().nullable().optional(),
        variant_name: z.string().nullable().optional(),
        quantity: z.number().min(1),
      })
    )
    .min(1, "Please add at least one item to your inquiry."),
})
export type Step5BulkData = z.infer<typeof step5BulkSchema>
