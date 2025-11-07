"use client";

import { TrendingUp, BarChart3, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@/lib/types/api.types";
import { useUserStats } from "@/lib/hooks/use-users";
import { format } from "date-fns";

interface UserStatsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
}

export function UserStatsDialog({ open, onOpenChange, user }: UserStatsDialogProps) {
	const { data, isLoading } = useUserStats(user?.id || "");

	if (!user) return null;

	const stats = data?.data;

	const statusConfig = {
		WAITING: {
			label: "قيد الانتظار",
			icon: Clock,
			color: "amber",
			gradient: "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30",
			textColor: "text-amber-800 dark:text-amber-300",
			borderColor: "border-amber-200 dark:border-amber-700",
		},
		ACTIVE: {
			label: "نشط",
			icon: CheckCircle2,
			color: "emerald",
			gradient: "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30",
			textColor: "text-emerald-800 dark:text-emerald-300",
			borderColor: "border-emerald-200 dark:border-emerald-700",
		},
		ENDING_SOON: {
			label: "ينتهي قريباً",
			icon: TrendingUp,
			color: "purple",
			gradient: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
			textColor: "text-purple-800 dark:text-purple-300",
			borderColor: "border-purple-200 dark:border-purple-700",
		},
		COMPLETED: {
			label: "مكتمل",
			icon: CheckCircle2,
			color: "blue",
			gradient: "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30",
			textColor: "text-blue-800 dark:text-blue-300",
			borderColor: "border-blue-200 dark:border-blue-700",
		},
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
				<DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-3">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
							<BarChart3 className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
								إحصائيات المستخدم
							</DialogTitle>
							<DialogDescription className="text-slate-600 dark:text-slate-400 text-base mt-1">
								{user.name} ({user.email})
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
					</div>
				) : stats ? (
					<ScrollArea className="max-h-[70vh] px-1">
						<div className="space-y-5 py-4">
							{/* User Info Card */}
							<div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
											الدور
										</p>
										<Badge variant="outline" className="font-semibold">
											{stats.user.role === "ADMIN" ? "مدير" : "مستخدم"}
										</Badge>
									</div>
									<div>
										<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
											تاريخ الإنشاء
										</p>
										<p className="text-sm font-bold text-slate-900 dark:text-slate-100">
											{format(new Date(stats.user.createdAt), "dd/MM/yyyy")}
										</p>
									</div>
								</div>
							</div>

							{/* Total Reservations */}
							<div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
								<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
									<Calendar className="w-6 h-6 text-white" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
										إجمالي الحجوزات
									</p>
									<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
										{stats.reservations.total}
									</p>
								</div>
							</div>

							{/* Reservations by Status */}
							<div className="space-y-3">
								<h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
									<BarChart3 className="w-4 h-4" />
									الحجوزات حسب الحالة
								</h4>

								<div className="grid grid-cols-2 gap-3">
									{Object.entries(stats.reservations.byStatus).map(([status, count]) => {
										const config = statusConfig[status as keyof typeof statusConfig];
										if (!config) return null;

										const Icon = config.icon;

										return (
											<div
												key={status}
												className={`p-3 rounded-lg bg-gradient-to-r ${config.gradient} border ${config.borderColor}`}
											>
												<div className="flex items-center gap-2 mb-2">
													<Icon className={`w-4 h-4 ${config.textColor}`} />
													<p className={`text-xs font-semibold ${config.textColor}`}>
														{config.label}
													</p>
												</div>
												<p className={`text-2xl font-bold ${config.textColor}`}>
													{count}
												</p>
											</div>
										);
									})}
								</div>
							</div>

							{/* Stats Summary */}
							{stats.reservations.total === 0 && (
								<div className="text-center py-8">
									<XCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
									<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
										لا توجد حجوزات
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										لم يقم هذا المستخدم بإنشاء أي حجوزات بعد.
									</p>
								</div>
							)}
						</div>
					</ScrollArea>
				) : (
					<div className="text-center py-8">
						<XCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
						<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
							فشل تحميل الإحصائيات
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							حدث خطأ أثناء تحميل إحصائيات المستخدم.
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
