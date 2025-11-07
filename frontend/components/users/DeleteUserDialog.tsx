"use client";

import { AlertTriangle } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/lib/types/api.types";
import { useDeleteUser } from "@/lib/hooks/use-users";

interface DeleteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
	const deleteMutation = useDeleteUser();

	const handleDelete = () => {
		if (!user) return;

		deleteMutation.mutate(user.id, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	};

	if (!user) return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
				<AlertDialogHeader className="pb-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
							<AlertTriangle className="w-6 h-6 text-white" />
						</div>
						<AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
							حذف المستخدم
						</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
						هل أنت متأكد من حذف المستخدم{" "}
						<span className="font-bold text-slate-900 dark:text-slate-100">
							{user.name}
						</span>{" "}
						({user.email})?
						<br />
						<br />
						<span className="inline-flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
							<AlertTriangle className="w-4 h-4 flex-shrink-0" />
							<span>
								تحذير: سيتم حذف جميع الحجوزات المرتبطة بهذا المستخدم. هذا الإجراء لا
								يمكن التراجع عنه!
							</span>
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
					<AlertDialogCancel
						disabled={deleteMutation.isPending}
						className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						إلغاء
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
						className="h-11 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
					>
						{deleteMutation.isPending ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
								<span>جاري الحذف...</span>
							</div>
						) : (
							"حذف المستخدم"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
