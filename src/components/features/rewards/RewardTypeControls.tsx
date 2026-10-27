import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CampaignRewardType } from "@/hooks/useCampaignOptions"

export type RewardTypeFilterValue = "all" | CampaignRewardType

const labels: Record<CampaignRewardType, string> = {
  points: "Points",
  code: "Code",
  link: "Link",
}

export function RewardTypeFilter({
  value,
  onChange,
}: {
  value: RewardTypeFilterValue
  onChange: (value: RewardTypeFilterValue) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) =>
        onChange(nextValue as RewardTypeFilterValue)
      }
    >
      <SelectTrigger className="w-[180px]" aria-label="Filter by reward type">
        <SelectValue placeholder="Filter reward type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All templates</SelectItem>
        <SelectItem value="points">Points only</SelectItem>
        <SelectItem value="code">Code only</SelectItem>
        <SelectItem value="link">Link only</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function RewardTypeBadge({
  type,
}: {
  type: CampaignRewardType | null | undefined
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
        type ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
      }`}
      title={
        type
          ? `Available only to ${labels[type]} campaigns`
          : "Legacy template: assign a reward type before using it in a campaign"
      }
    >
      {type ? labels[type] : "Unassigned"}
    </span>
  )
}
