"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Shield, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { User as UserType, CreateUserRequest, UpdateUserRequest } from "@/lib/types/api.types";
import { Role } from "@/lib/types/api.types";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-users";

// Validation schema for creating user
const createUserSchema = z.object({
	name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
	email: z.string().email("البريد الإلكتروني غير صالح"),
	password: z
		.string()
		.min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف")
		.regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
		.regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير")
		.regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
	role: z.nativeEnum(Role),
});

// Validation schema for updating user
const updateUserSchema = z.object({
	name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
	email: z.string().email("البريد الإلكتروني غير صالح"),
	password: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val || val.length === 0) return true;
				if (val.length < 8) return false;
				if (!/[A-Z]/.test(val)) return false;
				if (!/[a-z]/.test(val)) return false;
				if (!/[0-9]/.test(val)) return false;
				return true;
			},
			{
				message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم",
			}
		),
	role: z.nativeEnum(Role),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;

interface AddEditUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: UserType | null;
}

export function AddEditUserDialog({ open, onOpenChange, user }: AddEditUserDialogProps) {
	const isEditing = !!user;
	const createMutation = useCreateUser();
	const updateMutation = useUpdateUser();

	const form = useForm<CreateFormData | UpdateFormData>({
		resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
		defaultValues: {
			name: user?.name || "",
			email: user?.email || "",
			password: "",
			role: user?.role || Role.USER,
		},
	});

	// Reset form when dialog opens/closes or user changes
	useEffect(() => {
		if (open) {
			form.reset({
				name: user?.name || "",
				email: user?.email || "",
				password: "",
				role: user?.role || Role.USER,
			});
		}
	}, [open, user, form]);

	const onSubmit = (values: CreateFormData | UpdateFormData) => {
		if (isEditing && user) {
			const updateData: UpdateUserRequest = {
				name: values.name,
				email: values.email,
				role: values.role,
			};

			// Only include password if it was provided
			if (values.password && values.password.length > 0) {
				updateData.password = values.password;
			}

			updateMutation.mutate(
				{ id: user.id, data: updateData },
				{
					onSuccess: () => {
						onOpenChange(false);
						form.reset();
					},
				}
			);
		} else {
			const createData: CreateUserRequest = {
				name: values.name,
				email: values.email,
				password: values.password as string,
				role: values.role,
			};

			createMutation.mutate(createData, {
				onSuccess: () => {
					onOpenChange(false);
					form.reset();
				},
			});
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
				<DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
							<User className="w-6 h-6 text-white" />
						</div>
						<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
							{isEditing ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
						</DialogTitle>
					</div>
					<DialogDescription className="text-slate-600 dark:text-slate-400 text-base">
						{isEditing
							? "تعديل بيانات المستخدم في النظام."
							: "إضافة مستخدم جديد إلى النظام."}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 py-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel
										htmlFor="name"
										className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2"
									>
										<UserCircle className="w-4 h-4 text-purple-600" />
										الاسم الكامل
									</FormLabel>
									<FormControl>
										<Input
											id="name"
											placeholder="أدخل الاسم الكامل"
											{...field}
											className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 rounded-lg ${
												fieldState.invalid ? "border-red-500" : ""
											}`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel
										htmlFor="email"
										className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2"
									>
										<Mail className="w-4 h-4 text-blue-600" />
										البريد الإلكتروني
									</FormLabel>
									<FormControl>
										<Input
											id="email"
											type="email"
											placeholder="user@example.com"
											{...field}
											className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg ${
												fieldState.invalid ? "border-red-500" : ""
											}`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field, fieldState }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel
										htmlFor="password"
										className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2"
									>
										<Lock className="w-4 h-4 text-emerald-600" />
										كلمة المرور
										{isEditing && (
											<span className="text-xs font-normal text-slate-500">
												(اتركه فارغاً إذا لم ترغب في التغيير)
											</span>
										)}
									</FormLabel>
									<FormControl>
										<Input
											id="password"
											type="password"
											placeholder={isEditing ? "••••••••" : "أدخل كلمة المرور"}
											{...field}
											className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 rounded-lg ${
												fieldState.invalid ? "border-red-500" : ""
											}`}
										/>
									</FormControl>
									<FormDescription className="text-xs text-slate-500 dark:text-slate-400">
										{!isEditing &&
											"يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem className="grid gap-2.5">
									<FormLabel
										htmlFor="role"
										className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2"
									>
										<Shield className="w-4 h-4 text-indigo-600" />
										الدور
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger
												id="role"
												className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 rounded-lg"
											>
												<SelectValue placeholder="اختر الدور" />
											</SelectTrigger>
										</FormControl>
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
									<FormDescription className="text-xs text-slate-500 dark:text-slate-400">
										المديرون لديهم صلاحيات كاملة في النظام
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						إلغاء
					</Button>
					<Button
						type="submit"
						onClick={form.handleSubmit(onSubmit)}
						disabled={isLoading}
						className="h-11 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
								<span>جاري الحفظ...</span>
							</div>
						) : isEditing ? (
							"تحديث"
						) : (
							"إضافة"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
