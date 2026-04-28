export type BlockValue = string | number | boolean | undefined
export interface PageBlock {
  id: string
  type: string
  variant: string
  isVisible: boolean
  content: Record<string, BlockValue>
  styles: Record<string, BlockValue>
}
