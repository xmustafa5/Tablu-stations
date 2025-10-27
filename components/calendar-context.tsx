"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "@/components/hooks";
import type { IEvent, IUser, ReservationStatus } from "@/components/interfaces";
import type {
	TCalendarView,
	TEventColor,
} from "@/components/types";

interface ICalendarContext {
	selectedDate: Date;
	view: TCalendarView;
	setView: (view: TCalendarView) => void;
	agendaModeGroupBy: "date" | "color";
	setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
	use24HourFormat: boolean;
	toggleTimeFormat: () => void;
	setSelectedDate: (date: Date | undefined) => void;
	selectedUserId: IUser["id"] | "all";
	setSelectedUserId: (userId: IUser["id"] | "all") => void;
	badgeVariant: "dot" | "colored";
	setBadgeVariant: (variant: "dot" | "colored") => void;
	selectedColors: ReservationStatus[];
	filterEventsBySelectedColors: (status: ReservationStatus) => void;
	filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
	users: IUser[];
	events: IEvent[];
	addEvent: (event: IEvent) => void;
	updateEvent: (event: IEvent) => void;
	removeEvent: (eventId: number) => void;
	clearFilter: () => void;
}

interface CalendarSettings {
	badgeVariant: "dot" | "colored";
	view: TCalendarView;
	use24HourFormat: boolean;
	agendaModeGroupBy: "date" | "color";
}

const DEFAULT_SETTINGS: CalendarSettings = {
	badgeVariant: "colored",
	view: "day",
	use24HourFormat: true,
	agendaModeGroupBy: "date",
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
	children,
	users,
	events,
	badge = "colored",
	view = "day",
}: {
	children: React.ReactNode;
	users: IUser[];
	events: IEvent[];
	view?: TCalendarView;
	badge?: "dot" | "colored";
}) {
	const [settings, setSettings] = useLocalStorage<CalendarSettings>(
		"calendar-settings",
		{
			...DEFAULT_SETTINGS,
			badgeVariant: badge,
			view: view,
		},
	);

	const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
		settings.badgeVariant,
	);
	const [currentView, setCurrentViewState] = useState<TCalendarView>(
		settings.view,
	);
	const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
		settings.use24HourFormat,
	);
	const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
		"date" | "color"
	>(settings.agendaModeGroupBy);

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
		"all",
	);
	const [selectedColors, setSelectedColors] = useState<ReservationStatus[]>([]);

	const [allEvents, setAllEvents] = useState<IEvent[]>(events || []);
	const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events || []);

	const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
		setSettings({
			...settings,
			...newPartialSettings,
		});
	};

	const setBadgeVariant = (variant: "dot" | "colored") => {
		setBadgeVariantState(variant);
		updateSettings({ badgeVariant: variant });
	};

	const setView = (newView: TCalendarView) => {
		setCurrentViewState(newView);
		updateSettings({ view: newView });
	};

	const toggleTimeFormat = () => {
		const newValue = !use24HourFormat;
		setUse24HourFormatState(newValue);
		updateSettings({ use24HourFormat: newValue });
	};

	const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
		setAgendaModeGroupByState(groupBy);
		updateSettings({ agendaModeGroupBy: groupBy });
	};

	const filterEventsBySelectedColors = (status: ReservationStatus) => {
		const isColorSelected = selectedColors.includes(status);
		const newColors = isColorSelected
			? selectedColors.filter((c) => c !== status)
			: [...selectedColors, status];

		if (newColors.length > 0) {
			const filtered = allEvents.filter((event) => {
				const eventStatus = event.status || "waiting";
				return newColors.includes(eventStatus);
			});
			setFilteredEvents(filtered);
		} else {
			setFilteredEvents(allEvents);
		}

		setSelectedColors(newColors);
	};

	const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
		setSelectedUserId(userId);
		if (userId === "all") {
			setFilteredEvents(allEvents);
		} else {
			const filtered = allEvents.filter((event) => event.user.id === userId);
			setFilteredEvents(filtered);
		}
	};

	const handleSelectDate = (date: Date | undefined) => {
		if (!date) return;
		setSelectedDate(date);
	};

	const addEvent = (event: IEvent) => {
		setAllEvents((prev) => [...prev, event]);
		setFilteredEvents((prev) => [...prev, event]);
	};

	const updateEvent = (event: IEvent) => {
		const updated = {
			...event,
			startDate: new Date(event.startDate).toISOString(),
			endDate: new Date(event.endDate).toISOString(),
		};

		setAllEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
		setFilteredEvents((prev) =>
			prev.map((e) => (e.id === event.id ? updated : e)),
		);
	};

	const removeEvent = (eventId: number) => {
		setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
		setFilteredEvents((prev) => prev.filter((e) => e.id !== eventId));
	};

	const clearFilter = () => {
		setFilteredEvents(allEvents);
		setSelectedColors([]);
		setSelectedUserId("all");
	};

	const value = {
		selectedDate,
		setSelectedDate: handleSelectDate,
		selectedUserId,
		setSelectedUserId,
		badgeVariant,
		setBadgeVariant,
		users,
		selectedColors,
		filterEventsBySelectedColors,
		filterEventsBySelectedUser,
		events: filteredEvents,
		view: currentView,
		use24HourFormat,
		toggleTimeFormat,
		setView,
		agendaModeGroupBy,
		setAgendaModeGroupBy,
		addEvent,
		updateEvent,
		removeEvent,
		clearFilter,
	};

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	);
}

export function useCalendar(): ICalendarContext {
	const context = useContext(CalendarContext);
	if (!context)
		throw new Error("useCalendar must be used within a CalendarProvider.");
	return context;
}
