"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  List,
  MapPin,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useLogout } from "@/lib/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: "لوحة التحكم",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "التقويم",
    href: "/",
    icon: Calendar,
  },
  {
    name: "قائمة الحجوزات",
    href: "/list",
    icon: List,
  },
  {
    name: "المواقع",
    href: "/locations",
    icon: MapPin,
  },
  {
    name: "الحجوزات",
    href: "/reservations",
    icon: BarChart3,
  },
  {
    name: "المستخدمين",
    href: "/users",
    icon: Users,
  },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-3">
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-end transition-all duration-300",
                "hover:translate-x-2"
              )}
            >
              {/* Label - Hidden behind, revealed on hover */}
              <div
                className={cn(
                  "absolute right-14 px-4 py-2 rounded-lg shadow-lg border whitespace-nowrap",
                  "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                  "transition-all duration-300 pointer-events-none",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-200 border-slate-700"
                )}
              >
                <span className="font-medium">{item.name}</span>
              </div>

              {/* Icon Button */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "transition-all duration-300 shadow-lg",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/50 scale-110"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 hover:scale-105"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full" />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-700 my-2" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "group relative flex items-center justify-end transition-all duration-300",
            "hover:translate-x-2"
          )}
        >
          {/* Label */}
          <div
            className={cn(
              "absolute right-14 px-4 py-2 rounded-lg shadow-lg border whitespace-nowrap",
              "bg-slate-800 text-slate-200 border-slate-700",
              "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
              "transition-all duration-300 pointer-events-none"
            )}
          >
            <span className="font-medium">تسجيل الخروج</span>
          </div>

          {/* Icon Button */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10",
              "transition-all duration-300 shadow-lg hover:scale-105"
            )}
          >
            <LogOut className="w-5 h-5" />
          </div>
        </button>
      </div>
    </aside>
  );
}
