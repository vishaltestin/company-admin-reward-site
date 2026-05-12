import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { type User } from "@/store/useAuthStore"
import { useSubAdminMutations } from "@/hooks/useSubAdmins"
import { useVerticalsQuery } from "@/hooks/useVerticals"
import { usePromoteEmployeeMutation } from "@/hooks/useEmployees"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  mobile: z.string().optional(),
  managed_vertical_ids: z
    .array(z.number())
    .min(1, "Select at least one vertical"),
})

type FormValues = z.infer<typeof formSchema>

interface SubAdminFormProps {
  initialData?: User | null
  isPromotion?: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function SubAdminForm({
  initialData,
  isPromotion = false,
  onSuccess,
  onCancel,
}: SubAdminFormProps) {
  const { data: verticals } = useVerticalsQuery()
  const { saveMutation } = useSubAdminMutations()
  const promoteMutation = usePromoteEmployeeMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      managed_vertical_ids: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        email: initialData.email,
        mobile: initialData.mobile || "",
        managed_vertical_ids:
          initialData.managed_verticals?.map((v) => v.id) || [],
      })
    } else {
      form.reset()
    }
  }, [initialData, form])

  const isPending = isPromotion
    ? promoteMutation.isPending
    : saveMutation.isPending

  const onSubmit = (values: FormValues) => {
    if (isPromotion && initialData?.id) {
      promoteMutation.mutate(
        {
          id: initialData.id,
          data: { managed_vertical_ids: values.managed_vertical_ids },
        },
        { onSuccess: () => onSuccess() }
      )
    } else {
      saveMutation.mutate(
        { id: initialData?.id, data: values },
        { onSuccess: () => onSuccess() }
      )
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input disabled={isPromotion} {...form.register("first_name")} />
          {form.formState.errors.first_name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input disabled={isPromotion} {...form.register("last_name")} />
          {form.formState.errors.last_name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          disabled={!!initialData}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <Label className="text-base font-semibold">
          Assign Vertical Access
        </Label>
        <p className="mb-2 text-sm text-gray-500">
          Select which data verticals this admin can manage.
        </p>

        <Controller
          name="managed_vertical_ids"
          control={form.control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-2">
              {verticals?.map((vertical) => (
                <div key={vertical.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vertical-${vertical.id}`}
                    checked={field.value?.includes(vertical.id)}
                    onCheckedChange={(checked) => {
                      const current = field.value || []
                      const updated = checked
                        ? [...current, vertical.id]
                        : current.filter((id) => id !== vertical.id)
                      field.onChange(updated)
                    }}
                  />
                  <Label
                    htmlFor={`vertical-${vertical.id}`}
                    className="cursor-pointer font-normal"
                  >
                    {vertical.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        />
        {form.formState.errors.managed_vertical_ids && (
          <p className="text-sm text-red-500">
            {form.formState.errors.managed_vertical_ids.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPromotion
            ? "Promote to Admin"
            : initialData
              ? "Save Changes"
              : "Create Admin"}
        </Button>
      </div>
    </form>
  )
}
