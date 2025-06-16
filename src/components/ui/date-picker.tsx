
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export interface DatePickerProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

export function DatePicker({ mode = "single", ...props }: DatePickerProps) {
  return <Calendar mode={mode} {...props} />
}
