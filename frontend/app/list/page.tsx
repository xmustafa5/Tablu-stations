'use client';

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ReservationForm } from "@/app/_components/ReservationForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReservationTable } from "@/app/_components/ReservationTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useReservations,
  useCreateReservation,
  useUpdateReservation,
  useDeleteReservation,
} from "@/lib/hooks/use-reservations";
import { Reservation as ApiReservation, ReservationStatus as ApiStatus } from "@/lib/types/api.types";
import type { Reservation, ReservationStatus } from "@/app/_components/ReservationForm";

// Map API status to local status
const mapApiStatusToLocal = (apiStatus: ApiStatus): ReservationStatus => {
  const statusMap: Record<ApiStatus, ReservationStatus> = {
    [ApiStatus.WAITING]: "waiting",
    [ApiStatus.ACTIVE]: "active",
    [ApiStatus.ENDING_SOON]: "ending_soon",
    [ApiStatus.COMPLETED]: "completed",
  };
  return statusMap[apiStatus] || "waiting";
};

// Map local status to API status
const mapLocalStatusToApi = (localStatus: ReservationStatus): ApiStatus => {
  const statusMap: Record<ReservationStatus, ApiStatus> = {
    "waiting": ApiStatus.WAITING,
    "active": ApiStatus.ACTIVE,
    "ending_soon": ApiStatus.ENDING_SOON,
    "completed": ApiStatus.COMPLETED,
    "expired": ApiStatus.COMPLETED, // Map expired to completed in API
  };
  return statusMap[localStatus] || ApiStatus.WAITING;
};

// Convert API reservation to local format
const convertApiToLocal = (apiRes: ApiReservation): Reservation => ({
  id: apiRes.id,
  advertiserName: apiRes.advertiserName,
  customerName: apiRes.customerName,
  location: apiRes.location,
  startTime: apiRes.startTime.slice(0, 16), // Format for datetime-local input
  endTime: apiRes.endTime.slice(0, 16),
  status: mapApiStatusToLocal(apiRes.status),
});

export default function ListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch reservations from API
  const { data, isLoading } = useReservations({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? mapLocalStatusToApi(statusFilter as ReservationStatus) : undefined,
  });

  // Mutations
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

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

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsFormOpen(true);
  };

  const handleDeleteReservation = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
      });
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingReservation(undefined);
    }
    setIsFormOpen(open);
  };

  // Convert API reservations to local format with type guard
  const reservations = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data.map(convertApiToLocal);
  }, [data?.data]);

  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pr-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:shadow-md transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="waiting">قيد الانتظار</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="ending_soon">ينتهي قريباً</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
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

        {isLoading ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        ) : (
          <>
            <ReservationTable
              reservations={reservations}
              onEdit={handleEditReservation}
              onDelete={handleDeleteReservation}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    عرض {((page - 1) * limit) + 1} إلى {Math.min(page * limit, pagination.total)} من {pagination.total} نتيجة
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4 ml-1" />
                      السابق
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      صفحة {page} من {pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <ReservationForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSave={handleSaveReservation}
          editReservation={editingReservation}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحجز بشكل دائم.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
