import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useProfileMutations } from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(255),
  last_name: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Enter a valid email address").max(255),
  mobile: z.string().max(20).optional(),
  designation: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const user = useAuthStore((state) => state.user)
  const { updateProfile } = useProfileMutations()

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      designation: user?.designation || "",
      department: user?.department || "",
    },
  })

  const onSubmit = (data: ProfileValues) => {
    updateProfile.mutate(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="profile-first-name">First Name</Label>
          <Input id="profile-first-name" {...form.register("first_name")} />
          {form.formState.errors.first_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-last-name">Last Name</Label>
          <Input id="profile-last-name" {...form.register("last_name")} />
          {form.formState.errors.last_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.last_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Official Email ID</Label>
          <Input id="profile-email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-mobile">Mobile Number</Label>
          <Input id="profile-mobile" type="tel" {...form.register("mobile")} />
          {form.formState.errors.mobile && (
            <p className="text-sm text-destructive">
              {form.formState.errors.mobile.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-designation">Designation</Label>
          <Input
            id="profile-designation"
            placeholder="e.g. HR Manager"
            {...form.register("designation")}
          />
          {form.formState.errors.designation && (
            <p className="text-sm text-destructive">
              {form.formState.errors.designation.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-department">Department</Label>
          <Input
            id="profile-department"
            placeholder="e.g. Human Resources"
            {...form.register("department")}
          />
          {form.formState.errors.department && (
            <p className="text-sm text-destructive">
              {form.formState.errors.department.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Save Profile
      </Button>
    </form>
  )
}
