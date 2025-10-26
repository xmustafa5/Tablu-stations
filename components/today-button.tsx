import { formatDate } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	buttonHover,
	transition,
} from "@/components/animations";
import { useCalendar } from "@/components/calendar-context";

const MotionButton = motion.create(Button);

export function TodayButton() {
	const { setSelectedDate } = useCalendar();

	const today = new Date();
	const handleClick = () => setSelectedDate(today);

	return (
		<MotionButton
			variant="outline"
			className="flex h-14 w-14 flex-col items-center justify-center p-0 text-center"
			onClick={handleClick}
			variants={buttonHover}
			whileHover="hover"
			whileTap="tap"
			transition={transition}
		>
			<motion.span
				className="w-full bg-primary py-1 text-xs font-semibold text-primary-foreground"
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1, ...transition }}
			>
				{formatDate(today, "MMM").toUpperCase()}
			</motion.span>
			<motion.span
				className="text-lg font-bold"
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, ...transition }}
			>
				{today.getDate()}
			</motion.span>
		</MotionButton>
	);
}
