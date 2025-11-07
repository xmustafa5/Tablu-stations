import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/components/calendar-context";
import { EventDetailsDialog } from "@/components/event-details-dialog";
import { DraggableEvent } from "@/components/draggable-event";
import { formatTime } from "@/components/helpers";
import type { IEvent } from "@/components/interfaces";
import {EventBullet} from "@/components/event-bullet";

const eventBadgeVariants = cva(
	"mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs",
	{
		variants: {
			status: {
				// Status variants
				waiting: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
				active:
					"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
				ending_soon: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
				completed:
					"border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
				expired:
					"border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",

				// Dot variants
				"waiting-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-amber-600",
				"active-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-emerald-600",
				"ending_soon-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-purple-600",
				"completed-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-blue-600",
				"expired-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-red-600",
			},
			multiDayPosition: {
				first:
					"relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5",
				middle:
					"relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
				last: "ml-0 rounded-l-none border-l-0",
				none: "",
			},
		},
		defaultVariants: {
			status: "waiting-dot",
		},
	},
);

interface IProps
	extends Omit<
		VariantProps<typeof eventBadgeVariants>,
		"status" | "multiDayPosition"
	> {
	event: IEvent;
	cellDate: Date;
	eventCurrentDay?: number;
	eventTotalDays?: number;
	className?: string;
	position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
	event,
	cellDate,
	eventCurrentDay,
	eventTotalDays,
	className,
	position: propPosition,
}: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const itemStart = startOfDay(parseISO(event.startDate));
	const itemEnd = endOfDay(parseISO(event.endDate));

	if (cellDate < itemStart || cellDate > itemEnd) return null;

	let position: "first" | "middle" | "last" | "none" | undefined;

	if (propPosition) {
		position = propPosition;
	} else if (eventCurrentDay && eventTotalDays) {
		position = "none";
	} else if (isSameDay(itemStart, itemEnd)) {
		position = "none";
	} else if (isSameDay(cellDate, itemStart)) {
		position = "first";
	} else if (isSameDay(cellDate, itemEnd)) {
		position = "last";
	} else {
		position = "middle";
	}

	const renderBadgeText = ["first", "none"].includes(position) ;
	const renderBadgeTime =  ["last", "none"].includes(position);

	const status = (
		badgeVariant === "dot" ? `${event.status}-dot` : event.status
	) as VariantProps<typeof eventBadgeVariants>["status"];

	const eventBadgeClasses = cn(
		eventBadgeVariants({ status, multiDayPosition: position, className }),
	);

	return (
		<DraggableEvent event={event}>
			<EventDetailsDialog event={event}>
				<div role="button" tabIndex={0} className={eventBadgeClasses}>
					<div className="flex items-center gap-1.5 truncate">
						{!["middle", "last"].includes(position) &&
							badgeVariant === "dot" && (
								<EventBullet status={event.status} />
							)}

						{renderBadgeText && (
							<p className="flex-1 truncate font-semibold">
								{eventCurrentDay && (
									<span className="text-xs">
										يوم {eventCurrentDay} من {eventTotalDays} •{" "}
									</span>
								)}
								{event.advertiserName}
							</p>
						)}
					</div>

					<div className="hidden sm:block">
						{renderBadgeTime && (
							<span>
							{formatTime(new Date(event.startDate), use24HourFormat)}
						</span>
						)}
					</div>
				</div>
			</EventDetailsDialog>
		</DraggableEvent>
	);
}
