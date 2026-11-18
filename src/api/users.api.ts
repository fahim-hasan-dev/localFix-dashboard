import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { buildQuery } from "@/lib/buildQuery";
import { mapClearance } from "@/lib/mappers/mapClearance";
import {
  mapPlatformUser,
  toApiRole,
  toApiStatus,
} from "@/lib/mappers/mapPlatformUser";
import { unwrapList, type UnwrappedList } from "@/lib/unwrapList";
import type { ProClearance, User } from "@/types/common.types";

export interface UsersListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: "all" | "homeowner" | "pro";
  status?: "all" | "active" | "banned" | "pending_clearance";
}

export interface ClearancesListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

function mapUserList(response: unknown): UnwrappedList<User> {
  const list = unwrapList(response);
  return {
    ...list,
    items: list.items.map(mapPlatformUser),
  };
}

function mapClearanceList(response: unknown): UnwrappedList<ProClearance> {
  const list = unwrapList(response);
  return {
    ...list,
    items: list.items.map(mapClearance),
  };
}

function mapSingleUser(response: unknown): User {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapPlatformUser(nested && typeof nested === "object" ? nested : data);
}

function mapSingleClearance(response: unknown): ProClearance {
  const data = (response as { data?: unknown })?.data ?? response;
  const nested = (data as { data?: unknown })?.data;
  return mapClearance(nested && typeof nested === "object" ? nested : data);
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UnwrappedList<User>, UsersListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.users.root}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
          role: params?.role ? toApiRole(params.role) : undefined,
          status: params?.status ? toApiStatus(params.status) : undefined,
        })}`,
        method: "GET",
      }),
      transformResponse: mapUserList,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: build.query<User, string>({
      query: (id) => ({
        url: API_ENDPOINTS.users.byId(id),
        method: "GET",
      }),
      transformResponse: mapSingleUser,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),

    updateUserStatus: build.mutation<
      unknown,
      { id: string; status: "active" | "inactive" }
    >({
      query: ({ id, status }) => ({
        url: API_ENDPOINTS.users.status(id),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Clearance", id: "LIST" },
      ],
    }),

    deleteUser: build.mutation<unknown, string>({
      query: (id) => ({
        url: API_ENDPOINTS.users.byId(id),
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    getClearances: build.query<UnwrappedList<ProClearance>, ClearancesListParams | void>({
      query: (params) => ({
        url: `${API_ENDPOINTS.users.clearances}${buildQuery({
          page: params?.page,
          limit: params?.limit,
          searchTerm: params?.searchTerm,
        })}`,
        method: "GET",
      }),
      transformResponse: mapClearanceList,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Clearance" as const, id })),
              { type: "Clearance", id: "LIST" },
            ]
          : [{ type: "Clearance", id: "LIST" }],
    }),

    getClearanceById: build.query<ProClearance, string>({
      query: (id) => ({
        url: API_ENDPOINTS.users.clearanceById(id),
        method: "GET",
      }),
      transformResponse: mapSingleClearance,
      providesTags: (_r, _e, id) => [{ type: "Clearance", id }],
    }),

    updateApprovalStatus: build.mutation<
      unknown,
      { id: string; approvalStatus: "approved" | "rejected" }
    >({
      query: ({ id, approvalStatus }) => ({
        url: API_ENDPOINTS.users.approvalStatus(id),
        method: "PATCH",
        body: { approvalStatus },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Clearance", id },
        { type: "Clearance", id: "LIST" },
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetClearancesQuery,
  useGetClearanceByIdQuery,
  useUpdateApprovalStatusMutation,
} = usersApi;
