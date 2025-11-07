"use client";

import { useState } from "react";
import { AuthenticatedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/store/auth-context";
import { useUsers } from "@/lib/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Users as UsersIcon,
	Plus,
	Search,
	ChevronLeft,
	ChevronRight,
	Filter,
	UserCog,
} from "lucide-react";
import { Role, type User } from "@/lib/types/api.types";
import { UsersTable } from "@/components/users/UsersTable";
import { AddEditUserDialog } from "@/components/users/AddEditUserDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { UserStatsDialog } from "@/components/users/UserStatsDialog";
import { BulkUpdateDialog } from "@/components/users/BulkUpdateDialog";

function UsersPageContent() {
	const { user: currentUser } = useAuth();
	const isAdmin = currentUser?.role === "ADMIN";

	// State for filters
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");

	// Dialog states
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
	const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

	// Fetch users
	const { data, isLoading, error } = useUsers({
		page,
		limit,
		search: search || undefined,
		role: roleFilter === "all" ? undefined : (roleFilter as Role),
	});

	const users = data?.data || [];
	const pagination = data?.pagination;

	// Handle user selection for bulk operations
	const handleSelectUser = (userId: string) => {
		const newSelected = new Set(selectedUsers);
		if (newSelected.has(userId)) {
			newSelected.delete(userId);
		} else {
			newSelected.add(userId);
		}
		setSelectedUsers(newSelected);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(new Set(users.map((u) => u.id)));
		} else {
			setSelectedUsers(new Set());
		}
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (user: User) => {
		setSelectedUser(user);
		setIsDeleteDialogOpen(true);
	};

	const handleViewStats = (user: User) => {
		setSelectedUser(user);
		setIsStatsDialogOpen(true);
	};

	// Reset page when filters change
	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleRoleFilterChange = (value: string) => {
		setRoleFilter(value);
		setPage(1);
	};

	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<UsersIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
					</div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						غير مصرح
					</h1>
					<p className="text-slate-600 dark:text-slate-400">
						يجب أن تكون مديراً للوصول إلى هذه الصفحة.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<div className="container mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
								<UsersIcon className="w-7 h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
									إدارة المستخدمين
								</h1>
								<p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
									{pagination?.total || 0} مستخدم في النظام
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							{selectedUsers.size > 0 && (
								<Button
									onClick={() => setIsBulkUpdateDialogOpen(true)}
									variant="outline"
									className="gap-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
								>
									<UserCog className="w-4 h-4" />
									تحديث {selectedUsers.size}
								</Button>
							)}
							<Button
								onClick={() => setIsAddDialogOpen(true)}
								className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
							>
								<Plus className="w-4 h-4" />
								إضافة مستخدم
							</Button>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<Input
								placeholder="البحث بالاسم أو البريد الإلكتروني..."
								value={search}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500"
							/>
						</div>
						<div className="sm:w-64">
							<Select value={roleFilter} onValueChange={handleRoleFilterChange}>
								<SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
									<div className="flex items-center gap-2">
										<Filter className="w-4 h-4" />
										<SelectValue placeholder="جميع الأدوار" />
									</div>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">جميع الأدوار</SelectItem>
									<SelectItem value={Role.ADMIN}>المديرون</SelectItem>
									<SelectItem value={Role.USER}>المستخدمون</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Users Table */}
				<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
					<UsersTable
						users={users}
						isLoading={isLoading}
						selectedUsers={selectedUsers}
						onSelectUser={handleSelectUser}
						onSelectAll={handleSelectAll}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onViewStats={handleViewStats}
					/>

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
							<div className="text-sm text-slate-600 dark:text-slate-400">
								عرض {(page - 1) * limit + 1} إلى{" "}
								{Math.min(page * limit, pagination.total)} من {pagination.total} مستخدم
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page - 1)}
									disabled={page === 1}
									className="gap-2"
								>
									<ChevronRight className="w-4 h-4" />
									السابق
								</Button>
								<div className="flex items-center gap-1">
									{Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
										.filter((p) => {
											// Show first, last, current, and adjacent pages
											return (
												p === 1 ||
												p === pagination.totalPages ||
												Math.abs(p - page) <= 1
											);
										})
										.map((p, i, arr) => {
											// Add ellipsis
											const showEllipsis = i > 0 && p - arr[i - 1] > 1;
											return (
												<div key={p} className="flex items-center">
													{showEllipsis && (
														<span className="px-2 text-slate-400">...</span>
													)}
													<Button
														variant={p === page ? "default" : "outline"}
														size="sm"
														onClick={() => setPage(p)}
														className={
															p === page
																? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
																: ""
														}
													>
														{p}
													</Button>
												</div>
											);
										})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={page === pagination.totalPages}
									className="gap-2"
								>
									التالي
									<ChevronLeft className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Dialogs */}
			<AddEditUserDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				user={null}
			/>
			<AddEditUserDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				user={selectedUser}
			/>
			<DeleteUserDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				user={selectedUser}
			/>
			<UserStatsDialog
				open={isStatsDialogOpen}
				onOpenChange={setIsStatsDialogOpen}
				user={selectedUser}
			/>
			<BulkUpdateDialog
				open={isBulkUpdateDialogOpen}
				onOpenChange={setIsBulkUpdateDialogOpen}
				selectedUserIds={Array.from(selectedUsers)}
				selectedCount={selectedUsers.size}
			/>
		</div>
	);
}

export default function UsersPage() {
	return (
		<AuthenticatedRoute>
			<UsersPageContent />
		</AuthenticatedRoute>
	);
}
