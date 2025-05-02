
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const isMobile = useIsMobile();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] w-full text-center",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-full p-0 text-center text-sm relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          isMobile && "!p-0 !text-xs"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-full p-0 font-normal aria-selected:opacity-100 border border-transparent mx-[1px] pointer-events-auto",
          isMobile && "!h-7 !text-xs !mx-[0.5px]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground border border-primary/30 pointer-events-auto",
        day_today: "bg-accent text-accent-foreground font-medium border border-accent/30 pointer-events-auto",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30 border-transparent pointer-events-auto",
        day_disabled: "text-muted-foreground opacity-50 border-transparent",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground border border-accent/20 pointer-events-auto",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 pointer-events-auto" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 pointer-events-auto" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
