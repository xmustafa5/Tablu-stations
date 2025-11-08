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
    <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-3">
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative block"
            >
              {/* Container that slides - contains both icon and label */}
              <div
                className={cn(
                  "flex items-center gap-3 h-12 rounded-r-xl shadow-lg border-r border-y overflow-hidden",
                  "transition-all duration-300",
                  "w-12 pl-3 pr-0 group-hover:w-auto group-hover:pr-4",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label - Hidden, revealed on hover */}
                <span
                  className={cn(
                    "font-medium whitespace-nowrap transition-all duration-300",
                    "opacity-0 max-w-0 overflow-hidden",
                    "group-hover:opacity-100 group-hover:max-w-xs"
                  )}
                >
                  {item.name}
                </span>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full z-20" />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-700 my-2 w-12" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative block"
        >
          {/* Container that slides - contains both icon and label */}
          <div
            className={cn(
              "flex items-center gap-3 h-12 rounded-r-xl shadow-lg border-r border-y overflow-hidden",
              "bg-slate-800 text-slate-400 hover:text-red-400 border-slate-700",
              "transition-all duration-300",
              "w-12 pl-3 pr-0 group-hover:w-auto group-hover:pr-4"
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>

            {/* Label - Hidden, revealed on hover */}
            <span
              className={cn(
                "font-medium whitespace-nowrap transition-all duration-300",
                "opacity-0 max-w-0 overflow-hidden",
                "group-hover:opacity-100 group-hover:max-w-xs"
              )}
            >
              تسجيل الخروج
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
