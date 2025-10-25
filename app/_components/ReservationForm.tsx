import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ReservationStatus = "waiting" | "active" | "ending_soon" | "completed" | "expired";

export interface Reservation {
  id: string;
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reservation: Omit<Reservation, "id">) => void;
  editReservation?: Reservation;
}

export function ReservationForm({ open, onOpenChange, onSave, editReservation }: ReservationFormProps) {
  const [advertiserName, setAdvertiserName] = useState(editReservation?.advertiserName || "");
  const [customerName, setCustomerName] = useState(editReservation?.customerName || "");
  const [location, setLocation] = useState(editReservation?.location || "");
  const [startTime, setStartTime] = useState(editReservation?.startTime || "");
  const [endTime, setEndTime] = useState(editReservation?.endTime || "");
  const [status, setStatus] = useState<ReservationStatus>(editReservation?.status || "waiting");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      advertiserName,
      customerName,
      location,
      startTime,
      endTime,
      status,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAdvertiserName("");
    setCustomerName("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setStatus("waiting");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {editReservation ? "تعديل الحجز" : "حجز جديد"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base">
            {editReservation ? "تعديل تفاصيل حجز اللوحة الإعلانية." : "إضافة حجز جديد للوحة إعلانية."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label htmlFor="advertiser" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                اسم المعلن
              </Label>
              <Input
                id="advertiser"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="أدخل اسم المعلن"
                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                required
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="customer" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اسم العميل
              </Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                required
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                موقع اللوحة
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الشارع الرئيسي - وسط المدينة، صالة 2 بالمطار"
                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2.5">
                <Label htmlFor="startTime" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  وقت البداية
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  required
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="endTime" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  وقت النهاية
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                الحالة
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ReservationStatus)}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="waiting">قيد الانتظار</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="ending_soon">ينتهي قريباً</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-11 px-6 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              {editReservation ? "تحديث" : "إضافة"} الحجز
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
