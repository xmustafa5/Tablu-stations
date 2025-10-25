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
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  waiting: { label: "قيد الانتظار", variant: "secondary" },
  active: { label: "نشط", variant: "default" },
  ending_soon: { label: "ينتهي قريباً", variant: "outline" },
  completed: { label: "مكتمل", variant: "secondary" },
  expired: { label: "منتهي", variant: "destructive" },
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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>لا توجد حجوزات</p>
        <p className="text-sm mt-2">انقر على "إضافة حجز" لإنشاء أول حجز</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المعلن</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>الموقع</TableHead>
            <TableHead>وقت البداية</TableHead>
            <TableHead>وقت النهاية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.advertiserName}</TableCell>
              <TableCell>{reservation.customerName}</TableCell>
              <TableCell>{reservation.location}</TableCell>
              <TableCell>{formatDateTime(reservation.startTime)}</TableCell>
              <TableCell>{formatDateTime(reservation.endTime)}</TableCell>
              <TableCell>
                <Badge variant={statusConfig[reservation.status].variant}>
                  {statusConfig[reservation.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(reservation)}
                    title="تعديل الحجز"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(reservation.id)}
                    title="حذف الحجز"
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
