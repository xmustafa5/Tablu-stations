import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { differenceInMinutes, parseISO } from "date-fns";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/components/calendar-context";
import { EventDetailsDialog } from "@/components/event-details-dialog";
import { DraggableEvent } from "@/components/draggable-event";
import { ResizableEvent } from "@/components/resizable-event";
import { formatTime } from "@/components/helpers";
import type { IEvent } from "@/components/interfaces";

const calendarWeekEventCardVariants = cva(
	"flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-offset-2",
	{
		variants: {
			status: {
				// Status variants for reservations
				waiting: "border-amber-200 bg-amber-100/50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950",
				active:
					"border-emerald-200 bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950",
				ending_soon: "border-purple-200 bg-purple-100/50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950",
				completed:
					"border-blue-200 bg-blue-100/50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950",
				expired:
					"border-red-200 bg-red-100/50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950",

				// Dot variants
				"waiting-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-amber-600 dark:[&_svg]:fill-amber-500",
				"active-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-emerald-600 dark:[&_svg]:fill-emerald-500",
				"ending_soon-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-purple-600 dark:[&_svg]:fill-purple-500",
				"completed-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-blue-600 dark:[&_svg]:fill-blue-500",
				"expired-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-red-600 dark:[&_svg]:fill-red-500",
			},
		},
		defaultVariants: {
			status: "waiting-dot",
		},
	},
);

interface IProps
	extends HTMLAttributes<HTMLDivElement>,
		Omit<VariantProps<typeof calendarWeekEventCardVariants>, "status"> {
	event: IEvent;
}

export function EventBlock({ event, className }: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const start = parseISO(event.startDate);
	const end = parseISO(event.endDate);
	const durationInMinutes = differenceInMinutes(end, start);
	const heightInPixels = (durationInMinutes / 60) * 96 - 8;

	const status = (
		badgeVariant === "dot" ? `${event.status}-dot` : event.status
	) as VariantProps<typeof calendarWeekEventCardVariants>["status"];

	const calendarWeekEventCardClasses = cn(
		calendarWeekEventCardVariants({ status, className }),
		durationInMinutes < 35 && "py-0 justify-center",
	);

	return (
		<ResizableEvent event={event}>
			<DraggableEvent event={event}>
				<EventDetailsDialog event={event}>
					<div
						role="button"
						tabIndex={0}
						className={calendarWeekEventCardClasses}
						style={{ height: `${heightInPixels}px` }}
					>
						<div className="flex items-center gap-1.5 truncate">
							{badgeVariant === "dot" && (
								<svg
									width="8"
									height="8"
									viewBox="0 0 8 8"
									className="shrink-0"
								>
									<circle cx="4" cy="4" r="4" />
								</svg>
							)}

							<p className="truncate font-semibold">{event.advertiserName}</p>
						</div>

						{durationInMinutes > 25 && (
							<p>
								{formatTime(start, use24HourFormat)} -{" "}
								{formatTime(end, use24HourFormat)}
							</p>
						)}
					</div>
				</EventDetailsDialog>
			</DraggableEvent>
		</ResizableEvent>
	);
}
