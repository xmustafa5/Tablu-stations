import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transition } from "@/components/animations";
import type { ReservationStatus } from "@/components/interfaces";

const eventBulletVariants = cva("size-2 rounded-full", {
	variants: {
		status: {
			waiting: "bg-amber-600 dark:bg-amber-500",
			active: "bg-emerald-600 dark:bg-emerald-500",
			ending_soon: "bg-orange-600 dark:bg-orange-500",
			completed: "bg-blue-600 dark:bg-blue-500",
			expired: "bg-red-600 dark:bg-red-500",
		},
	},
	defaultVariants: {
		status: "waiting",
	},
});

export function EventBullet({
	status,
	className,
}: {
	status: ReservationStatus;
	className?: string;
}) {
	return (
		<motion.div
			className={cn(eventBulletVariants({ status, className }))}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.2 }}
			transition={transition}
		/>
	);
}
