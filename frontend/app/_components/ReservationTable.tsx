import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reservation, ReservationStatus } from "./ReservationForm";
import { Edit, Trash2 } from "lucide-react";

interface ReservationTableProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<
  ReservationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  waiting: {
    label: "قيد الانتظار",
    variant: "secondary",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
  },
  active: {
    label: "نشط",
    variant: "default",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
  },
  ending_soon: {
    label: "ينتهي قريباً",
    variant: "outline",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
  },
  completed: {
    label: "مكتمل",
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
  },
  expired: {
    label: "منتهي",
    variant: "destructive",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
  },
};

export function ReservationTable({ reservations, onEdit, onDelete }: ReservationTableProps) {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">لا توجد حجوزات</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">انقر على "إضافة حجز" لإنشاء أول حجز</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200 dark:border-slate-700 hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/50">
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">المعلن</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">العميل</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">الموقع</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">وقت البداية</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">وقت النهاية</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">الحالة</TableHead>
            <TableHead className="text-left text-slate-700 dark:text-slate-300 font-bold text-base">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations?.map((reservation) => (
            <TableRow
              key={reservation.id}
              className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
            >
              <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                {reservation.advertiserName}
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300">
                {reservation.customerName}
              </TableCell>
              <TableCell className="text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {reservation.location}
                </div>
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(reservation.startTime)}
                </div>
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(reservation.endTime)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusConfig[reservation.status].variant}
                  className={`${statusConfig[reservation.status].className} px-3 py-1 font-semibold rounded-full`}
                >
                  {statusConfig[reservation.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex justify-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(reservation)}
                    title="تعديل الحجز"
                    className="h-9 w-9 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(reservation.id)}
                    title="حذف الحجز"
                    className="h-9 w-9 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
