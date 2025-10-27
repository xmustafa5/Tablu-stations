import { z } from "zod";

export const eventSchema = z.object({
	advertiserName: z.string().min(1, "اسم المعلن مطلوب"),
	customerName: z.string().min(1, "اسم العميل مطلوب"),
	location: z.string().min(1, "موقع اللوحة مطلوب"),
	startDate: z.date({
		message: "وقت البداية مطلوب",
	}),
	endDate: z.date({
		message: "وقت النهاية مطلوب",
	}),
	status: z.enum(["waiting", "active", "ending_soon", "completed", "expired"], {
		message: "الحالة مطلوبة",
	}),
});

export type TEventFormData = z.infer<typeof eventSchema>;
