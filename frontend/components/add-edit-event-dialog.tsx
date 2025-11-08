import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, format, set } from "date-fns";
import { type ReactNode, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/date-time-picker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/responsive-modal";
import { Textarea } from "@/components/ui/textarea";
import { useCalendar } from "@/components/calendar-context";
import { useDisclosure } from "@/components/hooks";
import type { IEvent } from "@/components/interfaces";
import {
	eventSchema,
	type TEventFormData,
} from "@/components/schemas";
import { useCreateReservation, useUpdateReservation } from "@/lib/hooks/use-reservations";
import { useLocations } from "@/lib/hooks/use-locations";
import { useAuth } from "@/lib/store/auth-context";
import { idMapping } from "@/components/calendar";
import { ReservationStatus as ApiStatus } from "@/lib/types/api.types";
import type { ReservationStatus } from "@/components/interfaces";

interface IProps {
	children: ReactNode;
	startDate?: Date;
	startTime?: { hour: number; minute: number };
	event?: IEvent;
}

export function AddEditEventDialog({
	children,
	startDate,
	startTime,
	event,
}: IProps) {
	const { isOpen, onClose, onToggle } = useDisclosure();
	const { addEvent, updateEvent } = useCalendar();
	const { user } = useAuth();
	const createMutation = useCreateReservation();
	const updateMutation = useUpdateReservation();
	const { data: locations, isLoading: locationsLoading } = useLocations(false);
	const isEditing = !!event;

	// Map API status to local status
	const mapApiStatusToLocal = (apiStatus: ApiStatus): ReservationStatus => {
		const statusMap: Record<ApiStatus, ReservationStatus> = {
			[ApiStatus.WAITING]: "waiting",
			[ApiStatus.ACTIVE]: "active",
			[ApiStatus.ENDING_SOON]: "ending_soon",
			[ApiStatus.COMPLETED]: "completed",
		};
		return statusMap[apiStatus] || "waiting";
	};

	const initialDates = useMemo(() => {
		if (!isEditing && !event) {
			if (!startDate) {
				const now = new Date();
				return { startDate: now, endDate: addMinutes(now, 30) };
			}
			const start = startTime
				? set(new Date(startDate), {
						hours: startTime.hour,
						minutes: startTime.minute,
						seconds: 0,
					})
				: new Date(startDate);
			const end = addMinutes(start, 30);
			return { startDate: start, endDate: end };
		}

		return {
			startDate: new Date(event.startDate),
			endDate: new Date(event.endDate),
		};
	}, [startDate, startTime, event, isEditing]);

	const form = useForm<TEventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues: {
			advertiserName: event?.advertiserName ?? "",
			customerName: event?.customerName ?? "",
			location: event?.location ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
		},
	});

	useEffect(() => {
		form.reset({
			advertiserName: event?.advertiserName ?? "",
			customerName: event?.customerName ?? "",
			location: event?.location ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
		});
	}, [event, initialDates, form]);

	const onSubmit = (values: TEventFormData) => {
		const apiData = {
			advertiserName: values.advertiserName,
			customerName: values.customerName,
			location: values.location,
			startTime: values.startDate.toISOString(),
			endTime: values.endDate.toISOString(),
		};

		if (isEditing) {
			// Get the real UUID from the number ID
			const realId = idMapping.get(event.id);
			if (!realId) {
				toast.error("خطأ: معرّف الحجز غير صالح");
				return;
			}

			updateMutation.mutate(
				{
					id: realId,
					data: apiData,
				},
				{
					onSuccess: () => {
						// Update local calendar state
						const formattedEvent: IEvent = {
							...values,
							startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
							endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
							id: event.id,
							user: event.user,
							status: event.status,
						};
						updateEvent(formattedEvent);
						onClose();
						form.reset();
					},
					onError: (error) => {
						console.error("Error updating event:", error);
					},
				}
			);
		} else {
			createMutation.mutate(apiData, {
				onSuccess: (response) => {
					// Add the new event to local calendar state
					if (response.data) {
						const newEvent: IEvent = {
							id: Math.floor(Math.random() * 1000000), // Temporary number ID for UI
							advertiserName: response.data.advertiserName,
							customerName: response.data.customerName,
							location: response.data.location,
							startDate: format(new Date(response.data.startTime), "yyyy-MM-dd'T'HH:mm:ss"),
							endDate: format(new Date(response.data.endTime), "yyyy-MM-dd'T'HH:mm:ss"),
							user: {
								id: user?.id || "",
								name: user?.name || "Unknown",
								picturePath: null,
							},
							status: mapApiStatusToLocal(response.data.status),
						};
						// Store mapping of number ID to real UUID
						idMapping.set(newEvent.id, response.data.id);
						addEvent(newEvent);
					}
					onClose();
					form.reset();
				},
				onError: (error) => {
					console.error("Error creating event:", error);
				},
			});
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onToggle} modal={false}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
				<ModalHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<ModalTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
							{isEditing ? "تعديل الحجز" : "حجز جديد"}
						</ModalTitle>
					</div>
					<ModalDescription className="text-slate-600 dark:text-slate-400 text-base">
						{isEditing
							? "تعديل تفاصيل حجز اللوحة الإعلانية."
							: "إضافة حجز جديد للوحة إعلانية."}
					</ModalDescription>
				</ModalHeader>

				<Form {...form}>
					<form
						id="event-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-5 py-6"
					>
						<FormField
							control={form.control}
							name="advertiserName"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel htmlFor="advertiserName" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
										<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
										اسم المعلن
									</FormLabel>
									<FormControl>
										<Input
											id="advertiserName"
											placeholder="أدخل اسم المعلن"
											{...field}
											className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg ${fieldState.invalid ? "border-red-500" : ""}`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="customerName"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel htmlFor="customerName" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
										<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										اسم العميل
									</FormLabel>
									<FormControl>
										<Input
											id="customerName"
											placeholder="أدخل اسم العميل"
											{...field}
											className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg ${fieldState.invalid ? "border-red-500" : ""}`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="location"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
										<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										موقع اللوحة
									</FormLabel>
									<FormControl>
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg ${fieldState.invalid ? "border-red-500" : ""}`}>
												<SelectValue placeholder={locationsLoading ? "جاري التحميل..." : "اختر الموقع"} />
											</SelectTrigger>
											<SelectContent>
												{locationsLoading ? (
													<SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
												) : locations && locations.length > 0 ? (
													locations.map((loc) => (
														<SelectItem key={loc.id} value={loc.name}>
															{loc.name}
															{loc.description && ` - ${loc.description}`}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-locations" disabled>
														لا توجد مواقع متاحة
													</SelectItem>
												)}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="grid gap-2.5">
										<FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
											<svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											وقت البداية
										</FormLabel>
										<DateTimePicker form={form} field={field} label="" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem className="grid gap-2.5">
										<FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
											<svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											وقت النهاية
										</FormLabel>
										<DateTimePicker form={form} field={field} label="" />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
				<ModalFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
					<ModalClose asChild>
						<Button
							type="button"
							variant="outline"
							className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
						>
							إلغاء
						</Button>
					</ModalClose>
					<Button
						form="event-form"
						type="submit"
						className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
					>
						{isEditing ? "تحديث" : "إضافة"} الحجز
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
