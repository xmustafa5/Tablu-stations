import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/components/calendar-context";
import { useDeleteReservation } from "@/lib/hooks/use-reservations";
import { idMapping } from "@/components/calendar";

interface DeleteEventDialogProps {
	eventId: number;
}

export default function DeleteEventDialog({ eventId }: DeleteEventDialogProps) {
	const { removeEvent } = useCalendar();
	const deleteMutation = useDeleteReservation();

	const deleteEvent = () => {
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

	if (!eventId) {
		return null;
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					<TrashIcon />
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your
						event and remove event data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={deleteEvent}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
