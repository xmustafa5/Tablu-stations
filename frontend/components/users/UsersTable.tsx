"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
	User,
	Pencil,
	Trash2,
	Shield,
	ShieldCheck,
	MoreVertical,
	Mail,
	Calendar,
	TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as UserType } from "@/lib/types/api.types";
import { Role } from "@/lib/types/api.types";

interface UsersTableProps {
	users: UserType[];
	isLoading?: boolean;
	selectedUsers: Set<string>;
	onSelectUser: (userId: string) => void;
	onSelectAll: (checked: boolean) => void;
	onEdit: (user: UserType) => void;
	onDelete: (user: UserType) => void;
	onViewStats: (user: UserType) => void;
}

const getRoleBadge = (role: Role) => {
	const config = {
		[Role.ADMIN]: {
			label: "مدير",
			icon: ShieldCheck,
			className:
				"bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 dark:border-purple-700",
		},
		[Role.USER]: {
			label: "مستخدم",
			icon: Shield,
			className:
				"bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-700",
		},
	};

	const { label, icon: Icon, className } = config[role];

	return (
		<Badge variant="outline" className={`gap-1.5 font-semibold ${className}`}>
			<Icon className="w-3.5 h-3.5" />
			{label}
		</Badge>
	);
};

export function UsersTable({
	users,
	isLoading,
	selectedUsers,
	onSelectUser,
	onSelectAll,
	onEdit,
	onDelete,
	onViewStats,
}: UsersTableProps) {
	const allSelected = users.length > 0 && users.every((u) => selectedUsers.has(u.id));
	const someSelected = users.some((u) => selectedUsers.has(u.id)) && !allSelected;

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (!users || users.length === 0) {
		return (
			<div className="text-center py-12">
				<User className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
				<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
					لا توجد مستخدمين
				</h3>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					لم يتم العثور على أي مستخدمين. جرب تغيير معايير البحث.
				</p>
			</div>
		);
	}

	return (
		<div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
						<TableHead className="w-12">
							<Checkbox
								checked={allSelected}
								onCheckedChange={onSelectAll}
								aria-label="تحديد الكل"
								className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
								ref={(el) => {
									if (el) {
										// @ts-ignore
										el.indeterminate = someSelected;
									}
								}}
							/>
						</TableHead>
						<TableHead className="font-bold text-slate-700 dark:text-slate-300">
							<div className="flex items-center gap-2">
								<User className="w-4 h-4" />
								المستخدم
							</div>
						</TableHead>
						<TableHead className="font-bold text-slate-700 dark:text-slate-300">
							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4" />
								البريد الإلكتروني
							</div>
						</TableHead>
						<TableHead className="font-bold text-slate-700 dark:text-slate-300">
							<div className="flex items-center gap-2">
								<Shield className="w-4 h-4" />
								الدور
							</div>
						</TableHead>
						<TableHead className="font-bold text-slate-700 dark:text-slate-300">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								تاريخ الإنشاء
							</div>
						</TableHead>
						<TableHead className="text-left font-bold text-slate-700 dark:text-slate-300">
							الإجراءات
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow
							key={user.id}
							className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
						>
							<TableCell>
								<Checkbox
									checked={selectedUsers.has(user.id)}
									onCheckedChange={() => onSelectUser(user.id)}
									aria-label={`تحديد ${user.name}`}
									className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
								/>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
										<span className="text-white font-bold text-sm">
											{user.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className="font-semibold text-slate-900 dark:text-slate-100">
											{user.name}
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											ID: {user.id.slice(0, 8)}...
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<p className="text-slate-700 dark:text-slate-300 font-medium">
									{user.email}
								</p>
							</TableCell>
							<TableCell>{getRoleBadge(user.role)}</TableCell>
							<TableCell>
								<div className="text-sm">
									<p className="text-slate-700 dark:text-slate-300 font-medium">
										{format(new Date(user.createdAt), "dd/MM/yyyy")}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{format(new Date(user.createdAt), "hh:mm a")}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
										>
											<span className="sr-only">فتح القائمة</span>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onViewStats(user)}
											className="cursor-pointer"
										>
											<TrendingUp className="mr-2 h-4 w-4" />
											<span>عرض الإحصائيات</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onEdit(user)}
											className="cursor-pointer"
										>
											<Pencil className="mr-2 h-4 w-4" />
											<span>تعديل</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete(user)}
											className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											<span>حذف</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
