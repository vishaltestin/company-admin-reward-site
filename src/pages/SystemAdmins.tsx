import { useState } from "react"
import { ShieldCheck, Plus, Edit, Loader2 } from "lucide-react"

import { type User } from "@/store/useAuthStore"
import { useSubAdminMutations, useSubAdminsQuery } from "@/hooks/useSubAdmins"
import { SubAdminForm } from "@/components/admin/SubAdminForm"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SystemAdminsPage() {
  const { data: subAdmins, isLoading } = useSubAdminsQuery()
  const { deleteMutation } = useSubAdminMutations()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)

  const openForm = (admin: User | null = null) => {
    setEditingAdmin(admin)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setTimeout(() => setEditingAdmin(null), 200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            System Admins
          </h1>
          <p className="mt-1 text-gray-500">
            Manage sub-admins and their vertical access.
          </p>
        </div>
        <Button onClick={() => openForm(null)}>
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
                      {admin.managed_verticals?.map((v) => (
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this admin?")
                        ) {
                          deleteMutation.mutate(admin.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Edit Sub-Admin" : "Create Sub-Admin"}
            </DialogTitle>
          </DialogHeader>

          <SubAdminForm
            initialData={editingAdmin}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
