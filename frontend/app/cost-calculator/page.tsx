"use client";

import { useState, useMemo } from "react";
import { AuthenticatedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, TrendingUp, Eye, DollarSign, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocations } from "@/lib/hooks/use-locations";
import { toast } from "sonner";

interface CostCalculationResult {
  totalViewers: number;
  costPerView: number;
  locations: Array<{
    locationId: string;
    locationName: string;
    viewers: number;
    costShare: number;
  }>;
}

interface BestPlanResult {
  recommendedLocations: Array<{
    locationId: string;
    locationName: string;
    viewers: number;
    costPerView: number;
    efficiency: number;
  }>;
  totalViewers: number;
  totalCost: number;
  averageCostPerView: number;
}

export default function CostCalculatorPage() {
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [maxLocations, setMaxLocations] = useState<number>(5);
  const [costResults, setCostResults] = useState<CostCalculationResult | null>(null);
  const [bestPlanResults, setBestPlanResults] = useState<BestPlanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: locations, isLoading: locationsLoading } = useLocations(false);

  // Calculate days between dates
  const daysDifference = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  // Calculate viewers for a date range (proportional to monthly viewers)
  const calculateViewersForDateRange = (monthlyViewers: number, days: number): number => {
    // Assuming 30 days in a month for simplicity
    const dailyViewers = monthlyViewers / 30;
    return Math.round(dailyViewers * days);
  };

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleCalculate = () => {
    if (selectedLocationIds.length === 0) {
      toast.error("الرجاء اختيار موقع واحد على الأقل");
      return;
    }
    if (!totalCost || totalCost <= 0) {
      toast.error("الرجاء إدخال تكلفة صحيحة");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("الرجاء اختيار نطاق التاريخ");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    setIsCalculating(true);

    try {
      // Get selected locations
      const selectedLocations = locations?.filter(loc =>
        selectedLocationIds.includes(loc.id)
      ) || [];

      // Calculate total viewers for the date range
      let totalViewers = 0;
      const locationData = selectedLocations.map(location => {
        const viewers = calculateViewersForDateRange(
          location.monthlyViewers || 0,
          daysDifference
        );
        totalViewers += viewers;
        return {
          locationId: location.id,
          locationName: location.name,
          viewers,
          costShare: 0, // Will calculate after we know total
        };
      });

      // Calculate cost shares
      locationData.forEach(loc => {
        if (totalViewers > 0) {
          loc.costShare = (loc.viewers / totalViewers) * totalCost;
        }
      });

      // Calculate cost per view
      const costPerView = totalViewers > 0 ? totalCost / totalViewers : 0;

      setCostResults({
        totalViewers,
        costPerView,
        locations: locationData,
      });

      toast.success("تم حساب التكلفة بنجاح");
    } catch (error) {
      console.error("Error calculating cost:", error);
      toast.error("حدث خطأ في حساب التكلفة");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGetBestPlan = () => {
    if (!totalCost || totalCost <= 0) {
      toast.error("الرجاء إدخال تكلفة صحيحة");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("الرجاء اختيار نطاق التاريخ");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    setIsCalculating(true);

    try {
      // First, get all active locations with viewers
      const activeLocations = (locations || [])
        .filter(loc => loc.isActive && loc.monthlyViewers && loc.monthlyViewers > 0)
        .map(location => {
          const viewers = calculateViewersForDateRange(
            location.monthlyViewers || 0,
            daysDifference
          );
          return {
            locationId: location.id,
            locationName: location.name,
            viewers,
            monthlyViewers: location.monthlyViewers || 0,
          };
        })
        .sort((a, b) => b.viewers - a.viewers); // Sort by viewers (highest first)

      // Take top N locations
      const selectedLocations = activeLocations.slice(0, maxLocations);

      // Calculate total viewers for selected locations
      const totalViewersForSelected = selectedLocations.reduce(
        (sum, loc) => sum + loc.viewers,
        0
      );

      // Calculate cost per view for each selected location
      // Each location gets proportional cost based on its viewers
      const locationsWithCost = selectedLocations.map(location => {
        const locationShareOfViewers = location.viewers / totalViewersForSelected;
        const locationCost = totalCost * locationShareOfViewers;
        const costPerView = location.viewers > 0 ? locationCost / location.viewers : 0;

        return {
          locationId: location.locationId,
          locationName: location.locationName,
          viewers: location.viewers,
          costPerView,
          efficiency: location.viewers, // Efficiency is the number of viewers
        };
      });

      // Calculate average cost per view
      const averageCostPerView = totalViewersForSelected > 0 ? totalCost / totalViewersForSelected : 0;

      setBestPlanResults({
        recommendedLocations: locationsWithCost,
        totalViewers: totalViewersForSelected,
        totalCost,
        averageCostPerView,
      });

      toast.success("تم الحصول على أفضل خطة");
    } catch (error) {
      console.error("Error calculating best plan:", error);
      toast.error("حدث خطأ في حساب الخطة");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <AuthenticatedRoute>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  حاسبة تكلفة المشاهدات
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  احسب تكلفة المشاهدة واحصل على أفضل خطة للمواقع
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Parameters */}
            <div className="space-y-6">
              {/* Cost Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    معلمات الحساب
                  </CardTitle>
                  <CardDescription>أدخل التكلفة ونطاق التاريخ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="totalCost">التكلفة الإجمالية</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalCost || ""}
                      onChange={(e) => setTotalCost(Number(e.target.value))}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">تاريخ البداية</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">تاريخ النهاية</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  {daysDifference > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>المدة: {daysDifference} يوم</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    اختيار المواقع
                  </CardTitle>
                  <CardDescription>
                    تم اختيار {selectedLocationIds.length} موقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                  ) : locations && locations.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Checkbox
                            id={location.id}
                            checked={selectedLocationIds.includes(location.id)}
                            onCheckedChange={() => handleLocationToggle(location.id)}
                          />
                          <label
                            htmlFor={location.id}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="font-medium">{location.name}</p>
                            <p className="text-sm text-gray-500">
                              {location.monthlyViewers?.toLocaleString() || 0} مشاهدة شهرياً
                            </p>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد مواقع متاحة
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Two Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Calculate Cost Per View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    حساب تكلفة المشاهدة للمواقع المحددة
                  </CardTitle>
                  <CardDescription>
                    احسب تكلفة المشاهدة للمواقع التي اخترتها من القائمة على اليسار
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Calculator className="h-5 w-5 ml-2" />
                    {isCalculating ? "جاري الحساب..." : "احسب التكلفة"}
                  </Button>

                  {costResults && (
                    <div className="space-y-4 mt-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            إجمالي المشاهدات
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            {costResults.totalViewers?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            تكلفة المشاهدة الواحدة
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {costResults.costPerView?.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {/* Location Breakdown */}
                      <div>
                        <h3 className="font-semibold mb-3">توزيع المشاهدات والتكلفة</h3>
                        <div className="space-y-3">
                          {costResults.locations?.map((loc: any) => (
                            <div
                              key={loc.locationId}
                              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium">{loc.locationName}</p>
                                <p className="text-sm text-gray-500">
                                  {loc.viewers?.toLocaleString()} مشاهدة
                                </p>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">حصة التكلفة</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {loc.costShare?.toFixed(2)}
                                </p>
                              </div>
                              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600"
                                  style={{
                                    width: `${((loc.viewers / costResults.totalViewers) * 100) || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!costResults && (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">اضغط على "احسب التكلفة" لعرض النتائج</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 2: Best Plan Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    أفضل خطة موصى بها
                  </CardTitle>
                  <CardDescription>
                    احصل على توصيات تلقائية لأفضل المواقع من جميع المواقع المتاحة بناءً على الكفاءة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label htmlFor="maxLocations">الحد الأقصى للمواقع المقترحة</Label>
                      <p className="text-xs text-gray-500 mt-1 mb-2">سيتم اختيار أفضل المواقع تلقائياً من جميع المواقع المتاحة</p>
                      <Input
                        id="maxLocations"
                        type="number"
                        min="1"
                        max="20"
                        value={maxLocations}
                        onChange={(e) => setMaxLocations(Number(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                    <Button
                      onClick={handleGetBestPlan}
                      disabled={isCalculating}
                      className="h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <TrendingUp className="h-5 w-5 ml-2" />
                      {isCalculating ? "جاري التحليل..." : "احصل على أفضل خطة"}
                    </Button>
                  </div>

                  {bestPlanResults && (
                    <div className="space-y-4 mt-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            إجمالي المشاهدات المتوقعة
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {bestPlanResults.totalViewers?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            متوسط تكلفة المشاهدة
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {bestPlanResults.averageCostPerView?.toFixed(4)}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            عدد المواقع المقترحة
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {bestPlanResults.recommendedLocations?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Recommended Locations */}
                      <div>
                        <h3 className="font-semibold mb-3">المواقع المقترحة (مرتبة حسب الكفاءة)</h3>
                        <div className="space-y-3">
                          {bestPlanResults.recommendedLocations?.map((loc: any, index: number) => (
                            <div
                              key={loc.locationId}
                              className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-semibold text-lg">{loc.locationName}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {loc.viewers?.toLocaleString()} مشاهدة متوقعة
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">تكلفة المشاهدة</p>
                                      <p className="text-xl font-bold text-green-600">
                                        {loc.costPerView?.toFixed(4)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                        style={{
                                          width: `${((loc.efficiency / (bestPlanResults.recommendedLocations[0]?.efficiency || 1)) * 100) || 0}%`,
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      كفاءة: {loc.efficiency?.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-semibold mb-1">نصيحة:</p>
                            <p>
                              المواقع المدرجة أعلاه توفر أفضل قيمة لاستثمارك بناءً على عدد المشاهدين.
                              كلما ارتفعت الكفاءة، كانت التكلفة لكل مشاهدة أقل.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!bestPlanResults && (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">اضغط على "احصل على أفضل خطة" لعرض التوصيات</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}