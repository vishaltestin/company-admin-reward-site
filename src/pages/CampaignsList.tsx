import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Plus,
  Megaphone,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"

import { useCampaignsQuery } from "@/hooks/useCampaigns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Campaign {
  id: string | number
  name: string
  created_at: string | Date
  distribution_type: string
  vertical?: {
    name: string
  }
  total_budget: number
  status: string
}

// Reusable Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case "processing":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-blue-700 uppercase ring-1 ring-blue-600/20 ring-inset">
          Processing
        </span>
      )
    case "active":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase ring-1 ring-emerald-600/20 ring-inset">
          Active
        </span>
      )
    case "completed":
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-gray-700 uppercase ring-1 ring-gray-500/20 ring-inset">
          Completed
        </span>
      )
    case "inquiry_pending":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-amber-700 uppercase ring-1 ring-amber-600/20 ring-inset">
          Inquiry Pending
        </span>
      )
    case "cancelled":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-red-700 uppercase ring-1 ring-red-600/10 ring-inset">
          Cancelled
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-gray-600 uppercase ring-1 ring-gray-500/20 ring-inset">
          {status}
        </span>
      )
  }
}

export default function CampaignsList() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  // Table State
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const { data, isLoading } = useCampaignsQuery(page)
  const tableData = data?.data || []

  // Define Table Columns
  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4 text-xs font-semibold tracking-wider text-gray-500 uppercase hover:bg-gray-50 hover:text-black"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Campaign Name
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {row.getValue("name")}
            </span>
            <span className="mt-0.5 text-xs text-gray-500">
              Created{" "}
              {new Date(row.original.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "distribution_type",
        header: () => (
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Type
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.getValue("distribution_type") === "online"
              ? "Online Gift"
              : "Wholesale Inquiry"}
          </span>
        ),
      },
      {
        accessorKey: "vertical.name",
        id: "audience",
        header: () => (
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Audience
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.vertical?.name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "total_budget",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4 text-xs font-semibold tracking-wider text-gray-500 uppercase hover:bg-gray-50 hover:text-black"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Budget Locked
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("total_budget"))
          return amount ? (
            <span className="font-medium text-gray-900">
              ₹{Math.abs(amount).toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-400">Quote Req.</span>
          )
        },
      },
      {
        accessorKey: "status",
        header: () => (
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Status
          </span>
        ),
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Actions
          </div>
        ),
        cell: ({ row }) => {
          const campaign = row.original
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/campaign/${campaign.id}`)}
                className="text-gray-500 ring-1 ring-transparent transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm hover:ring-gray-200"
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [navigate]
  )

  // Initialize TanStack Table
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const handleExport = () => {
    const rowsToExport = table.getFilteredRowModel().rows.map((r) => r.original)

    if (rowsToExport.length === 0) {
      alert("No data to export.")
      return
    }

    const headers = [
      "ID",
      "Campaign Name",
      "Date Created",
      "Type",
      "Audience",
      "Budget",
      "Status",
    ]

    const csvRows = rowsToExport.map((campaign) => {
      return [
        campaign.id,
        `"${campaign.name.replace(/"/g, '""')}"`,
        new Date(campaign.created_at).toLocaleDateString(),
        campaign.distribution_type === "online"
          ? "Online Gift"
          : "Wholesale Inquiry",
        `"${campaign.vertical?.name || "—"}"`,
        campaign.total_budget || 0,
        campaign.status,
      ].join(",") 
    })

    const csvContent = [headers.join(","), ...csvRows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `campaigns_export_${new Date().toISOString().split("T")[0]}.csv`
    )

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your reward programs and wholesale inquiries.
          </p>
        </div>
        <Button
          onClick={() => navigate("/campaign/create")}
          className="bg-black text-white shadow-sm hover:bg-gray-800"
        >
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center space-x-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="w-full bg-white pl-9 text-sm focus-visible:ring-black"
              />
            </div>

            <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(val) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(val === "all" ? "" : val)
              }
            >
              <SelectTrigger className="w-[160px] bg-white focus:ring-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-white text-gray-600 hover:text-black"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Table Shell */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="py-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse hover:bg-transparent"
                    >
                      <TableCell className="px-4">
                        <div className="h-4 w-4 rounded bg-gray-100" />
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="mb-2 h-4 w-40 rounded bg-gray-100" />
                        <div className="h-3 w-24 rounded bg-gray-50" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 rounded bg-gray-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 rounded bg-gray-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 rounded bg-gray-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-24 rounded-full bg-gray-100" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-8 w-24 rounded-md bg-gray-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="group transition-colors hover:bg-gray-50/70"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "select" ? "px-4" : "py-4"
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="py-0">
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                          <Megaphone className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No campaigns found
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                          We couldn't find any campaigns matching your current
                          filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
            <div className="text-sm text-gray-500">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
                className="h-8 w-8 border-gray-300 p-0 text-gray-600 hover:text-black"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-gray-900">
                Page {page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => old + 1)}
                disabled={!data?.next_page_url}
                className="h-8 w-8 border-gray-300 p-0 text-gray-600 hover:text-black"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
