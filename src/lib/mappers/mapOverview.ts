import { pickNumber, pickString, unwrapList } from "@/lib/unwrapList";

export interface OverviewStats {
  subscriptionRevenue: number;
  totalUsers: number;
  activeOrders: number;
  openTickets: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface UserGrowthPoint {
  month: string;
  homeowners: number;
  pros: number;
  total: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(raw: unknown, index: number): string {
  const label = pickString(raw, ["month", "label", "name", "monthName"]);
  if (label) {
    const short = label.slice(0, 3);
    return short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();
  }
  const monthNum = Number(pickString(raw, ["monthNumber", "monthIndex", "_id"]));
  if (monthNum >= 1 && monthNum <= 12) return MONTHS[monthNum - 1];
  return MONTHS[index] ?? `M${index + 1}`;
}

export function mapOverviewStats(response: unknown): OverviewStats {
  const root = (response as { data?: unknown })?.data ?? response;
  return {
    subscriptionRevenue: pickNumber(root, [
      "subscriptionRevenue",
      "monthlyRevenue",
      "mrr",
      "revenue",
      "totalRevenue",
    ]),
    totalUsers: pickNumber(root, ["totalUsers", "users", "userCount", "totalUser"]),
    activeOrders: pickNumber(root, [
      "activeOrders",
      "orders",
      "totalOrders",
      "activeBookings",
    ]),
    openTickets: pickNumber(root, [
      "openTickets",
      "supportTickets",
      "tickets",
      "openSupportTickets",
    ]),
  };
}

export function mapRevenueSeries(response: unknown): RevenuePoint[] {
  const list = unwrapList<unknown>(response).items;
  const rawSeries =
    list.length > 0
      ? list
      : ((response as { data?: unknown })?.data as unknown);

  const rows = Array.isArray(rawSeries)
    ? rawSeries
    : Array.isArray((rawSeries as { months?: unknown[] })?.months)
      ? ((rawSeries as { months: unknown[] }).months)
      : Array.isArray((rawSeries as { series?: unknown[] })?.series)
        ? ((rawSeries as { series: unknown[] }).series)
        : [];

  return rows.map((row, index) => ({
    month: monthLabel(row, index),
    revenue: pickNumber(row, ["revenue", "amount", "total", "income"]),
    orders: pickNumber(row, ["orders", "orderCount", "bookings", "count"]),
  }));
}

export function mapUserGrowthSeries(response: unknown): UserGrowthPoint[] {
  const list = unwrapList<unknown>(response).items;
  const rawSeries =
    list.length > 0
      ? list
      : ((response as { data?: unknown })?.data as unknown);

  const rows = Array.isArray(rawSeries)
    ? rawSeries
    : Array.isArray((rawSeries as { months?: unknown[] })?.months)
      ? ((rawSeries as { months: unknown[] }).months)
      : Array.isArray((rawSeries as { series?: unknown[] })?.series)
        ? ((rawSeries as { series: unknown[] }).series)
        : [];

  return rows.map((row, index) => {
    const homeowners = pickNumber(row, [
      "homeowners",
      "homeOwners",
      "home_owner",
      "homeOwnerCount",
    ]);
    const pros = pickNumber(row, ["pros", "professionals", "professional", "proCount"]);
    const total = pickNumber(row, ["total", "totalUsers", "count"], homeowners + pros);
    return {
      month: monthLabel(row, index),
      homeowners,
      pros,
      total: total || homeowners + pros,
    };
  });
}
