"use client";

import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useRef,
	useState,
	useMemo,
} from "react";
import { toast } from "sonner";
import { useCalendar } from "@/components/calendar-context";
import type { IEvent } from "@/components/interfaces";
import { DndConfirmationDialog } from "@/components/dnd-confirmation-dialog";

interface PendingDropData {
	event: IEvent;
	newStartDate: Date;
	newEndDate: Date;
}

interface DragDropContextType {
	draggedEvent: IEvent | null;
	isDragging: boolean;
	startDrag: (event: IEvent) => void;
	endDrag: () => void;
	handleEventDrop: (date: Date, hour?: number, minute?: number) => void;
	showConfirmation: boolean;
	setShowConfirmation: (show: boolean) => void;
	pendingDropData: PendingDropData | null;
	handleConfirmDrop: () => void;
	handleCancelDrop: () => void;
}

interface DndProviderProps {
	children: ReactNode;
	showConfirmation: boolean;
}

const DragDropContext = createContext<DragDropContextType | undefined>(
	undefined,
);

export function DndProvider({
	children,
	showConfirmation: showConfirmationProp = false,
}: DndProviderProps) {
	const { updateEvent } = useCalendar();
	const [dragState, setDragState] = useState<{
		draggedEvent: IEvent | null;
		isDragging: boolean;
	}>({ draggedEvent: null, isDragging: false });

	const [showConfirmation, setShowConfirmation] =
		useState<boolean>(showConfirmationProp);

	const [pendingDropData, setPendingDropData] =
		useState<PendingDropData | null>(null);

	const onEventDroppedRef = useRef<
		((event: IEvent, newStartDate: Date, newEndDate: Date) => void) | null
	>(null);

	const startDrag = useCallback((event: IEvent) => {
		setDragState({ draggedEvent: event, isDragging: true });
	}, []);

	const endDrag = useCallback(() => {
		setDragState({ draggedEvent: null, isDragging: false });
	}, []);

	const calculateNewDates = useCallback(
		(event: IEvent, targetDate: Date, hour?: number, minute?: number) => {
			const originalStart = new Date(event.startDate);
			const originalEnd = new Date(event.endDate);
			const duration = originalEnd.getTime() - originalStart.getTime();

			const newStart = new Date(targetDate);
			if (hour !== undefined) {
				newStart.setHours(hour, minute || 0, 0, 0);
			} else {
				newStart.setHours(
					originalStart.getHours(),
					originalStart.getMinutes(),
					0,
					0,
				);
			}

			return {
				newStart,
				newEnd: new Date(newStart.getTime() + duration),
			};
		},
		[],
	);

	const isSamePosition = useCallback((date1: Date, date2: Date) => {
		return date1.getTime() === date2.getTime();
	}, []);

	const handleEventDrop = useCallback(
		(targetDate: Date, hour?: number, minute?: number) => {
			const { draggedEvent } = dragState;
			if (!draggedEvent) return;

			const { newStart, newEnd } = calculateNewDates(
				draggedEvent,
				targetDate,
				hour,
				minute,
			);
			const originalStart = new Date(draggedEvent.startDate);

			// Check if dropped in same position
			if (isSamePosition(originalStart, newStart)) {
				endDrag();
				return;
			}

			if (showConfirmation) {
				// Show confirmation dialog if user wants it
				setPendingDropData({
					event: draggedEvent,
					newStartDate: newStart,
					newEndDate: newEnd,
				});
			} else {
				// Instantly update event if user doesn't want confirmation
				const callback = onEventDroppedRef.current;
				if (callback) {
					callback(draggedEvent, newStart, newEnd);
				}
				endDrag();
			}
		},
		[dragState, calculateNewDates, isSamePosition, endDrag, showConfirmation],
	);

	const handleConfirmDrop = useCallback(() => {
		if (!pendingDropData) return;

		const callback = onEventDroppedRef.current;
		if (callback) {
			callback(
				pendingDropData.event,
				pendingDropData.newStartDate,
				pendingDropData.newEndDate,
			);
		}

		// Reset states
		setPendingDropData(null);
		endDrag();
	}, [pendingDropData, endDrag]);

	const handleCancelDrop = useCallback(() => {
		setPendingDropData(null);
		endDrag();
	}, [endDrag]);

	// Default event update handler
	const handleEventUpdate = useCallback(
		(event: IEvent, newStartDate: Date, newEndDate: Date) => {
			try {
				const updatedEvent = {
					...event,
					startDate: newStartDate.toISOString(),
					endDate: newEndDate.toISOString(),
				};
				updateEvent(updatedEvent);
				toast.success("Event updated successfully");
			} catch {
				toast.error("Failed to update event");
			}
		},
		[updateEvent],
	);

	// Set default callback
	React.useEffect(() => {
		onEventDroppedRef.current = handleEventUpdate;
	}, [handleEventUpdate]);

	// When the prop changes, update the state
	React.useEffect(() => {
		setShowConfirmation(showConfirmationProp);
	}, [showConfirmationProp]);

	const contextValue = useMemo(
		() => ({
			draggedEvent: dragState.draggedEvent,
			isDragging: dragState.isDragging,
			startDrag,
			endDrag,
			handleEventDrop,
			showConfirmation,
			pendingDropData,
			handleConfirmDrop,
			handleCancelDrop,
			setShowConfirmation,
		}),
		[
			dragState,
			showConfirmation,
			pendingDropData,
			startDrag,
			endDrag,
			handleEventDrop,
			handleConfirmDrop,
			handleCancelDrop,
			setShowConfirmation,
		],
	);

	return (
		<DragDropContext.Provider value={contextValue}>
			{showConfirmation && pendingDropData && <DndConfirmationDialog />}
			{children}
		</DragDropContext.Provider>
	);
}

export function useDragDrop() {
	const context = useContext(DragDropContext);
	if (!context) {
		throw new Error("useDragDrop must be used within a DragDropProvider");
	}
	return context;
}
