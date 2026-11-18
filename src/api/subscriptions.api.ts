import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import {
  mapPackage,
  toPackageWriteBody,
  type PackageWritePayload,
} from "@/lib/mappers/mapPackage";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { SubscriptionPackage } from "@/types/common.types";

export type PackageFormInput = Parameters<typeof toPackageWriteBody>[0];

function mapPackageList(response: unknown): UnwrappedList<SubscriptionPackage> {
  const list = unwrapList(response);
  return { ...list, items: list.items.map(mapPackage) };
}

function mapOnePackage(response: unknown): SubscriptionPackage {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapPackage(nested && typeof nested === "object" ? nested : data);
}

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPackages: build.query<
      UnwrappedList<SubscriptionPackage>,
      { billingCycle?: string; isActive?: boolean | string } | void
    >({
      query: (params) => ({
        url: `${API_ENDPOINTS.packages.root}${buildQuery({
          billingCycle: params?.billingCycle,
          isActive:
            params?.isActive === undefined || params?.isActive === null
              ? undefined
              : String(params.isActive),
        })}`,
        method: "GET",
      }),
      transformResponse: mapPackageList,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Subscriptions" as const, id })),
              { type: "Subscriptions", id: "LIST" },
            ]
          : [{ type: "Subscriptions", id: "LIST" }],
    }),

    getPackageById: build.query<SubscriptionPackage, string>({
      query: (id) => ({
        url: API_ENDPOINTS.packages.byId(id),
        method: "GET",
      }),
      transformResponse: mapOnePackage,
      providesTags: (_r, _e, id) => [{ type: "Subscriptions", id }],
    }),

    createPackage: build.mutation<SubscriptionPackage, PackageFormInput>({
      query: (input) => ({
        url: API_ENDPOINTS.packages.root,
        method: "POST",
        body: toPackageWriteBody(input),
      }),
      transformResponse: mapOnePackage,
      invalidatesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),

    updatePackage: build.mutation<
      SubscriptionPackage,
      { id: string; data: PackageFormInput | Partial<PackageWritePayload> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.packages.byId(id),
        method: "PATCH",
        body:
          "billingInterval" in data
            ? toPackageWriteBody(data as PackageFormInput)
            : data,
      }),
      transformResponse: mapOnePackage,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Subscriptions", id },
        { type: "Subscriptions", id: "LIST" },
      ],
    }),

    deletePackage: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.packages.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),

    getSubscriptions: build.query<UnwrappedList<unknown>, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.subscriptions.root}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
        })}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "Subscriptions", id: "ACTIVE" }],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useGetSubscriptionsQuery,
} = subscriptionsApi;
