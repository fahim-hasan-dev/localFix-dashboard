import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapOverviewStats,
  mapRevenueSeries,
  mapUserGrowthSeries,
  type OverviewStats,
  type RevenuePoint,
  type UserGrowthPoint,
} from "@/lib/mappers/mapOverview";

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminStats: build.query<OverviewStats, void>({
      query: () => ({ url: API_ENDPOINTS.admin.stats, method: "GET" }),
      transformResponse: (response: unknown) => mapOverviewStats(response),
      providesTags: ["Audit"],
    }),

    getAdminRevenue: build.query<RevenuePoint[], { year?: string | number } | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.admin.revenue}${buildQuery({
          year: params && "year" in (params || {}) ? params?.year : undefined,
        })}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => mapRevenueSeries(response),
      providesTags: ["Audit"],
    }),

    getAdminUserGrowth: build.query<
      UserGrowthPoint[],
      { year?: string | number } | void
    >({
      query: (params) => ({
        url: `${API_ENDPOINTS.admin.userGrowth}${buildQuery({
          year: params && "year" in (params || {}) ? params?.year : undefined,
        })}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => mapUserGrowthSeries(response),
      providesTags: ["Audit"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminRevenueQuery,
  useGetAdminUserGrowthQuery,
} = overviewApi;
