'use client';
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Reservation, ReservationForm } from "./_components/ReservationForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReservationTable } from "./_components/ReservationTable";

export default function App() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      advertiserName: "شركة الحلول التقنية",
      customerName: "أحمد محمد",
      location: "شارع الرئيسي - وسط المدينة",
      startTime: "2025-10-15T09:00",
      endTime: "2025-10-22T17:00",
      status: "waiting",
    },
    {
      id: "2",
      advertiserName: "شركة الأزياء العصرية",
      customerName: "سارة علي",
      location: "المركز التجاري - المدخل الشمالي",
      startTime: "2025-10-10T08:00",
      endTime: "2025-10-13T20:00",
      status: "ending_soon",
    },
    {
      id: "3",
      advertiserName: "مطعم المدينة",
      customerName: "خالد حسن",
      location: "مطار المدينة - صالة 2",
      startTime: "2025-09-20T10:00",
      endTime: "2025-10-05T18:00",
      status: "completed",
    },
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSaveReservation = (reservation: Omit<Reservation, "id">) => {
    if (editingReservation) {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === editingReservation.id ? { ...reservation, id: r.id } : r
        )
      );
      setEditingReservation(undefined);
    } else {
      const newReservation: Reservation = {
        ...reservation,
        id: Date.now().toString(),
      };
      setReservations((prev) => [...prev, newReservation]);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsFormOpen(true);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingReservation(undefined);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesSearch =
        reservation.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              حجوزات محطة الحافلات
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            إدارة حجوزات اللوحات الإعلانية بمحطات الحافلات وتتبع حالتها
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="البحث بالمعلن أو العميل أو الموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:shadow-md transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px] h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="waiting">قيد الانتظار</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="ending_soon">ينتهي قريباً</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="expired">منتهي</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <Plus className="h-5 w-5 ml-2" />
            إضافة حجز
          </Button>
        </div>

        <ReservationTable
          reservations={filteredReservations}
          onEdit={handleEditReservation}
          onDelete={handleDeleteReservation}
        />

        <ReservationForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSave={handleSaveReservation}
          editReservation={editingReservation}
        />
      </div>
    </div>
  );
}
