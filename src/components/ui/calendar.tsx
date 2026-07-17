"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

const btnBase =
  "relative flex size-9 items-center justify-center rounded-lg text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  mode = "single",
  ...props
}: React.ComponentProps<typeof DayPicker>): React.ReactElement {
  const defaultClassNames = {
    button_next: btnBase,
    button_previous: btnBase,
    caption_label:
      "text-sm font-medium flex items-center gap-2 h-full",
    day: "size-9 text-sm p-0",
    day_button: cn(
      btnBase,
      "data-selected:bg-primary data-selected:text-primary-foreground data-disabled:text-muted-foreground/50 data-outside:text-muted-foreground/50 data-selected:data-outside:text-primary-foreground data-disabled:line-through outline-none focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-[color,background-color,border-radius,box-shadow]",
    ),
    dropdown: "absolute bg-popover inset-0 opacity-0",
    dropdown_root:
      "relative border border-input rounded-lg px-2 h-9 [&_svg]:size-4 [&_svg]:pointer-events-none",
    dropdowns:
      "w-full flex items-center text-sm justify-center h-9 gap-1.5",
    hidden: "invisible",
    month: "w-full",
    month_caption:
      "relative mx-9 mb-1 flex h-9 items-center justify-center z-10",
    months: "relative flex flex-col gap-2",
    nav: "absolute top-0 flex w-full justify-between z-20",
    outside:
      "text-muted-foreground/50 data-selected:bg-accent/50 data-selected:text-muted-foreground",
    range_end: "range-end",
    range_middle: "range-middle",
    range_start: "range-start",
    today:
      "[&>*]:after:pointer-events-none [&>*]:after:absolute [&>*]:after:bottom-1 [&>*]:after:left-1/2 [&>*]:after:z-10 [&>*]:after:size-[3px] [&>*]:after:-translate-x-1/2 [&>*]:after:rounded-full [&>*]:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 [&>*]:after:transition-colors",
    week_number:
      "size-9 p-0 text-xs font-medium text-muted-foreground/70",
    weekday:
      "size-9 p-0 text-xs font-medium text-muted-foreground/70",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(
    defaultClassNames,
  ).reduce(
    (acc, key) => {
      const k = key as keyof typeof defaultClassNames;
      const userClass = classNames?.[k];
      const baseClass = defaultClassNames[k];
      acc[k] = userClass ? cn(baseClass, userClass) : baseClass;
      return acc;
    },
    {} as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: ({
      className: chevronCls,
      orientation,
      ...chevronProps
    }: {
      className?: string;
      orientation?: "left" | "right" | "up" | "down";
    }): React.ReactElement => {
      if (orientation === "left") {
        return (
          <ChevronLeftIcon
            className={cn(chevronCls, "rtl:rotate-180")}
            {...chevronProps}
            aria-hidden="true"
          />
        );
      }
      if (orientation === "right") {
        return (
          <ChevronRightIcon
            className={cn(chevronCls, "rtl:rotate-180")}
            {...chevronProps}
            aria-hidden="true"
          />
        );
      }
      return (
        <ChevronsUpDownIcon
          className={chevronCls}
          {...chevronProps}
          aria-hidden="true"
        />
      );
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      data-slot="calendar"
      formatters={{
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString("ja-JP", { month: "short" }),
      }}
      mode={mode}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
