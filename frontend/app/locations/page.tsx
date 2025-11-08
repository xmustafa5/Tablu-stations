'use client';

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2, MapPin } from "lucide-react";
import { LocationForm, type LocationFormData } from "@/app/_components/LocationForm";
import { LocationTable, type Location } from "@/app/_components/LocationTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/lib/hooks/use-locations";

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch locations from API
  const { data: locations, isLoading } = useLocations(statusFilter === "all");

  // Mutations
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleSaveLocation = (data: LocationFormData) => {
    if (editingLocation) {
      // Update existing location
      updateMutation.mutate(
        {
          id: editingLocation.id,
          data,
        },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingLocation(undefined);
          },
        }
      );
    } else {
      // Create new location
      createMutation.mutate(
        data,
        {
          onSuccess: () => {
            setIsFormOpen(false);
          },
        }
      );
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const location = filteredLocations?.find(l => l.id === deleteId);
      const hasReservations = (location?._count?.reservations || 0) > 0;

      deleteMutation.mutate(
        { id: deleteId, hardDelete: !hasReservations },
        {
          onSuccess: () => {
            setDeleteId(null);
          },
        }
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingLocation(undefined);
    }
    setIsFormOpen(open);
  };

  // Filter locations based on search and status
  const filteredLocations = useMemo(() => {
    if (!locations) return [];

    return locations.filter((location) => {
      const matchesSearch = !searchQuery ||
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && location.isActive) ||
        (statusFilter === "inactive" && !location.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [locations, searchQuery, statusFilter]);

  const locationToDelete = filteredLocations?.find(l => l.id === deleteId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              إدارة المواقع
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            إدارة مواقع المحطات وتتبع الحجوزات الخاصة بكل موقع
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="البحث بالاسم أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:shadow-md transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">المواقع النشطة</SelectItem>
              <SelectItem value="inactive">المواقع غير النشطة</SelectItem>
              <SelectItem value="all">جميع المواقع</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <Plus className="h-5 w-5 ml-2" />
            إضافة موقع جديد
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        ) : (
          <LocationTable
            locations={filteredLocations}
            onEdit={handleEditLocation}
            onDelete={handleDeleteLocation}
          />
        )}

        <LocationForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSave={handleSaveLocation}
          editLocation={editingLocation}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                {locationToDelete?._count?.reservations ? (
                  <>
                    هذا الموقع يحتوي على {locationToDelete._count.reservations} حجز/حجوزات. سيتم إلغاء تفعيل الموقع بدلاً من حذفه.
                  </>
                ) : (
                  <>
                    هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الموقع بشكل دائم.
                  </>
                )}
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
                {locationToDelete?._count?.reservations ? "إلغاء التفعيل" : "حذف"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
