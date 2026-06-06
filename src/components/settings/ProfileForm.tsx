import { useForm, Controller } from "react-hook-form"
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
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),

  address_line_1: z.string().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().min(1, "Country is required"),

  shipping_address_line_1: z.string().optional(),
  shipping_address_line_2: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_pincode: z.string().optional(),
  shipping_country: z.string().optional(),
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
      gender: user?.gender || "",
      dob: user?.dob ? user.dob.split("T")[0] : "",

      // Home
      address_line_1: user?.address_line_1 || "",
      address_line_2: user?.address_line_2 || "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
      country: user?.country || "India",

      // Shipping
      shipping_address_line_1: user?.shipping_address_line_1 || "",
      shipping_address_line_2: user?.shipping_address_line_2 || "",
      shipping_city: user?.shipping_city || "",
      shipping_state: user?.shipping_state || "",
      shipping_pincode: user?.shipping_pincode || "",
      shipping_country: user?.shipping_country || "India",
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input type="date" {...form.register("dob")} />
        </div>
      </div>

      {/* --- HOME ADDRESS --- */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Home Address</h3>

        <div className="space-y-2">
          <Label>Address Line 1</Label>
          <Input
            {...form.register("address_line_1")}
            placeholder="Street address..."
          />
        </div>

        <div className="space-y-2">
          <Label>Address Line 2 (Optional)</Label>
          <Input
            {...form.register("address_line_2")}
            placeholder="Apartment, suite, landmark..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input {...form.register("state")} />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input {...form.register("pincode")} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...form.register("country")} />
          </div>
        </div>
      </div>

      {/* --- SHIPPING ADDRESS --- */}
      <div className="mt-6 space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <p className="mb-4 text-sm text-gray-500">
          Leave blank if same as home address.
        </p>

        <div className="space-y-2">
          <Label>Address Line 1</Label>
          <Input
            {...form.register("shipping_address_line_1")}
            placeholder="Street address..."
          />
        </div>

        <div className="space-y-2">
          <Label>Address Line 2 (Optional)</Label>
          <Input
            {...form.register("shipping_address_line_2")}
            placeholder="Apartment, suite, landmark..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...form.register("shipping_city")} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input {...form.register("shipping_state")} />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input {...form.register("shipping_pincode")} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...form.register("shipping_country")} />
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
