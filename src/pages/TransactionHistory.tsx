import { useState } from "react"
import { useTransactionsQuery } from "@/hooks/usePayment"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react"

export default function TransactionHistoryPage() {
  const [page, setPage] = useState<number>(1)
  const { data, isLoading } = useTransactionsQuery(page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction History
        </h1>
        <p className="text-muted-foreground">
          View all your credits, debits, and top-ups.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
          <CardDescription>
            A complete log of your account's financial activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fiat Paid (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !data || data.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium whitespace-nowrap text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {tx.type === "credit" ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
                          >
                            <ArrowDownRight className="h-3 w-3" /> Credit
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                          >
                            <ArrowUpRight className="h-3 w-3" /> Debit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.description || "System Transaction"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold tracking-tight ${tx.type === "credit" ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                        {Number(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {tx.fiat_paid
                          ? `₹${Number(tx.fiat_paid).toLocaleString()}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {data && data.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing page{" "}
                <span className="font-medium text-foreground">
                  {data.current_page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {data.last_page}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.last_page || isLoading}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
