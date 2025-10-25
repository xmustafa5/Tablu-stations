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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editReservation ? "تعديل الحجز" : "حجز جديد"}</DialogTitle>
          <DialogDescription>
            {editReservation ? "تعديل تفاصيل حجز اللوحة الإعلانية." : "إضافة حجز جديد للوحة إعلانية."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="advertiser">اسم المعلن</Label>
              <Input
                id="advertiser"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="أدخل اسم المعلن"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer">اسم العميل</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">موقع اللوحة</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الشارع الرئيسي - وسط المدينة، صالة 2 بالمطار"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">وقت بداية العرض</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">وقت نهاية العرض</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ReservationStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiting">قيد الانتظار</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="ending_soon">ينتهي قريباً</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">{editReservation ? "تحديث" : "إضافة"} الحجز</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
