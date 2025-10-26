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
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/responsive-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCalendar } from "@/components/calendar-context";
import { useDisclosure } from "@/components/hooks";
import type { IEvent } from "@/components/interfaces";
import {
	eventSchema,
	type TEventFormData,
} from "@/components/schemas";

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
	const isEditing = !!event;

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
			status: event?.status ?? "waiting",
		},
	});

	useEffect(() => {
		form.reset({
			advertiserName: event?.advertiserName ?? "",
			customerName: event?.customerName ?? "",
			location: event?.location ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
			status: event?.status ?? "waiting",
		});
	}, [event, initialDates, form]);

	const onSubmit = (values: TEventFormData) => {
		try {
			const formattedEvent: IEvent = {
				...values,
				startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
				endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
				id: isEditing ? event.id : Math.floor(Math.random() * 1000000),
				user: isEditing
					? event.user
					: {
							id: Math.floor(Math.random() * 1000000).toString(),
							name: "Jeraidi Yassir",
							picturePath: null,
						},
				status: values.status,
			};

			if (isEditing) {
				updateEvent(formattedEvent);
				toast.success("تم تحديث الحجز بنجاح");
			} else {
				addEvent(formattedEvent);
				toast.success("تم إضافة الحجز بنجاح");
			}

			onClose();
			form.reset();
		} catch (error) {
			console.error(`Error ${isEditing ? "editing" : "adding"} event:`, error);
			toast.error(`فشل في ${isEditing ? "تحديث" : "إضافة"} الحجز`);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onToggle} modal={false}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>{isEditing ? "تعديل الحجز" : "إضافة حجز جديد"}</ModalTitle>
					<ModalDescription>
						{isEditing
							? "تعديل تفاصيل حجز اللوحة الإعلانية."
							: "إضافة حجز جديد للوحة إعلانية بمحطة الحافلات."}
					</ModalDescription>
				</ModalHeader>

				<Form {...form}>
					<form
						id="event-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						<FormField
							control={form.control}
							name="advertiserName"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel htmlFor="advertiserName" className="required">
										اسم المعلن
									</FormLabel>
									<FormControl>
										<Input
											id="advertiserName"
											placeholder="أدخل اسم المعلن"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
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
								<FormItem>
									<FormLabel htmlFor="customerName" className="required">
										اسم العميل
									</FormLabel>
									<FormControl>
										<Input
											id="customerName"
											placeholder="أدخل اسم العميل"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
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
								<FormItem>
									<FormLabel htmlFor="location" className="required">
										موقع اللوحة
									</FormLabel>
									<FormControl>
										<Input
											id="location"
											placeholder="مثال: الشارع الرئيسي - وسط المدينة، صالة 2 بالمطار"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} label="وقت البداية" />
							)}
						/>
						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} label="وقت النهاية" />
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required">الحالة</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												className={`w-full ${
													fieldState.invalid ? "border-red-500" : ""
												}`}
											>
												<SelectValue placeholder="اختر الحالة" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="waiting">قيد الانتظار</SelectItem>
												<SelectItem value="active">نشط</SelectItem>
												<SelectItem value="ending_soon">ينتهي قريباً</SelectItem>
												<SelectItem value="completed">مكتمل</SelectItem>
												<SelectItem value="expired">منتهي</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<ModalFooter className="flex justify-end gap-2">
					<ModalClose asChild>
						<Button type="button" variant="outline">
							إلغاء
						</Button>
					</ModalClose>
					<Button form="event-form" type="submit">
						{isEditing ? "حفظ التعديلات" : "إضافة حجز"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
