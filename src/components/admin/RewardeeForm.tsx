import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { type User } from "@/store/useAuthStore"
import { VERTICAL_FIELDS } from "@/config/verticalFields"
import { api } from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 1. Unified Zod Schema
const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Valid mobile required"),
  custom_data: z.record(z.string(), z.any()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RewardeeFormProps {
  verticalSlug: string
  initialData?: User | null
  onSuccess: () => void
  onCancel: () => void
}

export function RewardeeForm({
  verticalSlug,
  initialData,
  onSuccess,
  onCancel,
}: RewardeeFormProps) {
  const dynamicFields = VERTICAL_FIELDS[verticalSlug] || []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      custom_data: {},
    },
  })

  // Populate data if editing
  useEffect(() => {
    if (initialData) {
      reset({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        email: initialData.email,
        mobile: initialData.mobile || "",
        custom_data: initialData.custom_data || {},
      })
    }
  }, [initialData, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = { vertical_slug: verticalSlug, ...values }

      if (initialData?.id) {
        const { data } = await api.put(
          `/admin/employees/${initialData.id}`,
          payload
        )
        return data
      } else {
        const { data } = await api.post("/admin/employees", payload)
        return data
      }
    },
    onSuccess: () => {
      toast.success(
        initialData ? "Updated successfully!" : "Added successfully!"
      )
      onSuccess()
    },
    onError: () => {
      toast.error("Something went wrong processing this request.")
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="border-b pb-2 text-lg font-semibold">Basic Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="John"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              disabled={!!initialData}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              placeholder="+91 9876543210"
              {...register("mobile")}
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile.message}</p>
            )}
          </div>
        </div>
      </div>

      {dynamicFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Vertical Specific Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dynamicFields.map((config) => (
              <div key={config.name} className="space-y-2">
                <Label htmlFor={`dynamic_${config.name}`}>{config.label}</Label>

                {/* TEXT & DATE INPUTS */}
                {(config.type === "text" || config.type === "date") && (
                  <Input
                    id={`dynamic_${config.name}`}
                    type={config.type}
                    placeholder={config.placeholder}
                    // 'any' cast used here strictly because dynamic dot-notation keys are not statically typed in RHF
                    {...register(`custom_data.${config.name}` as any)}
                  />
                )}

                {config.type === "select" && (
                  <Controller
                    control={control}
                    name={`custom_data.${config.name}` as any}
                    render={({ field: { onChange, value } }) => (
                      <Select onValueChange={onChange} value={value || ""}>
                        <SelectTrigger id={`dynamic_${config.name}`}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {initialData ? "Save Changes" : "Create Recipient"}
        </Button>
      </div>
    </form>
  )
}
