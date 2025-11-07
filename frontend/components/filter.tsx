import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useCalendar } from "@/components/calendar-context";
import type { ReservationStatus } from "@/components/interfaces";

export default function FilterEvents() {
	const { selectedColors, filterEventsBySelectedColors, clearFilter } =
		useCalendar();

	const statuses: ReservationStatus[] = [
		"waiting",
		"active",
		"ending_soon",
		"completed",
		"expired",
	];

	const statusLabels: Record<ReservationStatus, string> = {
		waiting: "قيد الانتظار",
		active: "نشط",
		ending_soon: "ينتهي قريباً",
		completed: "مكتمل",
		expired: "منتهي",
	};

	const statusColors: Record<ReservationStatus, string> = {
		waiting: "amber",
		active: "emerald",
		ending_soon: "purple",
		completed: "blue",
		expired: "red",
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Toggle variant="outline" className="cursor-pointer w-fit">
					<Filter className="h-4 w-4" />
				</Toggle>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				{statuses.map((status, index) => (
					<DropdownMenuItem
						key={index}
						className="flex items-center gap-2 cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							filterEventsBySelectedColors(status);
						}}
					>
						<div
							className={`size-3.5 rounded-full bg-${statusColors[status]}-600 dark:bg-${statusColors[status]}-700`}
						/>
						<span className="flex justify-center items-center gap-2">
							{statusLabels[status]}
							<span>
								{selectedColors.includes(status) && (
									<span className="text-blue-500">
										<CheckIcon className="size-4" />
									</span>
								)}
							</span>
						</span>
					</DropdownMenuItem>
				))}
				<Separator className="my-2" />
				<DropdownMenuItem
					disabled={selectedColors.length === 0}
					className="flex gap-2 cursor-pointer"
					onClick={(e) => {
						e.preventDefault();
						clearFilter();
					}}
				>
					<RefreshCcw className="size-3.5" />
					إزالة التصفية
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
