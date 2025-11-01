import React, { Suspense } from "react";
import { Calendar } from "@/components/calendar";
import { CalendarSkeleton } from "@/components/calendar-skeleton";
import Link from "next/link";
import { ArrowUpRight, CalendarIcon, GithubIcon, LinkIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="container p-4 md:mx-auto">
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full border p-3">
                <CalendarIcon className="size-6 text-t-secondary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium leading-6">نظام إدارة حجوزات اللوحات الإعلانية</p>
                <div className="text-sm text-t-secondary">
                  نظام متكامل لإدارة حجوزات اللوحات الإعلانية في محطات الحافلات
                </div>
              </div>
            </div>
          </div>
          <div>
            <Link
              href="/list"
              className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>عرض القائمة</span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<CalendarSkeleton />}>
          <Calendar />
        </Suspense>
      </div>
    </main>
  );
}