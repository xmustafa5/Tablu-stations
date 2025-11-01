'use client';

import React, { useMemo } from "react";
import { CalendarBody } from "@/components/calendar-body";
import { CalendarProvider } from "@/components/calendar-context";
import { DndProvider } from "@/components/dnd-context";
import { CalendarHeader } from "@/components/calendar-header";
import { useReservations } from "@/lib/hooks/use-reservations";
import { Reservation as ApiReservation, ReservationStatus as ApiStatus } from "@/lib/types/api.types";
import type { IEvent, IUser, ReservationStatus } from "@/components/interfaces";
import { Loader2 } from "lucide-react";

interface CalendarProps {
	onEventClick?: (event: IEvent, originalId: string) => void;
}

// Global ID mapping to convert between number IDs and UUIDs
export const idMapping = new Map<number, string>();

// Map API status to calendar status
const mapApiStatusToCalendar = (apiStatus: ApiStatus): ReservationStatus => {
	const statusMap: Record<ApiStatus, ReservationStatus> = {
		[ApiStatus.WAITING]: "waiting",
		[ApiStatus.ACTIVE]: "active",
		[ApiStatus.ENDING_SOON]: "ending_soon",
		[ApiStatus.COMPLETED]: "completed",
	};
	return statusMap[apiStatus] || "waiting";
};

// Convert UUID to unique number for calendar
const uuidToNumber = (uuid: string): number => {
	// Take first 8 characters of UUID and convert to number
	// This gives us a unique number for each UUID
	const hex = uuid.replace(/-/g, '').substring(0, 8);
	const numId = parseInt(hex, 16);
	// Store mapping for reverse lookup
	idMapping.set(numId, uuid);
	return numId;
};

// Convert API reservation to calendar event format
const convertApiToCalendarEvent = (apiRes: ApiReservation): IEvent => ({
	id: uuidToNumber(apiRes.id),
	startDate: apiRes.startTime,
	endDate: apiRes.endTime,
	advertiserName: apiRes.advertiserName,
	customerName: apiRes.customerName,
	location: apiRes.location,
	status: mapApiStatusToCalendar(apiRes.status),
	user: {
		id: apiRes.userId,
		name: apiRes.customerName, // Use customer name as user
		picturePath: null,
	},
});

export function Calendar({ onEventClick }: CalendarProps = {}) {
	// Fetch reservations for calendar view (large limit to show all events)
	const { data, isLoading, error } = useReservations({
		limit: 500, // High limit for calendar view to show all reservations
	});

	if (isLoading) {
		return (
			<div className="w-full border rounded-xl p-12 flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full border rounded-xl p-12 flex items-center justify-center">
				<p className="text-red-500">فشل تحميل الحجوزات</p>
			</div>
		);
	}

	// Convert API reservations to calendar events
	const events: IEvent[] = Array.isArray(data?.data)
		? data.data.map(convertApiToCalendarEvent)
		: [];

	// Extract unique users from reservations
	const users: IUser[] = Array.isArray(data?.data)
		? Array.from(
			new Map(
				data.data.map((res: ApiReservation) => [
					res.userId,
					{
						id: res.userId,
						name: res.customerName,
						picturePath: null,
					},
				])
			).values()
		)
		: [];

	return (
		<CalendarProvider events={events} users={users} view="month">
			<DndProvider showConfirmation={false}>
				<div dir="ltr" className="w-full border rounded-xl">
					<CalendarHeader />
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}
