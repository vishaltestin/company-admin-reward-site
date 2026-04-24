import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useProfileMutations } from "@/hooks/useSettings"
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

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  mobile: z.string().optional(),
  Gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  Address: z.string().min(1, "Address is required"),
  City: z.string().min(1, "City is required"),
  State: z.string().min(1, "State is required"),
  PinCode: z.string().min(1, "Pincode is required"),
  Country: z.string().min(1, "Country is required"),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  // We cast user to 'any' locally just for initialization if your User interface doesn't have these exact fields yet
  const user = useAuthStore((state) => state.user) as any
  const { updateProfile } = useProfileMutations()

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      Gender: user?.Gender || "",
      dob: user?.dob ? user.dob.split("T")[0] : "",
      Address: user?.Address || "",
      City: user?.City || "",
      State: user?.State || "",
      PinCode: user?.PinCode || "",
      Country: user?.Country || "India",
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
      className="max-w-2xl space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...form.register("first_name")} />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...form.register("last_name")} />
        </div>
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input {...form.register("mobile")} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            onValueChange={(value) => form.setValue("Gender", value)}
            defaultValue={form.watch("Gender")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input type="date" {...form.register("dob")} />
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Home Address</h3>
        <div className="space-y-2">
          <Label>Address Line 1</Label>
          <Input {...form.register("Address")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...form.register("City")} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input {...form.register("State")} />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input {...form.register("PinCode")} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...form.register("Country")} />
          </div>
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
