'use client';

import React, { Suspense, useState } from "react";
import { Calendar } from "@/components/calendar";
import { CalendarSkeleton } from "@/components/calendar-skeleton";
import Link from "next/link";
import { Plus, CalendarIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationForm } from "@/app/_components/ReservationForm";
import { useCreateReservation, useUpdateReservation } from "@/lib/hooks/use-reservations";
import type { Reservation } from "@/app/_components/ReservationForm";
import type { IEvent } from "@/components/interfaces";
import { idMapping } from "@/components/calendar";

export default function CalendarPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();

  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();

  // Handle event click from calendar
  const handleEventClick = (event: IEvent, originalId: string) => {
    // Convert calendar event to reservation format using the original UUID
    const reservation: Reservation = {
      id: originalId, // Use the original UUID from the mapping
      advertiserName: event.advertiserName,
      customerName: event.customerName,
      location: event.location,
      startTime: new Date(event.startDate).toISOString().slice(0, 16),
      endTime: new Date(event.endDate).toISOString().slice(0, 16),
      status: event.status,
    };
    setEditingReservation(reservation);
    setIsFormOpen(true);
  };

  const handleSaveReservation = (reservation: Omit<Reservation, "id">) => {
    if (editingReservation) {
      // Update existing reservation
      updateMutation.mutate(
        {
          id: editingReservation.id,
          data: {
            advertiserName: reservation.advertiserName,
            customerName: reservation.customerName,
            location: reservation.location,
            startTime: new Date(reservation.startTime).toISOString(),
            endTime: new Date(reservation.endTime).toISOString(),
          },
        },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingReservation(undefined);
          },
        }
      );
    } else {
      // Create new reservation
      createMutation.mutate(
        {
          advertiserName: reservation.advertiserName,
          customerName: reservation.customerName,
          location: reservation.location,
          startTime: new Date(reservation.startTime).toISOString(),
          endTime: new Date(reservation.endTime).toISOString(),
        },
        {
          onSuccess: () => {
            setIsFormOpen(false);
          },
        }
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingReservation(undefined);
    }
    setIsFormOpen(open);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="container p-4 md:mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <CalendarIcon className="size-6 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium leading-6">نظام إدارة حجوزات اللوحات الإعلانية</p>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                نظام متكامل لإدارة حجوزات اللوحات الإعلانية في محطات الحافلات
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button
              onClick={() => setIsFormOpen(true)}
              className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Plus className="h-5 w-5 ml-2" />
              إضافة حجز
            </Button> */}
            <Link
              href="/list"
              className="flex justify-center items-center gap-2 px-4 py-2 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              <List className="h-4 w-4" />
              <span>عرض القائمة</span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<CalendarSkeleton />}>
          <Calendar onEventClick={handleEventClick} />
        </Suspense>

        {/* <ReservationForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSave={handleSaveReservation}
          editReservation={editingReservation}
        /> */}
      </div>
    </main>
  );
}