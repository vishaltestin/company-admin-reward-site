import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Loader2, Megaphone } from "lucide-react"

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
import { useCampaignsQuery } from "@/hooks/useCampaigns"

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

export default function CampaignsList() {
  const [page] = useState(1)
  const navigate = useNavigate()
  const { data, isLoading } = useCampaignsQuery(page)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        )
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-gray-500">
            Completed
          </Badge>
        )
      case "inquiry_pending":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Inquiry Pending
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Campaigns
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your reward programs and wholesale inquiries.
          </p>
        </div>
        <Button onClick={() => navigate("/campaign/create")}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Budget Locked</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <Megaphone className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No campaigns yet
                  </h3>
                  <p className="text-gray-500">
                    Click "New Campaign" to launch your first program.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((campaign: Campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{campaign.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.distribution_type === "online"
                      ? "Online Gift"
                      : "Wholesale Inquiry"}
                  </TableCell>
                  <TableCell>{campaign.vertical?.name || "—"}</TableCell>
                  <TableCell>
                    {campaign.total_budget ? (
                      <span className="font-semibold text-gray-900">
                        ₹
                        {Math.abs(
                          Number(campaign.total_budget)
                        ).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Quote Req.</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
