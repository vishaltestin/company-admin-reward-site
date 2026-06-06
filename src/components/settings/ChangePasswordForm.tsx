import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { useProfileMutations } from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    new_password_confirmation: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
  })

export function ChangePasswordForm() {
  const { changePassword } = useProfileMutations()

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  })

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePassword.mutate(data, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Password</Label>
        <Input type="password" {...form.register("current_password")} />
        {form.formState.errors.current_password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.current_password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" {...form.register("new_password")} />
        {form.formState.errors.new_password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.new_password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <Input
          type="password"
          {...form.register("new_password_confirmation")}
        />
        {form.formState.errors.new_password_confirmation && (
          <p className="text-sm text-red-500">
            {form.formState.errors.new_password_confirmation.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Update Password
      </Button>
    </form>
  )
}
