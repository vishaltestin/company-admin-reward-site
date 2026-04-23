import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShieldCheck, Plus, Edit, Loader2 } from "lucide-react"

import { type User } from "@/store/useAuthStore"
import { useSubAdminsQuery, useSubAdminMutations } from "@/hooks/useSubAdmins"
import { useVerticalsQuery } from "@/hooks/useVerticals"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

export default function SystemAdminsPage() {
  const { data: subAdmins, isLoading } = useSubAdminsQuery()
  const { data: verticals } = useVerticalsQuery()
  const { saveMutation } = useSubAdminMutations()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)

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

  const openForm = (admin?: User) => {
    if (admin) {
      setEditingAdmin(admin)
      form.reset({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        mobile: admin.mobile || "",
        // Extract the array of IDs from the nested objects
        managed_vertical_ids:
          admin.managed_verticals?.map((v: any) => v.id) || [],
      })
    } else {
      setEditingAdmin(null)
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        managed_vertical_ids: [],
      })
    }
    setIsFormOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(
      { id: editingAdmin?.id, data: values },
      { onSuccess: () => setIsFormOpen(false) }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            System Admins
          </h1>
          <p className="mt-1 text-gray-500">
            Manage sub-admins and their vertical access.
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add Sub-Admin
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vertical Access</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </TableCell>
              </TableRow>
            ) : subAdmins?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-gray-500"
                >
                  No sub-admins found.
                </TableCell>
              </TableRow>
            ) : (
              subAdmins?.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      {admin.first_name} {admin.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.managed_verticals?.map((v: any) => (
                        <Badge
                          key={v.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {v.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openForm(admin)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-xl font-bold">
              {editingAdmin ? "Edit Sub-Admin" : "Create Sub-Admin"}
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...form.register("first_name")} />
                  {form.formState.errors.first_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...form.register("last_name")} />
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
                  disabled={!!editingAdmin}
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
                        <div
                          key={vertical.id}
                          className="flex items-center space-x-2"
                        >
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
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Save Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
