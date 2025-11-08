import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, CheckCircle, XCircle, Activity } from "lucide-react";

export interface Location {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: {
    reservations: number;
  };
}

interface LocationTableProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
}

export function LocationTable({ locations, onEdit, onDelete }: LocationTableProps) {
  if (locations.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">لا توجد مواقع</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">انقر على "إضافة موقع جديد" لإنشاء أول موقع</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200 dark:border-slate-700 hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/50">
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">الاسم</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">الوصف</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">الحالة</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-base">عدد الحجوزات</TableHead>
            <TableHead className="text-left text-slate-700 dark:text-slate-300 font-bold text-base">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow
              key={location.id}
              className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
            >
              <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                {location.name}
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300">
                {location.description || "-"}
              </TableCell>
              <TableCell>
                {location.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-3.5 w-3.5" />
                    نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                    <XCircle className="h-3.5 w-3.5" />
                    غير نشط
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold text-sm border border-blue-200 dark:border-blue-800">
                  <Activity className="h-4 w-4" />
                  {location._count?.reservations || 0}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex justify-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(location)}
                    title="تعديل الموقع"
                    className="h-9 w-9 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(location.id)}
                    title="حذف الموقع"
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
