"use client";

import { AuthenticatedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDashboardStats,
  useReservationsByStatus,
  useOccupancyStats,
  usePopularLocations,
  useReservationTrends,
  useGrowthMetrics,
  useCustomerMetrics,
  usePerformanceMetrics,
  usePeakHours,
  useDayOfWeekAnalysis,
  useForecast,
} from "@/lib/hooks/use-analytics";
import { LocationCapacityStatus } from "@/app/_components/LocationCapacityStatus";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Activity,
  Users,
  Clock,
  MapPin,
  BarChart3,
} from "lucide-react";
import { useMemo } from "react";

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const STATUS_COLORS: Record<string, string> = {
  waiting: COLORS.warning,
  active: COLORS.success,
  endingSoon: COLORS.purple,
  completed: COLORS.primary,
};

export default function AnalyticsPage() {
  // Calculate date ranges - useMemo to prevent recalculation on every render
  const { today, thirtyDaysAgo, sixtyDaysAgo } = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    return {
      today: today.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      sixtyDaysAgo: sixtyDaysAgo.toISOString(),
    };
  }, []);

  // Fetch all statistics (REAL DATA ONLY)
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardStats();
  const { data: statusBreakdown, isLoading: statusLoading } = useReservationsByStatus();
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancyStats(thirtyDaysAgo, today);
  const { data: popularLocations, isLoading: locationsLoading } = usePopularLocations();
  const { data: trends, isLoading: trendsLoading } = useReservationTrends(thirtyDaysAgo, today, "day");
  const { data: growth } = useGrowthMetrics(thirtyDaysAgo, today, sixtyDaysAgo, thirtyDaysAgo);
  const { data: customers, isLoading: customersLoading } = useCustomerMetrics(thirtyDaysAgo, today);
  const { data: performance, isLoading: performanceLoading } = usePerformanceMetrics(thirtyDaysAgo, today);
  const { data: peakHours, isLoading: peakHoursLoading } = usePeakHours(thirtyDaysAgo, today);
  const { data: dayOfWeek, isLoading: dayOfWeekLoading } = useDayOfWeekAnalysis(thirtyDaysAgo, today);
  const { data: forecast, isLoading: forecastLoading } = useForecast(30, 7);

  // Prepare status breakdown data for pie chart
  const statusChartData = useMemo(() => {
    if (!statusBreakdown) return [];
    return [
      { name: "في الانتظار", value: statusBreakdown.waiting, color: STATUS_COLORS.waiting },
      { name: "نشط", value: statusBreakdown.active, color: STATUS_COLORS.active },
      { name: "ينتهي قريباً", value: statusBreakdown.endingSoon, color: STATUS_COLORS.endingSoon },
      { name: "مكتمل", value: statusBreakdown.completed, color: STATUS_COLORS.completed },
    ];
  }, [statusBreakdown]);

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
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  لوحة التحليلات والإحصائيات
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  تحليل شامل للحجوزات والأداء - بيانات حقيقية 100%
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Dashboard Overview Stats - ALL DATA */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              نظرة عامة على لوحة التحكم - جميع الإحصائيات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Reservations */}
              <Card className="border-t-4 border-t-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardLoading ? "..." : dashboard?.totalReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total Reservations</p>
                </CardContent>
              </Card>

              {/* Active Reservations */}
              <Card className="border-t-4 border-t-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الحجوزات النشطة</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardLoading ? "..." : dashboard?.activeReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active Reservations</p>
                </CardContent>
              </Card>

              {/* Completed Reservations */}
              <Card className="border-t-4 border-t-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الحجوزات المكتملة</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardLoading ? "..." : dashboard?.completedReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Completed Reservations</p>
                </CardContent>
              </Card>

              {/* Pending Reservations */}
              <Card className="border-t-4 border-t-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الحجوزات المعلقة</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {dashboardLoading ? "..." : dashboard?.pendingReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pending Reservations</p>
                </CardContent>
              </Card>

              {/* Waiting Reservations */}
              <Card className="border-t-4 border-t-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {dashboardLoading ? "..." : dashboard?.waitingReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Waiting Reservations</p>
                </CardContent>
              </Card>

              {/* Ending Soon Reservations */}
              <Card className="border-t-4 border-t-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ينتهي قريباً</CardTitle>
                  <Activity className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {dashboardLoading ? "..." : dashboard?.endingSoonReservations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ending Soon</p>
                </CardContent>
              </Card>

              {/* Average Duration */}
              <Card className="border-t-4 border-t-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">متوسط مدة الحجز</CardTitle>
                  <Clock className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">
                    {dashboardLoading ? "..." : dashboard?.averageReservationDuration?.toFixed(1) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ساعة (Hours)</p>
                </CardContent>
              </Card>

              {/* Occupancy Rate */}
              <Card className="border-t-4 border-t-teal-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الإشغال</CardTitle>
                  <BarChart3 className="h-4 w-4 text-teal-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-teal-600">
                    {dashboardLoading ? "..." : `${dashboard?.occupancyRate?.toFixed(1) || 0}%`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Occupancy Rate</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Growth Metrics */}
          {growth && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                معدل النمو
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>مقارنة النمو</CardTitle>
                  <CardDescription>مقارنة آخر 30 يوم مع الـ 30 يوم السابقة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">الفترة السابقة</p>
                      <p className="text-2xl font-bold">{growth.previousPeriodReservations}</p>
                      <p className="text-xs text-gray-400">حجز</p>
                    </div>
                    <div className="text-center">
                      {growth.growthPercentage >= 0 ? (
                        <TrendingUp className="h-16 w-16 text-green-500 mx-auto" />
                      ) : (
                        <TrendingDown className="h-16 w-16 text-red-500 mx-auto" />
                      )}
                      <p
                        className={`text-3xl font-bold ${growth?.growthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {growth?.growthPercentage >= 0 ? "+" : ""}
                        {growth?.growthPercentage?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-gray-400">معدل النمو</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">الفترة الحالية</p>
                      <p className="text-2xl font-bold">{growth.currentPeriodReservations}</p>
                      <p className="text-xs text-gray-400">حجز</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Status Distribution & Trends */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              توزيع الحجوزات والاتجاهات
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الحجوزات حسب الحالة</CardTitle>
                  <CardDescription>التوزيع الحالي للحجوزات</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Reservation Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>اتجاهات الحجوزات اليومية</CardTitle>
                  <CardDescription>آخر 30 يوم</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(date) => new Date(date).toLocaleDateString("ar-SA")}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          name="عدد الحجوزات"
                          dot={{ fill: COLORS.primary, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Occupancy & Locations */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              الإشغال والمواقع
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>معدل الإشغال حسب الموقع</CardTitle>
                  <CardDescription>
                    الإشغال الإجمالي: {occupancyLoading ? "..." : `${occupancy?.overallOccupancyRate || 0}%`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {occupancyLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={occupancy?.locationOccupancy || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="location" type="category" width={100} />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                        <Bar dataKey="occupancyRate" fill={COLORS.indigo} name="معدل الإشغال %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Popular Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>المواقع الأكثر شعبية</CardTitle>
                  <CardDescription>حسب عدد الحجوزات وساعات الحجز</CardDescription>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={popularLocations || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={COLORS.purple} name="عدد الحجوزات" />
                        <Bar dataKey="totalHours" fill={COLORS.teal} name="إجمالي الساعات" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Peak Hours & Day of Week */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              التحليل الزمني
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>ساعات الذروة</CardTitle>
                  <CardDescription>تحليل الحجوزات حسب ساعات اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  {peakHoursLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={peakHours || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                        <YAxis />
                        <Tooltip labelFormatter={(hour) => `الساعة ${hour}:00`} />
                        <Area
                          type="monotone"
                          dataKey="reservationCount"
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                          fillOpacity={0.6}
                          name="عدد الحجوزات"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Day of Week Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>تحليل أيام الأسبوع</CardTitle>
                  <CardDescription>الحجوزات وساعات الحجز حسب اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  {dayOfWeekLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dayOfWeek || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="reservationCount" fill={COLORS.teal} name="عدد الحجوزات" />
                        <Bar dataKey="totalDurationHours" fill={COLORS.pink} name="إجمالي الساعات" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Performance Metrics */}
          {performance && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                مقاييس الأداء
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">معدل الإكمال</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{performance.completionRate}%</div>
                    <p className="text-xs text-gray-500">من إجمالي الحجوزات</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">معدل الإلغاء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{performance.cancellationRate}%</div>
                    <p className="text-xs text-gray-500">من إجمالي الحجوزات</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">متوسط المهلة الزمنية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {performance.averageLeadTime.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500">ساعة (من الحجز للبدء)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">الحجوزات المكتملة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {performance.statusDistribution.completed}
                    </div>
                    <p className="text-xs text-gray-500">حجز مكتمل</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Customer Analytics */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              تحليل العملاء
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات العملاء</CardTitle>
                  <CardDescription>تحليل سلوك العملاء</CardDescription>
                </CardHeader>
                <CardContent>
                  {customersLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm font-medium">إجمالي العملاء</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {customers?.totalCustomers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium">عملاء جدد</span>
                        <span className="text-2xl font-bold text-green-600">
                          {customers?.newCustomers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="text-sm font-medium">عملاء عائدون</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {customers?.returningCustomers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <span className="text-sm font-medium">متوسط الحجوزات لكل عميل</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {customers?.averageReservationsPerCustomer?.toFixed(1) || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>أفضل العملاء</CardTitle>
                  <CardDescription>العملاء الأكثر نشاطاً</CardDescription>
                </CardHeader>
                <CardContent>
                  {customersLoading ? (
                    <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                  ) : (
                    <div className="space-y-4">
                      {(customers?.topCustomers || []).slice(0, 5).map((customer, index) => (
                        <div
                          key={customer.userId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{customer.userName}</p>
                              <p className="text-sm text-gray-500">{customer.reservationCount} حجز</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {customer.totalHours.toFixed(1)} ساعة
                            </p>
                            <p className="text-xs text-gray-500">إجمالي ساعات الحجز</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Forecast */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              التوقعات المستقبلية
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>توقعات الحجوزات</CardTitle>
                <CardDescription>توقعات الـ 7 أيام القادمة بناءً على آخر 30 يوم</CardDescription>
              </CardHeader>
              <CardContent>
                {forecastLoading ? (
                  <div className="h-[300px] flex items-center justify-center">جاري التحميل...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecast || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString("ar-SA")}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                                <p className="font-medium">
                                  {new Date(data.date).toLocaleDateString("ar-SA")}
                                </p>
                                <p className="text-sm text-blue-600">
                                  الحجوزات المتوقعة: {data.predictedReservations}
                                </p>
                                <p className="text-xs text-gray-500">
                                  مستوى الثقة:{" "}
                                  {data.confidence === "high"
                                    ? "عالي"
                                    : data.confidence === "medium"
                                      ? "متوسط"
                                      : "منخفض"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predictedReservations"
                        stroke={COLORS.purple}
                        strokeWidth={3}
                        name="الحجوزات المتوقعة"
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          const color =
                            payload.confidence === "high"
                              ? COLORS.success
                              : payload.confidence === "medium"
                                ? COLORS.warning
                                : COLORS.danger;
                          return <circle cx={cx} cy={cy} r={5} fill={color} />;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Location Capacity Status */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              حالة سعة المواقع
            </h2>
            <LocationCapacityStatus />
          </section>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}
