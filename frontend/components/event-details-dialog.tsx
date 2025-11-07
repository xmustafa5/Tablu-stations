"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, User, Building } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/components/calendar-context";
import { AddEditEventDialog } from "@/components/add-edit-event-dialog";
import { formatTime } from "@/components/helpers";
import type { IEvent, ReservationStatus } from "@/components/interfaces";

interface IProps {
	event: IEvent;
	children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
	const startDate = parseISO(event.startDate);
	const endDate = parseISO(event.endDate);
	const { use24HourFormat, removeEvent } = useCalendar();

	// Status configuration - backend calculates status dynamically
	const statusConfig: Record<ReservationStatus, { label: string; className: string }> = {
		waiting: {
			label: "قيد الانتظار",
			className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200"
		},
		active: {
			label: "نشط",
			className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200"
		},
		ending_soon: {
			label: "ينتهي قريباً",
			className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200"
		},
		completed: {
			label: "مكتمل",
			className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
		},
		expired: {
			label: "منتهي",
			className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200"
		},
	};

	const deleteEvent = (eventId: number) => {
		try {
			removeEvent(eventId);
			toast.success("تم حذف الحجز بنجاح");
		} catch {
			toast.error("خطأ في حذف الحجز");
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{event.advertiserName}
						<Badge className={statusConfig[event.status].className}>
							{statusConfig[event.status].label}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="max-h-[80vh]">
					<div className="space-y-4 p-4">
						<div className="flex items-start gap-2">
							<Building className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">اسم المعلن</p>
								<p className="text-sm text-muted-foreground">
									{event.advertiserName}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<User className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">اسم العميل</p>
								<p className="text-sm text-muted-foreground">
									{event.customerName}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<MapPin className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">موقع اللوحة</p>
								<p className="text-sm text-muted-foreground">
									{event.location}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">وقت البداية</p>
								<p className="text-sm text-muted-foreground">
									{format(startDate, "EEEE dd MMMM")}
									<span className="mx-1">في</span>
									{formatTime(parseISO(event.startDate), use24HourFormat)}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">وقت النهاية</p>
								<p className="text-sm text-muted-foreground">
									{format(endDate, "EEEE dd MMMM")}
									<span className="mx-1">في</span>
									{formatTime(parseISO(event.endDate), use24HourFormat)}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<User className="mt-1 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">المسؤول</p>
								<p className="text-sm text-muted-foreground">
									{event.user.name}
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
				<div className="flex justify-end gap-2">
					<AddEditEventDialog event={event}>
						<Button variant="outline">تعديل</Button>
					</AddEditEventDialog>
					<Button
						variant="destructive"
						onClick={() => {
							deleteEvent(event.id);
						}}
					>
						حذف
					</Button>
				</div>
				<DialogClose />
			</DialogContent>
		</Dialog>
	);
}
