import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  ArrowRight,
  Clock,
  Eye,
  TrendingUp,
  DollarSign,
  LifeBuoy,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminRevenueQuery,
  useGetAdminStatsQuery,
  useGetAdminUserGrowthQuery,
} from "@/api/overview.api";
import { useGetAdminOrdersQuery } from "@/api/jobsOrders.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/constants/routes";
import { buildChartScale, formatCompactNumber } from "@/lib/chartScale";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { getFulfillmentBadgeVariant } from "@/lib/statusBadge";
import { formatCurrency, formatShortId } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(String);

const RECENT_ORDERS_LIMIT = 5;

// SVG chart geometry (shared by both charts so axes line up)
const svgWidth = 600;
const svgHeight = 200;
const paddingLeft = 45;
const paddingRight = 18;
const paddingTop = 15;
const paddingBottom = 15;
const plotWidth = svgWidth - paddingLeft - paddingRight;
const plotHeight = svgHeight - paddingTop - paddingBottom;
const chartBottom = paddingTop + plotHeight;

// Smooth Cubic Bezier Spline Generator for Area/Line Chart
const getCurvePath = (pts: { x: number; y: number }[]) => {
  if (pts.length <= 1) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

const toTickY = (ratio: number) => paddingTop + (1 - ratio) * plotHeight;

const ChartPlaceholder: React.FC<{ message: string; tone?: "muted" | "error" }> = ({
  message,
  tone = "muted",
}) => (
  <div className="absolute inset-0 grid place-items-center pointer-events-none">
    <p
      className={`rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium ${
        tone === "error" ? "text-rose-600" : "text-muted"
      }`}
    >
      {message}
    </p>
  </div>
);

export const DashboardPage: React.FC = () => {
  const auditLogs = useAppSelector((state) => state.audit.logs);
  const navigate = useNavigate();

  const [incomeYear, setIncomeYear] = useState<string>(String(CURRENT_YEAR));
  const [userYear, setUserYear] = useState<string>(String(CURRENT_YEAR));
  const [activeIncomeHover, setActiveIncomeHover] = useState<number | null>(null);
  const [activeUserHover, setActiveUserHover] = useState<number | null>(null);
  const [selectedIncomeIndex, setSelectedIncomeIndex] = useState<number | null>(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  // --- API data ---
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useGetAdminStatsQuery();

  const {
    currentData: revenueSeries,
    isFetching: isRevenueFetching,
    error: revenueError,
  } = useGetAdminRevenueQuery({ year: incomeYear });

  const {
    currentData: userGrowthSeries,
    isFetching: isUserGrowthFetching,
    error: userGrowthError,
  } = useGetAdminUserGrowthQuery({ year: userYear });

  const {
    data: recentOrdersData,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetAdminOrdersQuery({ limit: RECENT_ORDERS_LIMIT });

  const orders = recentOrdersData?.items ?? [];

  // --- KPI values ---
  const kpiText = (value: number | undefined, format: (n: number) => string = String) =>
    isStatsLoading || value === undefined ? "—" : format(value);

  // --- Revenue chart ---
  const activeIncomeData = revenueSeries ?? [];
  const totalYearIncome = activeIncomeData.reduce((sum, m) => sum + m.revenue, 0);
  const maxRevenue = activeIncomeData.reduce((max, m) => Math.max(max, m.revenue), 0);
  const incomeScale = buildChartScale(maxRevenue, {
    minMax: 1000,
    formatLabel: (v) => `$${formatCompactNumber(v)}`,
  });

  const incomeChartPoints = activeIncomeData.map((d, i) => {
    const x =
      activeIncomeData.length > 1
        ? paddingLeft + (i / (activeIncomeData.length - 1)) * plotWidth
        : paddingLeft + plotWidth / 2;
    const y = paddingTop + (1 - d.revenue / incomeScale.max) * plotHeight;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, ...d };
  });

  const incomeLinePath = getCurvePath(incomeChartPoints);
  const incomeAreaPath =
    incomeChartPoints.length > 1
      ? `${incomeLinePath} L ${incomeChartPoints[incomeChartPoints.length - 1].x} ${chartBottom} L ${incomeChartPoints[0].x} ${chartBottom} Z`
      : "";

  const activePointIndex = selectedIncomeIndex ?? activeIncomeHover;
  const activePt = activePointIndex !== null ? incomeChartPoints[activePointIndex] ?? null : null;

  const yTicks = incomeScale.ticks.map((t) => ({ label: t.label, y: toTickY(t.ratio) }));

  const incomeMessage = isRevenueFetching
    ? { text: "Loading revenue…", tone: "muted" as const }
    : revenueError
    ? { text: getApiErrorMessage(revenueError, "Could not load revenue."), tone: "error" as const }
    : activeIncomeData.length === 0
    ? { text: `No revenue data for ${incomeYear}`, tone: "muted" as const }
    : null;

  // --- User growth chart ---
  const activeUserData = userGrowthSeries ?? [];
  const latestUserPoint = activeUserData[activeUserData.length - 1];
  const totalYearUsers = latestUserPoint?.total ?? 0;
  const latestHomeowners = latestUserPoint?.homeowners ?? 0;
  const latestPros = latestUserPoint?.pros ?? 0;
  const maxUsers = activeUserData.reduce((max, m) => Math.max(max, m.total), 0);
  const userScale = buildChartScale(maxUsers, { minMax: 4 });
  const userMaxScale = userScale.max;
  const userYTicks = userScale.ticks.map((t) => ({ label: t.label, y: toTickY(t.ratio) }));

  const activeUserIndex = selectedUserIndex ?? activeUserHover;
  const activeUserPt = activeUserIndex !== null ? activeUserData[activeUserIndex] ?? null : null;

  const userMessage = isUserGrowthFetching
    ? { text: "Loading user growth…", tone: "muted" as const }
    : userGrowthError
    ? { text: getApiErrorMessage(userGrowthError, "Could not load user growth."), tone: "error" as const }
    : activeUserData.length === 0
    ? { text: `No user data for ${userYear}`, tone: "muted" as const }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview of repairs, users, and platform metrics."
      />



      {/* Core Summary Cards - 4-Column Gold Standard KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {/* Card 1: Subscription Revenue (MRR) */}
        <Link to={ROUTES.SUBSCRIPTIONS}>
          <Card className="p-5 hover:border-emerald-400 border-slate-200/80 transition-all cursor-pointer group bg-white shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-emerald-700 transition-colors">
                Subscription Revenue
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-title tracking-tight">
                {kpiText(stats?.subscriptionRevenue, formatCurrency)}
                <span className="text-sm font-semibold text-muted">/mo</span>
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 2: Registered Community (Users) */}
        <Link to={ROUTES.USERS.LIST}>
          <Card className="p-5 hover:border-blue-400 border-slate-200/80 transition-all cursor-pointer group bg-white shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-primary transition-colors">
                Total Users
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-title tracking-tight">
                {kpiText(stats?.totalUsers, (n) => n.toLocaleString())}
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 3: Active Orders */}
        <Link to={ROUTES.ORDERS.LIST}>
          <Card className="p-5 hover:border-indigo-400 border-slate-200/80 transition-all cursor-pointer group bg-white shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-indigo-700 transition-colors">
                Active Orders
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Briefcase className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-title tracking-tight">
                {kpiText(stats?.activeOrders, (n) => n.toLocaleString())}
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 4: Support Tickets (Operational Support Queue) */}
        <Link to={ROUTES.TICKETS.LIST}>
          <Card className="p-5 hover:border-rose-400 border-slate-200/80 transition-all cursor-pointer group bg-white shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-rose-700 transition-colors">
                Support Tickets
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <LifeBuoy className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-title tracking-tight">
                  {kpiText(stats?.openTickets, (n) => n.toLocaleString())}
                </p>
                {(stats?.openTickets ?? 0) > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    Open Queue
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {statsError && (
        <p className="text-xs font-medium text-rose-600">
          {getApiErrorMessage(statsError, "Could not load dashboard stats.")}
        </p>
      )}

      {/* FULL-YEAR PERFORMANCE CHARTS: INCOME GROWTH & USER GROWTH */}
      <div className="grid gap-6 lg:grid-cols-2 min-w-0">
        {/* CHART 1: REVENUE OVER TIME (Smooth Curved Spline with Brand Styling) */}
        <Card className="p-5 flex flex-col justify-between h-full bg-white border border-slate-200/90 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <DollarSign className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-semibold text-title">
                  Revenue Over Time
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Platform revenue overview
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={incomeYear}
                onChange={(e) => {
                  setIncomeYear(e.target.value);
                  setSelectedIncomeIndex(null);
                }}
                className="text-xs font-semibold bg-white border border-line rounded-lg px-2.5 py-1 text-title outline-none focus:border-blue-600 cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Plot Area */}
          <div className="relative pt-2 my-auto">
            {/* SVG Visual Presentation */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-60 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#2563EB" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Gridlines and Y-Axis Labels */}
              {yTicks.map((tick) => (
                <g key={tick.label}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={svgWidth - paddingRight}
                    y2={tick.y}
                    stroke="#F1F5F9"
                    strokeWidth="1.25"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="Inter, sans-serif"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Smooth Area Gradient Fill */}
              {incomeAreaPath && (
                <path d={incomeAreaPath} fill="url(#revenueGradient)" />
              )}

              {/* Smooth Spline Curve Stroke */}
              {incomeLinePath && (
                <path
                  d={incomeLinePath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Vertical Dashed Guide Line for Active Point */}
              {activePt && (
                <line
                  x1={activePt.x}
                  y1={activePt.y}
                  x2={activePt.x}
                  y2={chartBottom}
                  stroke="#2563EB"
                  strokeOpacity="0.5"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
              )}

              {/* Active Dot Marker */}
              {activePt && (
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="5.5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="filter drop-shadow-sm transition-all duration-150"
                />
              )}
            </svg>

            {incomeMessage && (
              <ChartPlaceholder message={incomeMessage.text} tone={incomeMessage.tone} />
            )}

            {/* Floating Card Tooltip */}
            {activePt && activePointIndex !== null && (
              <div
                className="absolute pointer-events-none transition-all duration-150 ease-out z-20"
                style={{
                  left: `${(activePt.x / svgWidth) * 100}%`,
                  top: `${(activePt.y / svgHeight) * 100}%`,
                  transform: `translate(${
                    activePointIndex >= incomeChartPoints.length - 2
                      ? "-88%"
                      : activePointIndex <= 1
                      ? "-12%"
                      : "-50%"
                  }, -128%)`,
                }}
              >
                <div className="bg-white border border-slate-200/90 rounded-xl shadow-lg px-3 py-2 text-left min-w-[110px]">
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">
                    {activePt.month} {incomeYear}
                  </p>
                  <p className="text-sm font-bold text-slate-900 tracking-tight mt-0.5 font-sans">
                    {formatCurrency(activePt.revenue)}
                  </p>
                </div>
              </div>
            )}

            {/* Invisible Interactive Columns for Mouse Hover & Click */}
            <div
              className="absolute inset-0 flex"
              style={{
                left: `${(paddingLeft / svgWidth) * 100}%`,
                right: `${(paddingRight / svgWidth) * 100}%`,
              }}
            >
              {incomeChartPoints.map((item, idx) => (
                <div
                  key={item.month}
                  className="flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setActiveIncomeHover(idx)}
                  onMouseLeave={() => setActiveIncomeHover(null)}
                  onClick={() => setSelectedIncomeIndex(selectedIncomeIndex === idx ? null : idx)}
                />
              ))}
            </div>
          </div>

          {/* Unified HTML X-Axis Month Row (Exact Same Alignment & Text Size as Right Chart) */}
          <div
            className="flex items-center text-center mt-2.5"
            style={{
              paddingLeft: `${(paddingLeft / svgWidth) * 100}%`,
              paddingRight: `${(paddingRight / svgWidth) * 100}%`,
            }}
          >
            {incomeChartPoints.map((pt, idx) => {
              const isSelected = activePointIndex === idx;
              return (
                <div key={pt.month} className="flex-1 min-w-0">
                  <span
                    className={`text-[9px] min-[400px]:text-[10px] sm:text-xs block transition-colors cursor-pointer truncate tracking-tight ${
                      isSelected
                        ? "text-blue-600 font-bold"
                        : "text-slate-400 font-medium hover:text-slate-600"
                    }`}
                    onClick={() => setSelectedIncomeIndex(selectedIncomeIndex === idx ? null : idx)}
                  >
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Legend & Annual Total */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3.5 border-t border-line/60 mt-3 text-xs text-muted gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              <span className="font-medium text-slate-600">Platform Revenue</span>
            </div>
            <span className="font-semibold text-title">Annual Total: {formatCurrency(totalYearIncome)}</span>
          </div>
        </Card>

        {/* CHART 2: USER GROWTH */}
        <Card className="p-5 flex flex-col justify-between h-full bg-white border border-slate-200/90 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-semibold text-title">
                  User Growth
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Cumulative registrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={userYear}
                onChange={(e) => {
                  setUserYear(e.target.value);
                  setSelectedUserIndex(null);
                }}
                className="text-xs font-semibold bg-white border border-line rounded-lg px-2.5 py-1 text-title outline-none focus:border-blue-600 cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Plot Area (SVG Coordinates Perfectly Aligned with Left Chart) */}
          <div className="relative pt-2 my-auto">
            {/* SVG Visual Presentation */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-60 overflow-visible select-none"
            >
              {/* Horizontal Reference Gridlines and Y-Axis Labels (Identical alignment & typography as Chart 1) */}
              {userYTicks.map((tick) => (
                <g key={tick.label}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={svgWidth - paddingRight}
                    y2={tick.y}
                    stroke="#F1F5F9"
                    strokeWidth="1.25"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="Inter, sans-serif"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Stacked Growth Bars */}
              {activeUserData.map((item, idx) => {
                const colWidth = plotWidth / activeUserData.length;
                const barWidth = 24;
                const cx = paddingLeft + (idx + 0.5) * colWidth;
                const x = cx - barWidth / 2;
                const totalH = Math.max((item.total / userMaxScale) * plotHeight, 3);
                const prosH = (item.pros / userMaxScale) * plotHeight;
                const homeownersH = Math.max(totalH - prosH, 0);
                const topY = chartBottom - totalH;
                const isSelected = selectedUserIndex === idx;
                const isHovered = activeUserHover === idx;
                const isActive = isSelected || (selectedUserIndex === null && isHovered);

                return (
                  <g key={item.month}>
                    {/* Active Selection Glow Ring */}
                    {isActive && (
                      <rect
                        x={x - 2.5}
                        y={topY - 2.5}
                        width={barWidth + 5}
                        height={totalH + 2.5}
                        rx="5"
                        ry="5"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeOpacity="0.8"
                        className="transition-all duration-150"
                      />
                    )}

                    {/* Stacked Bar with Rounded Top Corner */}
                    <clipPath id={`user-bar-clip-${item.month}-${idx}`}>
                      <rect
                        x={x}
                        y={topY}
                        width={barWidth}
                        height={totalH}
                        rx="3.5"
                        ry="3.5"
                      />
                    </clipPath>
                    <g
                      clipPath={`url(#user-bar-clip-${item.month}-${idx})`}
                      className="transition-opacity duration-150 hover:opacity-90"
                    >
                      {/* Homeowners segment (bottom, Blue) */}
                      <rect
                        x={x}
                        y={chartBottom - homeownersH}
                        width={barWidth}
                        height={homeownersH}
                        fill="#2563EB"
                      />
                      {/* Verified Pros segment (top, Sky Blue) */}
                      <rect
                        x={x}
                        y={topY}
                        width={barWidth}
                        height={prosH}
                        fill="#38BDF8"
                      />
                    </g>
                  </g>
                );
              })}
            </svg>

            {userMessage && (
              <ChartPlaceholder message={userMessage.text} tone={userMessage.tone} />
            )}

            {/* Floating Card Tooltip (Positions dynamically right over the active bar) */}
            {activeUserIndex !== null && activeUserPt && (
              <div
                className="absolute pointer-events-none transition-all duration-150 ease-out z-20"
                style={{
                  left: `${((paddingLeft + (activeUserIndex + 0.5) * (plotWidth / activeUserData.length)) / svgWidth) * 100}%`,
                  top: `${((chartBottom - (activeUserPt.total / userMaxScale) * plotHeight) / svgHeight) * 100}%`,
                  transform: `translate(${
                    activeUserIndex >= activeUserData.length - 2
                      ? "-85%"
                      : activeUserIndex <= 1
                      ? "-15%"
                      : "-50%"
                  }, -118%)`,
                }}
              >
                <div className="relative bg-white text-slate-800 text-xs p-3 rounded-xl shadow-lg border border-slate-200/90 min-w-[170px]">
                  {/* Month & Total Header */}
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-500 text-xs">
                      {activeUserPt.month} {userYear}
                    </span>
                    <span className="font-bold text-slate-900 text-[11px] bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full font-sans">
                      {activeUserPt.total.toLocaleString()}
                    </span>
                  </div>

                  {/* Breakdown Rows with Clean Indicator Dots */}
                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                        <span className="text-slate-600 font-medium">Homeowners</span>
                      </div>
                      <span className="font-bold text-slate-900 font-sans">
                        {activeUserPt.homeowners.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-sky-400 inline-block" />
                        <span className="text-slate-600 font-medium">Verified Pros</span>
                      </div>
                      <span className="font-bold text-slate-900 font-sans">
                        {activeUserPt.pros.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Downward Caret Arrow */}
                  <div
                    className={`absolute -bottom-1 w-2.5 h-2.5 bg-white border-r border-b border-slate-200/90 rotate-45 ${
                      activeUserIndex <= 1
                        ? "left-6"
                        : activeUserIndex >= activeUserData.length - 2
                        ? "right-6"
                        : "left-1/2 -translate-x-1/2"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Invisible Interactive Columns for Mouse Hover & Click */}
            <div
              className="absolute inset-0 flex"
              style={{
                left: `${(paddingLeft / svgWidth) * 100}%`,
                right: `${(paddingRight / svgWidth) * 100}%`,
              }}
            >
              {activeUserData.map((item, idx) => (
                <div
                  key={item.month}
                  className="flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setActiveUserHover(idx)}
                  onMouseLeave={() => setActiveUserHover(null)}
                  onClick={() => setSelectedUserIndex(selectedUserIndex === idx ? null : idx)}
                />
              ))}
            </div>
          </div>

          {/* Unified HTML X-Axis Month Row (Exact Same Alignment & Text Size as Left Chart) */}
          <div
            className="flex items-center text-center mt-2.5"
            style={{
              paddingLeft: `${(paddingLeft / svgWidth) * 100}%`,
              paddingRight: `${(paddingRight / svgWidth) * 100}%`,
            }}
          >
            {activeUserData.map((item, idx) => {
              const isSelected = activeUserIndex === idx;
              return (
                <div key={item.month} className="flex-1 min-w-0">
                  <span
                    className={`text-[9px] min-[400px]:text-[10px] sm:text-xs block transition-colors cursor-pointer truncate tracking-tight ${
                      isSelected
                        ? "text-blue-600 font-bold"
                        : "text-slate-400 font-medium hover:text-slate-600"
                    }`}
                    onClick={() => setSelectedUserIndex(selectedUserIndex === idx ? null : idx)}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Legend & Total Users (Symmetrical with Left Card) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3.5 border-t border-line/60 mt-3 text-xs text-muted gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                <span className="font-medium text-slate-600">Homeowners ({latestHomeowners.toLocaleString()})</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400 inline-block" />
                <span className="font-medium text-slate-600">Verified Pros ({latestPros.toLocaleString()})</span>
              </span>
            </div>
            <span className="font-semibold text-title">Total: {totalYearUsers.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Main Content: Clean Recent Orders & Audit Trail */}
      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {/* Left 2 Cols: Minimal Recent Orders Table - STRICTLY 1 LINE, NO CUSTOMER COLUMN */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <Card className="p-0 overflow-hidden min-w-0">
            <div className="flex items-center justify-between p-5 border-b border-line/70">
              <h2 className="text-base font-semibold text-title">
                Recent Orders
              </h2>
              <Link
                to={ROUTES.ORDERS.LIST}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span>
                  View all
                  {recentOrdersData ? ` (${recentOrdersData.total})` : ""}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line/70 bg-slate-50/60 text-xs font-medium text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-5 whitespace-nowrap">Job ID</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Service</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-5 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 text-copy">
                  {isOrdersLoading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-xs text-muted">
                        Loading recent orders…
                      </td>
                    </tr>
                  ) : ordersError ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-xs">
                        <p className="font-medium text-rose-600">
                          {getApiErrorMessage(ordersError, "Could not load recent orders.")}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => refetchOrders()}
                        >
                          Retry
                        </Button>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-xs text-muted">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(ROUTES.ORDERS.DETAIL(order.id))}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-5 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">
                        {formatShortId(order.id)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-title text-xs group-hover:text-primary transition-colors whitespace-nowrap">
                        <span
                          className="truncate max-w-[320px] block"
                          title={order.jobTitle}
                        >
                          {order.jobTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block whitespace-nowrap">
                          <Badge
                            variant={getFulfillmentBadgeVariant(order.fulfillmentStatus)}
                            dot
                          >
                            {order.fulfillmentStatus.replace("_", " ")}
                          </Badge>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium whitespace-nowrap border-0 shadow-none cursor-pointer rounded-lg"
                          onClick={() => navigate(ROUTES.ORDERS.DETAIL(order.id))}
                        >
                          <Eye className="h-3 w-3 mr-1 text-slate-400 group-hover:text-blue-600" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Col: Minimal Recent Audit Trail */}
        <div className="space-y-4 min-w-0">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-line/70">
              <h3 className="text-sm font-semibold text-title flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Recent Admin Activity</span>
              </h3>
              <Badge variant="neutral">{auditLogs.length}</Badge>
            </div>

            <div className="mt-2 divide-y divide-slate-100">
              {auditLogs.length === 0 && (
                <p className="py-6 text-center text-xs text-muted">
                  No recent admin activity yet.
                </p>
              )}
              {auditLogs.slice(0, 5).map((log) => {
                const isApproval = log.action.includes("APPROVED") || log.action.includes("VERIFIED");
                const isBan = log.action.includes("BANNED") || log.action.includes("DELETED");
                const isDispute = log.action.includes("DISPUTE") || log.action.includes("WARNING");
                const bulletColor = isApproval
                  ? "bg-blue-600"
                  : isBan
                  ? "bg-rose-500"
                  : isDispute
                  ? "bg-amber-500"
                  : "bg-emerald-600";

                return (
                  <div key={log.id} className="py-2.5 flex items-start gap-2.5 group">
                    <span className={`h-2 w-2 rounded-full ${bulletColor} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-title text-xs">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-xs text-muted font-medium shrink-0">
                          {log.timestamp.slice(11, 16)}
                        </span>
                      </div>
                      <p className="text-muted text-xs truncate mt-0.5">
                        {log.entityTitle} • {log.executedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
