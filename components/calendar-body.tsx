"use client";

import { isSameDay, parseISO } from "date-fns";
import { motion } from "framer-motion";
import React from "react";
import { fadeIn, transition } from "@/components/animations";
import { useCalendar } from "@/components/calendar-context";
import { AgendaEvents } from "@/components/agenda-events";
import { CalendarMonthView } from "@/components/calendar-month-view";
import { CalendarDayView } from "@/components/calendar-day-view";
import { CalendarWeekView } from "@/components/calendar-week-view";
import { CalendarYearView } from "@/components/calendar-year-view";

export function CalendarBody() {
	const { view, events } = useCalendar();

	const singleDayEvents = events.filter((event) => {
		const startDate = parseISO(event.startDate);
		const endDate = parseISO(event.endDate);
		return isSameDay(startDate, endDate);
	});

	const multiDayEvents = events.filter((event) => {
		const startDate = parseISO(event.startDate);
		const endDate = parseISO(event.endDate);
		return !isSameDay(startDate, endDate);
	});

	return (
		<div className="w-full h-full overflow-scroll relative">
			<motion.div
				key={view}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={fadeIn}
				transition={transition}
			>
				{view === "month" && (
					<CalendarMonthView
						singleDayEvents={singleDayEvents}
						multiDayEvents={multiDayEvents}
					/>
				)}
				{view === "week" && (
					<CalendarWeekView
						singleDayEvents={singleDayEvents}
						multiDayEvents={multiDayEvents}
					/>
				)}
				{view === "day" && (
					<CalendarDayView
						singleDayEvents={singleDayEvents}
						multiDayEvents={multiDayEvents}
					/>
				)}
				{view === "year" && (
					<CalendarYearView
						singleDayEvents={singleDayEvents}
						multiDayEvents={multiDayEvents}
					/>
				)}
				{view === "agenda" && (
					<motion.div
						key="agenda"
						initial="initial"
						animate="animate"
						exit="exit"
						variants={fadeIn}
						transition={transition}
					>
						<AgendaEvents />
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
