"use client";

import { Users, Shield } from "lucide-react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Role } from "@/lib/types/api.types";
import { useBulkUpdateUsers } from "@/lib/hooks/use-users";

interface BulkUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUserIds: string[];
	selectedCount: number;
}

export function BulkUpdateDialog({
	open,
	onOpenChange,
	selectedUserIds,
	selectedCount,
}: BulkUpdateDialogProps) {
	const [role, setRole] = useState<Role>(Role.USER);
	const bulkUpdateMutation = useBulkUpdateUsers();

	const handleBulkUpdate = () => {
		bulkUpdateMutation.mutate(
			{
				userIds: selectedUserIds,
				role,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
				<DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
							<Users className="w-6 h-6 text-white" />
						</div>
						<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
							تحديث جماعي للمستخدمين
						</DialogTitle>
					</div>
					<DialogDescription className="text-slate-600 dark:text-slate-400 text-base">
						تحديث دور {selectedCount} مستخدم محدد.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-6">
					<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
								<Users className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
									المستخدمون المحددون
								</p>
								<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{selectedCount}
								</p>
							</div>
						</div>
					</div>

					<div className="grid gap-3">
						<Label
							htmlFor="bulk-role"
							className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2"
						>
							<Shield className="w-4 h-4 text-indigo-600" />
							الدور الجديد
						</Label>
						<Select onValueChange={(value) => setRole(value as Role)} value={role}>
							<SelectTrigger
								id="bulk-role"
								className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 rounded-lg"
							>
								<SelectValue placeholder="اختر الدور" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={Role.USER}>
									<div className="flex items-center gap-2">
										<Shield className="w-4 h-4 text-blue-600" />
										<span>مستخدم</span>
									</div>
								</SelectItem>
								<SelectItem value={Role.ADMIN}>
									<div className="flex items-center gap-2">
										<Shield className="w-4 h-4 text-purple-600" />
										<span>مدير</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							سيتم تحديث دور جميع المستخدمين المحددين إلى الدور المختار.
						</p>
					</div>
				</div>

				<DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={bulkUpdateMutation.isPending}
						className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						إلغاء
					</Button>
					<Button
						type="submit"
						onClick={handleBulkUpdate}
						disabled={bulkUpdateMutation.isPending}
						className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
					>
						{bulkUpdateMutation.isPending ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
								<span>جاري التحديث...</span>
							</div>
						) : (
							`تحديث ${selectedCount} مستخدم`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
