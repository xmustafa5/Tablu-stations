"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;
const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = (props: DialogPrimitive.DialogOverlayProps) => {
	return (
		<DialogPrimitive.Overlay
			{...props}
			className={cn(
				"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				props.className,
			)}
		/>
	);
};

const ModalVariants = cva(
	cn(
		// Base modal styles
		"fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out",
		"data-[state=open]:animate-in data-[state=closed]:animate-out",
		"data-[state=closed]:duration-300 data-[state=open]:duration-500",

		// Mobile: full screen bottom sheet
		"inset-x-0 bottom-0 border-t rounded-t-2xl",
		"max-h-[95dvh] overflow-y-auto p-4",
		"data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",

		// Desktop: centered dialog
		"sm:inset-auto sm:left-[50%] sm:top-[50%]",
		"sm:w-full sm:max-w-lg sm:max-h-[90dvh]",
		"sm:translate-x-[-50%] sm:translate-y-[-50%]",
		"sm:border sm:rounded-xl sm:p-6",
		"sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0",
		"sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0",
		"sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
	),
	{
		variants: {
			side: {
				top: "sm:top-[50%] sm:translate-y-[-50%]",
				bottom: "sm:top-[50%] sm:translate-y-[-50%]",
				left: "sm:top-[50%] sm:translate-y-[-50%]",
				right: "sm:top-[50%] sm:translate-y-[-50%]",
			},
		},
		defaultVariants: {
			side: "bottom",
		},
	},
);

type ModalContentProps = DialogPrimitive.DialogContentProps &
	VariantProps<typeof ModalVariants>;

const ModalContent = ({
	side = "bottom",
	className,
	children,
	...props
}: ModalContentProps) => {
	return (
		<ModalPortal>
			<ModalOverlay />
			<DialogPrimitive.Content
				{...props}
				aria-describedby="responsive-modal-description"
				className={cn(ModalVariants({ side }), className)}
			>
				{children}
				<ModalClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</ModalClose>
			</DialogPrimitive.Content>
		</ModalPortal>
	);
};

const ModalHeader = (props: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			props.className,
		)}
	/>
);

const ModalFooter = (props: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			props.className,
		)}
	/>
);

const ModalTitle = (props: DialogPrimitive.DialogTitleProps) => (
	<DialogPrimitive.Title
		{...props}
		className={cn("text-lg font-semibold text-foreground", props.className)}
	/>
);

const ModalDescription = (props: DialogPrimitive.DialogDescriptionProps) => (
	<DialogPrimitive.Description
		{...props}
		className={cn("text-sm text-muted-foreground", props.className)}
	/>
);

export {
	Modal,
	ModalPortal,
	ModalOverlay,
	ModalTrigger,
	ModalClose,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalTitle,
	ModalDescription,
};
