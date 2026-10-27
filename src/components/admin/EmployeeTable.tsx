import { useState, useEffect } from "react"
import {
  useEmployeesQuery,
  useDeleteEmployeeMutation,
} from "@/hooks/useEmployees"
import { type User } from "@/store/useAuthStore"
import { Input } from "@/components/ui/input"
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
  Search,
  MoreHorizontal,
  Edit,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EmployeeTableProps {
  verticalSlug: string
  onEdit: (user: User) => void
  onPromote: (user: User) => void
}

export function EmployeeTable({
  verticalSlug,
  onEdit,
  onPromote,
}: EmployeeTableProps) {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const deleteMutation = useDeleteEmployeeMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      if (searchInput) setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isError } = useEmployeesQuery({
    vertical: verticalSlug,
    page,
    search: debouncedSearch,
  })

  const closeDeleteDialog = (isOpen: boolean) => {
    setIsDeleteDialogOpen(isOpen)

    if (!isOpen) {
      setTimeout(() => setUserToDelete(null), 300)
    }
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault()

    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: () => closeDeleteDialog(false),
      })
    }
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-500">
        Failed to load data.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search name, email, mobile..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: {data?.total || 0} Records
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="inline-block h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-gray-500"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                      {user.user_type === "sub_admin" && (
                        <Badge variant="outline">Sub-Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-50">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>

                        {user.user_type !== "sub_admin" && (
                          <DropdownMenuItem onClick={() => onPromote(user)}>
                            <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                            Promote to Admin
                          </DropdownMenuItem>
                        )}

                        {user.user_type !== "sub_admin" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Recipient
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing Page {data.current_page} of {data.last_page}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={page === data.last_page || isLoading}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              recipient
              <span className="mx-1 font-semibold text-gray-900">
                {userToDelete?.first_name} {userToDelete?.last_name}
              </span>
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Recipient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
