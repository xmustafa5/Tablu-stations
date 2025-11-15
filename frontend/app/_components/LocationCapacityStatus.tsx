"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocations } from "@/lib/hooks/use-locations";
import { useReservations } from "@/lib/hooks/use-reservations";
import { MapPin, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export function LocationCapacityStatus() {
  const { data: locations, isLoading: locationsLoading } = useLocations(false);
  const { data: reservationsData, isLoading: reservationsLoading } = useReservations({});

  const locationCapacityData = useMemo(() => {
    if (!locations || !reservationsData?.reservations) return [];

    return locations.map((location) => {
      // Count active reservations for this location
      const activeCount = reservationsData.reservations.filter(
        (res) =>
          res.location === location.name &&
          (res.status === "ACTIVE" || res.status === "WAITING" || res.status === "ENDING_SOON")
      ).length;

      const percentageFull = location.limit > 0 ? (activeCount / location.limit) * 100 : 0;
      const isFull = activeCount >= location.limit;
      const isNearlyFull = percentageFull >= 80 && !isFull;

      return {
        ...location,
        activeCount,
        percentageFull,
        isFull,
        isNearlyFull,
        remainingCapacity: Math.max(0, location.limit - activeCount),
      };
    });
  }, [locations, reservationsData]);

  const fullLocations = useMemo(
    () => locationCapacityData.filter((loc) => loc.isFull),
    [locationCapacityData]
  );

  const nearlyFullLocations = useMemo(
    () => locationCapacityData.filter((loc) => loc.isNearlyFull),
    [locationCapacityData]
  );

  const availableLocations = useMemo(
    () => locationCapacityData.filter((loc) => !loc.isFull && !loc.isNearlyFull),
    [locationCapacityData]
  );

  if (locationsLoading || reservationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            حالة سعة المواقع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          حالة سعة المواقع
        </CardTitle>
        <CardDescription>عرض استخدام السعة الحالية لجميع المواقع</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مواقع ممتلئة</p>
                  <p className="text-2xl font-bold text-red-600">{fullLocations.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">قرب الامتلاء</p>
                  <p className="text-2xl font-bold text-yellow-600">{nearlyFullLocations.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مواقع متاحة</p>
                  <p className="text-2xl font-bold text-green-600">{availableLocations.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Locations */}
          {fullLocations.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                المواقع الممتلئة
              </h3>
              <div className="space-y-3">
                {fullLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-lg">{loc.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {loc.description || "لا يوجد وصف"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                        ممتلئ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        الحجوزات النشطة: <span className="font-bold">{loc.activeCount}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        الحد الأقصى: <span className="font-bold">{loc.limit}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600" style={{ width: "100%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearly Full Locations */}
          {nearlyFullLocations.length > 0 && (
            <div>
              <h3 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                المواقع القريبة من الامتلاء (≥80%)
              </h3>
              <div className="space-y-3">
                {nearlyFullLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-lg">{loc.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {loc.description || "لا يوجد وصف"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">
                        {loc.percentageFull.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        الحجوزات النشطة: <span className="font-bold">{loc.activeCount}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        متبقي: <span className="font-bold">{loc.remainingCapacity}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        الحد الأقصى: <span className="font-bold">{loc.limit}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-600"
                        style={{ width: `${loc.percentageFull}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Locations */}
          {availableLocations.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                المواقع المتاحة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{loc.name}</p>
                      <span className="text-xs text-green-600 font-semibold">
                        {loc.percentageFull.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        {loc.activeCount} / {loc.limit}
                      </span>
                      <span>متبقي: {loc.remainingCapacity}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${loc.percentageFull}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {locationCapacityData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>لا توجد مواقع للعرض</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
