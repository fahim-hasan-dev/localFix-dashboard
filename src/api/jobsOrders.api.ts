import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import { mapAdminJob, mapAdminOrder } from "@/lib/mappers/mapJobOrder";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { JobLead, Order } from "@/types/common.types";

export interface JobsOrdersListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
  stage?: string;
}

function mapJobs(response: unknown): UnwrappedList<JobLead> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapAdminJob) };
}

function mapOrders(response: unknown): UnwrappedList<Order> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapAdminOrder) };
}

function mapSingleJob(response: unknown): JobLead {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapAdminJob(nested && typeof nested === "object" ? nested : data);
}

function mapSingleOrder(response: unknown): Order {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapAdminOrder(nested && typeof nested === "object" ? nested : data);
}

export const jobsOrdersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminJobs: build.query<UnwrappedList<JobLead>, JobsOrdersListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.admin.jobs}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          category: params?.category,
          status: params?.status,
        })}`,
        method: "GET",
      }),
      transformResponse: mapJobs,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Jobs" as const, id })),
              { type: "Jobs", id: "LIST" },
            ]
          : [{ type: "Jobs", id: "LIST" }],
    }),

    getAdminJobById: build.query<JobLead, string>({
      query: (id) => ({
        url: API_ENDPOINTS.admin.jobById(id),
        method: "GET",
      }),
      transformResponse: mapSingleJob,
      providesTags: (_r, _e, id) => [{ type: "Jobs", id }],
    }),

    getAdminOrders: build.query<UnwrappedList<Order>, JobsOrdersListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.admin.orders}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          category: params?.category,
          stage: params?.stage,
          status: params?.status,
        })}`,
        method: "GET",
      }),
      transformResponse: mapOrders,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getAdminOrderById: build.query<Order, string>({
      query: (id) => ({
        url: API_ENDPOINTS.admin.orderById(id),
        method: "GET",
      }),
      transformResponse: mapSingleOrder,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
  }),
});

export const {
  useGetAdminJobsQuery,
  useGetAdminJobByIdQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
} = jobsOrdersApi;
