import { Clock } from "lucide-react"
import {
  DateInput,
  DateSegment,
  TimeField,
  type TimeFieldProps,
  type TimeValue,
} from "react-aria-components"
import { parseTime } from "@internationalized/date"

// Helper to format TimeValue (like Time) to "HH:mm"
function formatTimeValue(timeValue: TimeValue | null | undefined): string {
  if (!timeValue) return ""
  const hour = typeof timeValue.hour === "number" ? timeValue.hour : 0
  const minute = typeof timeValue.minute === "number" ? timeValue.minute : 0
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export interface CustomTimeInputProps
  extends Omit<
    TimeFieldProps<TimeValue>,
    "value" | "defaultValue" | "onChange" | "children"
  > {
  value?: string // "HH:mm"
  onChange?: (value: string) => void // Sends "HH:mm"
  defaultValue?: string // "HH:mm"
  name?: string // For react-hook-form
  isDisabled?: boolean
  // We can add more props like placeholder if needed by TimeField
  "aria-label"?: string // For accessibility if no visible label is used directly with it
}

export function TimeInput({
  value: stringValue,
  onChange: onStringValueChange,
  defaultValue: stringDefaultValue,
  isDisabled,
  name,
  ...rest
}: CustomTimeInputProps) {
  let timeValue: TimeValue | undefined = undefined
  if (stringValue && stringValue.includes(":")) {
    try {
      timeValue = parseTime(stringValue)
    } catch (e) {
      console.error("Error parsing time value:", stringValue, e)
    }
  }

  let defaultTimeValue: TimeValue | undefined = undefined
  if (stringDefaultValue && stringDefaultValue.includes(":")) {
    try {
      defaultTimeValue = parseTime(stringDefaultValue)
    } catch (e) {
      console.error("Error parsing default time value:", stringDefaultValue, e)
    }
  }

  const handleChange = (newTimeValue: TimeValue | null) => {
    if (onStringValueChange) {
      onStringValueChange(newTimeValue ? formatTimeValue(newTimeValue) : "")
    }
  }

  return (
    <TimeField
      {...rest} // Pass through other TimeField compatible props
      name={name} // Pass name for form context
      value={timeValue}
      defaultValue={defaultTimeValue}
      onChange={handleChange}
      isDisabled={isDisabled}
      className="relative min-w-[150px]" // Adjusted min-width, can be customized via props if needed
    >
      {/* Label is removed, handled by FormField */}
      <div className="relative">
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center ps-3">
          <Clock
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className="text-foreground/70" // Ensure icon color matches text
          />
        </div>
        <DateInput className="border-input bg-background data-[focus-within]:border-ring data-[focus-within]:ring-ring/20 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 ps-9 text-sm whitespace-nowrap shadow-sm shadow-black/5 transition-shadow data-[disabled]:opacity-50 data-[focus-within]:ring-[3px] data-[focus-within]:outline-none">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="text-foreground data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 inline rounded p-0.5 caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[type=literal]:px-0"
            />
          )}
        </DateInput>
      </div>
    </TimeField>
  )
}
