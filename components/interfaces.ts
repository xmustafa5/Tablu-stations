export type ReservationStatus = "waiting" | "active" | "ending_soon" | "completed" | "expired";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	advertiserName: string;
	customerName: string;
	location: string;
	status: ReservationStatus;
	user: IUser;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
