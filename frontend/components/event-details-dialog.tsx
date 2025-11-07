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
import { useDeleteReservation } from "@/lib/hooks/use-reservations";
import { idMapping } from "@/components/calendar";

interface IProps {
	event: IEvent;
	children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
	const startDate = parseISO(event.startDate);
	const endDate = parseISO(event.endDate);
	const { use24HourFormat, removeEvent } = useCalendar();
	const deleteMutation = useDeleteReservation();

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
			className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200"
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
		// Get the real UUID from the number ID
		const realId = idMapping.get(eventId);
		if (!realId) {
			toast.error("خطأ: معرّف الحجز غير صالح");
			return;
		}

		deleteMutation.mutate(realId, {
			onSuccess: () => {
				// Update local calendar state
				removeEvent(eventId);
			},
			onError: (error) => {
				console.error("Error deleting event:", error);
			},
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-900 border-slate-200 pb-0 dark:border-slate-700 shadow-2xl">
				<DialogHeader className=" border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-3">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
							<Building className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
								{event.advertiserName}
							</DialogTitle>
							<Badge className={`${statusConfig[event.status].className} mt-1.5 border`}>
								{statusConfig[event.status].label}
							</Badge>
						</div>
					</div>
				</DialogHeader>

				<ScrollArea className="max-h-[70vh] px-1">
					<div className="space-y-4">
						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9  rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
								<Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">اسم المعلن</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{event.advertiserName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
								<User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">اسم العميل</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{event.customerName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
								<MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">موقع اللوحة</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{event.location}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
								<Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">وقت البداية</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{format(startDate, "EEEE dd MMMM")}
									<span className="mx-1">في</span>
									{formatTime(parseISO(event.startDate), use24HourFormat)}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
								<Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">وقت النهاية</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{format(endDate, "EEEE dd MMMM")}
									<span className="mx-1">في</span>
									{formatTime(parseISO(event.endDate), use24HourFormat)}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
							<div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
								<User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">المسؤول</p>
								<p className="text-base text-slate-900 dark:text-slate-100">
									{event.user.name}
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
				<div className="flex justify-end gap-3 pt-4 pb-0 border-t border-slate-200 dark:border-slate-700">
					<AddEditEventDialog event={event}>
						<Button variant="outline" className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
							تعديل
						</Button>
					</AddEditEventDialog>
					<Button
						variant="destructive"
						onClick={() => {
							deleteEvent(event.id);
						}}
						className="h-11 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
					>
						حذف
					</Button>
				</div>
				<DialogClose />
			</DialogContent>
		</Dialog>
	);
}
