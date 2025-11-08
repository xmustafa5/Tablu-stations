import {
	CheckIcon,
	DotIcon,
	MoonIcon,
	PaletteIcon,
	SettingsIcon,
	SunMediumIcon,
	XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useCalendar } from "@/components/calendar-context";
import type { TCalendarView } from "@/components/types";
import { useDragDrop } from "@/components/dnd-context";

export function Settings() {
	const {
		badgeVariant,
		setBadgeVariant,
		use24HourFormat,
		toggleTimeFormat,
		view,
		setView,
		agendaModeGroupBy,
		setAgendaModeGroupBy,
	} = useCalendar();
	const { showConfirmation, setShowConfirmation } = useDragDrop();
	const { theme, setTheme } = useTheme();

	const isDarkMode = theme === "dark";
	const isDotVariant = badgeVariant === "dot";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<SettingsIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>إعدادات التقويم</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{/* <DropdownMenuItem>
						<div className="flex items-center justify-between w-full">
							<span>الوضع الليلي</span>
							<Switch
								checked={isDarkMode}
								onCheckedChange={(checked) =>
									setTheme(checked ? "dark" : "light")
								}
							/>
						</div>
					</DropdownMenuItem> */}
					<DropdownMenuItem>
						<div className="flex items-center justify-between w-full">
							<span>تأكيد السحب والإفلات</span>
							<Switch
								checked={showConfirmation}
								onCheckedChange={(checked) => setShowConfirmation(checked)}
							/>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<div className="flex items-center justify-between w-full">
							<span>استخدام نقاط الحالة</span>
							<Switch
								checked={isDotVariant}
								onCheckedChange={(checked) =>
									setBadgeVariant(checked ? "dot" : "colored")
								}
							/>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<div className="flex items-center justify-between w-full">
							<span>صيغة 24 ساعة</span>
							<Switch
								checked={use24HourFormat}
								onCheckedChange={toggleTimeFormat}
							/>
						</div>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>تجميع عرض الأجندة حسب</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={agendaModeGroupBy}
						onValueChange={(value) =>
							setAgendaModeGroupBy(value as "date" | "status")
						}
					>
						<DropdownMenuRadioItem value="date">التاريخ</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="status">الحالة</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
