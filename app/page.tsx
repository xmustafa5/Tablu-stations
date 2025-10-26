import React, { Suspense } from "react";
import { Calendar } from "@/components/calendar";
import { CalendarSkeleton } from "@/components/calendar-skeleton";
import Link from "next/link";
import { ArrowUpRight, CalendarIcon, GithubIcon, LinkIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
      <div className="container p-4 md:mx-auto">
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full border p-3">
                <CalendarIcon className="size-6 text-t-secondary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium leading-6">Full calendar</p>
                <div className="text-sm text-t-secondary">
                  Built with Next.js and Shadcn UI/Tailwind css by{" "}
                  <Link
                    href="https://github.com/yassir-jeraidi"
                    target="_blank"
                    className="inline-flex items-center gap-0.5 text-sm underline"
                  >
                    yassir-jeraidi
                    <ArrowUpRight size={12} className="mx-1 text-t-tertiary" />
                  </Link>
                  <Link
                    href="https://jeraidi.tech"
                    target="_blank"
                    className="block gap-0.5 text-sm underline"
                  >
                    <div className="inline-flex items-center underline">
                      Portfolio{" "}
                      <LinkIcon size={12} className="mx-1 text-t-tertiary" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Link
              href="https://github.com/yassir-jeraidi/full-calendar"
              className="flex justify-center items-center gap-2 underline"
            >
              <span className="hidden md:block">View on Github</span>
              <GithubIcon className="h-6 w-6 md:w-4 md:h-4" />
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