import type { IEvent, IUser, ReservationStatus } from "@/components/interfaces";

export const USERS_MOCK: IUser[] = [
	{
		id: "f3b035ac-49f7-4e92-a715-35680bf63175",
		name: "أحمد محمد",
		picturePath: null,
	},
	{
		id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
		name: "سارة علي",
		picturePath: null,
	},
	{
		id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
		name: "خالد حسن",
		picturePath: null,
	},
	{
		id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
		name: "فاطمة عبدالله",
		picturePath: null,
	},
];

// ================================== //

const advertisers = [
	"شركة الحلول التقنية",
	"شركة الأزياء العصرية",
	"مطعم المدينة",
	"صيدلية الشفاء",
	"بنك الأمان",
	"شركة السفر والسياحة",
	"متجر الإلكترونيات",
	"مركز التدريب المهني",
	"شركة العقارات المتطورة",
	"مركز اللياقة البدنية",
	"معهد اللغات الدولي",
	"شركة الاتصالات الحديثة",
	"مطعم البحر الأزرق",
	"محل الذهب والمجوهرات",
	"شركة التأمين الشامل",
	"مركز التسوق المركزي",
	"مكتبة المعرفة",
	"شركة النقل السريع",
	"مستشفى النور",
	"مركز الجمال والعناية",
];

const customers = [
	"محمد أحمد",
	"فاطمة حسن",
	"علي عبدالله",
	"نورة خالد",
	"سعيد محمود",
	"هند إبراهيم",
	"عمر يوسف",
	"ريم سعد",
	"خالد عمر",
	"لينا فهد",
	"طارق عادل",
	"سلمى رشيد",
	"ياسر منصور",
	"مريم جابر",
	"وليد طه",
];

const locations = [
	"شارع الرئيسي - وسط المدينة",
	"المركز التجاري - المدخل الشمالي",
	"مطار المدينة - صالة 2",
	"محطة الحافلات المركزية - المدخل الرئيسي",
	"الكورنيش البحري - قرب المطاعم",
	"شارع الملك فهد - أمام البنك",
	"حي السفارات - بجانب الفندق",
	"الجامعة - مدخل الطلاب",
	"المستشفى العام - موقف السيارات",
	"الحديقة العامة - البوابة الجنوبية",
	"مجمع المحلات - الطابق الأرضي",
	"محطة القطار - المنصة 1",
	"الملعب الرياضي - المدخل الغربي",
	"السوق الشعبي - المدخل الشرقي",
	"مركز المؤتمرات - القاعة الرئيسية",
];

const STATUSES: ReservationStatus[] = ["waiting", "active", "ending_soon", "completed", "expired"];

const mockGenerator = (numberOfEvents: number): IEvent[] => {
	const result: IEvent[] = [];
	let currentId = 1;

	const randomUser = USERS_MOCK[Math.floor(Math.random() * USERS_MOCK.length)];

	// Date range: 30 days before and after now
	const now = new Date();
	const startRange = new Date(now);
	startRange.setDate(now.getDate() - 30);
	const endRange = new Date(now);
	endRange.setDate(now.getDate() + 30);

	// Create a reservation happening now
	const currentEvent = {
		id: currentId++,
		startDate: new Date(now.getTime() - 30 * 60000).toISOString(),
		endDate: new Date(now.getTime() + 30 * 60000).toISOString(),
		advertiserName: advertisers[Math.floor(Math.random() * advertisers.length)],
		customerName: customers[Math.floor(Math.random() * customers.length)],
		location: locations[Math.floor(Math.random() * locations.length)],
		status: "active" as ReservationStatus,
		user: randomUser,
	};

	result.push(currentEvent);

	// Generate the remaining reservations
	for (let i = 0; i < numberOfEvents - 1; i++) {
		// Most reservations are multi-day (80% chance for billboard reservations)
		const isMultiDay = Math.random() < 0.8;

		const startDate = new Date(
			startRange.getTime() +
				Math.random() * (endRange.getTime() - startRange.getTime()),
		);

		// Set time between 8 AM and 6 PM
		startDate.setHours(
			8 + Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 60),
			0,
			0,
		);

		const endDate = new Date(startDate);

		if (isMultiDay) {
			// Multi-day reservation: Add 3-14 days (typical billboard rental period)
			const additionalDays = Math.floor(Math.random() * 12) + 3;
			endDate.setDate(startDate.getDate() + additionalDays);
			endDate.setHours(
				8 + Math.floor(Math.random() * 10),
				Math.floor(Math.random() * 60),
				0,
				0,
			);
		} else {
			// Same-day reservation: Add 6-12 hours
			endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 7) + 6);
		}

		// Determine status based on dates
		let status: ReservationStatus;
		const currentTime = now.getTime();
		const start = startDate.getTime();
		const end = endDate.getTime();
		const dayInMs = 24 * 60 * 60 * 1000;

		if (end < currentTime) {
			status = "completed";
		} else if (start > currentTime) {
			status = "waiting";
		} else if (end - currentTime < 2 * dayInMs) {
			status = "ending_soon";
		} else {
			status = "active";
		}

		result.push({
			id: currentId++,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			advertiserName: advertisers[Math.floor(Math.random() * advertisers.length)],
			customerName: customers[Math.floor(Math.random() * customers.length)],
			location: locations[Math.floor(Math.random() * locations.length)],
			status: status,
			user: USERS_MOCK[Math.floor(Math.random() * USERS_MOCK.length)],
		});
	}

	return result;
};

export const CALENDAR_ITEMS_MOCK: IEvent[] = mockGenerator(80);
